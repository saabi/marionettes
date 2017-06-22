/**
 * Adapted from WebGL framework by Florian Boesch - @pyalot
 * https://github.com/pyalot/soft-shadow-mapping/blob/master/framework.coffee
 */

declare global {
    interface Document {
        readonly mozFullScreenEnabled: boolean;
        readonly msFullscreenEnabled: boolean;
    }
    interface HTMLElement {
        mozRequestFullScreen(): void;
        msRequestFullscreen(): void;
    } 
}

export class Canvas {

    elem: HTMLCanvasElement; 
    width: number;
    height: number;

    bfs: HTMLButtonElement;

	constructor(container:string) {

		this.elem = <HTMLCanvasElement>document.getElementById(container);
		this.width = 0;
		this.height = 0;

	}

	enableFullscreen ( style:CSSStyleDeclaration ) {

		if (
			document.fullscreenEnabled ||
			document.webkitFullscreenEnabled ||
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
		) {
			this.bfs = document.createElement("button");
			this.bfs.appendChild(document.createTextNode("Fullscreen"));
			this.elem.parentElement.appendChild(this.bfs);
			for (let s in style) this.bfs.style[s] = style[s];
			this.bfs.addEventListener('click', e => {
				e.preventDefault();
				this.requestFullscreen();
			});
		}

	}

	requestFullscreen() {

		if (this.elem.requestFullscreen) {
			this.elem.requestFullscreen();
		} else if (this.elem.webkitRequestFullscreen) {
			this.elem.webkitRequestFullscreen();
		} else if (this.elem.mozRequestFullScreen) {
			this.elem.mozRequestFullScreen();
		} else if (this.elem.msRequestFullscreen) {
			this.elem.msRequestFullscreen();
		}

	}

}

export class Pointer {
    x: number;
    y: number;
    z: number;
    xold: number;
    yold: number;
    zold: number;
    isDown: boolean;
    canvas: Canvas;

	constructor ( canvas: Canvas ) {

		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.xold = 0;
		this.yold = 0;
		this.zold = 0;
		this.isDown = false;
		this.canvas = canvas;

		window.addEventListener('mousemove', e => this.move(e), false);
		canvas.elem.addEventListener('touchmove', e => this.move(e), false);
		window.addEventListener('mousedown', e => this.down(e), false);
		window.addEventListener('touchstart', e => this.down(e), false);
		window.addEventListener('mouseup', e => this.up(e), false);
		window.addEventListener('touchend', e => this.up(e), false);
		window.addEventListener('wheel', e => this.wheel(e), false);

	}

	down ( e: Event ) {

		if (e.target !== this.canvas.elem) return;
		this.move(e);
		this.xold = this.x;
		this.yold = this.y;
		this.isDown = true;

	}

	up ( e: Event ) {

		this.isDown = false;

	}

	move  ( e: Event ) {

        //if (typeof e === 'TouchEvent')
		const touchMode = e.targetTouches;
		let pointer = null;
		if (touchMode) {
			e.preventDefault();
			if (touchMode.length > 1) {
				const dx = touchMode[0].clientX - touchMode[1].clientX;
				const dy = touchMode[0].clientY - touchMode[1].clientY;
				const d = dx * dx + dy * dy;
				this.z += (d > this.zold) ? -0.2 : 0.2;
				this.zold = d;
				return;
			}
			pointer = touchMode[0];
		} else pointer = e;
		this.x = pointer.clientX;
		this.y = pointer.clientY;

	}

	wheel ( e: Event ) {

		e.preventDefault();
		this.z += e.deltaY > 0 ? -1 : 1;

	}

}

export interface VertexUnit {
    enabled: boolean;
    drawable: Drawable;
    idx: number;
}

export class WebGL {
    canvas: Canvas;
    gl: WebGLRenderingContext;

    width: number;
    height: number;
    aspect: number;
    //textureUnits: [];
    vertexUnits: VertexUnit[];
    currentShader;

	constructor(canvas: Canvas, options: any) {

		this.canvas = canvas;
		this.gl = this.canvas.elem.getContext("webgl", options);
		if (!this.gl) this.gl = this.canvas.elem.getContext("experimental-webgl", options);
		if (!this.gl) throw new Error('This browser does not support WebGL');
		this.width = 0;
		this.height = 0;
		this.aspect = 0;
        /*
		this.textureUnits = [];
		for (let i = 0; i < 16; ++i) {
			this.textureUnits.push(null);
		}
        */
		this.vertexUnits = [];
		for (let i = 0; i < 16; ++i) {
			this.vertexUnits.push({
				enabled: false,
				drawable: null,
				idx: null
			});
		}
		this.currentShader = null;

	}

	getExtension(name) {

		const ext = this.gl.getExtension(name);
		if (!ext) {
			throw new Error('WebGL Extension not supported: ' + name);
		}
		return ext;

	}

	adjustSize() {

		const canvasWidth = (this.canvas.elem.offsetWidth * 1) || 2;
		const canvasHeight = (this.canvas.elem.offsetHeight * 1) || 2;
		if (this.width !== canvasWidth || this.height !== canvasHeight) {
			this.width = this.canvas.width = this.canvas.elem.width = canvasWidth;
			this.height = this.canvas.height = this.canvas.elem.height = canvasHeight;
			this.aspect = this.width / this.height;
		}
		return this;

	}

	viewport(left = 0, top = 0, width = this.width, height = this.height) {

		this.gl.viewport(left, top, width, height);
		return this;

	}

	cullFace(value = true) {

		if (value) {
			this.gl.enable(this.gl.CULL_FACE);
		} else {
			this.gl.disable(this.gl.CULL_FACE);
		}
		return this;

	}

	clearColor(r = 0, g = 0, b = 0, a = 1) {

		this.gl.clearColor(r, g, b, a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		return this;

	}

	clearDepth(depth = 1) {

		this.gl.clearDepth(depth);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
		return this;

	}

	depthTest(value = true) {

		if (value) {
			this.gl.enable(this.gl.DEPTH_TEST);
		} else {
			this.gl.disable(this.gl.DEPTH_TEST);
		}
		return this;

	}
    /*
	texture(params) {
		return new Texture(this, params);
	}

	framebuffer() {
		return new Framebuffer(this);
	}

	depthbuffer() {
		return new Depthbuffer(this);
	}
    */
	shader(params) {
		return new Shader(this, params);
	}

	drawable(params) {
		return new Drawable(this, params);
	}
    /*
	filter(size, filter) {
		return new Filter(this, size, filter);
	}
    */
	vec3(x = 0, y = 0, z = 0) {
		return new Vec3(x, y, z);
	}

    /*
	mat3(data) {
		return new Mat3(data);
	}

	mat4(data) {
		return new Mat4(data);
	}
    */
	meshesPointers() {

		return [
			{
				name: 'position',
				size: 3,
				offset: 0,
				stride: 6
			}, {
				name: 'normal',
				size: 3,
				offset: 3,
				stride: 6
			}
		];

	}

	quad() {

		return {
			pointers: [{
				name: 'position',
				size: 2,
				offset: 0,
				stride: 2
			}],
			vertexSize: 2,
			vertices: [
				-1, -1,  1, -1,  1,  1,
				-1,  1, -1, -1,  1,  1
			]
		};

	}

	plane(s) {

		return {
			pointers: this.meshesPointers(),
			vertexSize: 6,
			vertices: [
				-s, 0, -s, 0, 1, 0,
				-s, 0,  s, 0, 1, 0,
				 s, 0,  s, 0, 1, 0,
				 s, 0, -s, 0, 1, 0,
				-s, 0, -s, 0, 1, 0,
				 s, 0,  s, 0, 1, 0
			]
		};

	}

	cube(x = 1, y = 1, z = 1) {

		return {
			pointers: this.meshesPointers(),
			vertexSize: 6,
			vertices: [
				-x, -y, -z,  0,  0, -1,
				-x,  y, -z,  0,  0, -1,
				 x,  y, -z,  0,  0, -1,
				 x, -y, -z,  0,  0, -1,
				-x, -y, -z,  0,  0, -1,
				 x,  y, -z,  0,  0, -1,

				 x,  y,  z,  0,  0,  1,
				-x,  y,  z,  0,  0,  1,
				-x, -y,  z,  0,  0,  1,
				 x,  y,  z,  0,  0,  1,
				-x, -y,  z,  0,  0,  1,
				 x, -y,  z,  0,  0,  1,

				-x,  y, -z,  0,  1,  0,
				-x,  y,  z,  0,  1,  0,
				 x,  y,  z,  0,  1,  0,
				 x,  y, -z,  0,  1,  0,
				-x,  y, -z,  0,  1,  0,
				 x,  y,  z,  0,  1,  0,

				 x, -y,  z,  0, -1,  0,
				-x, -y,  z,  0, -1,  0,
				-x, -y, -z,  0, -1,  0,
				 x, -y,  z,  0, -1,  0,
				-x, -y, -z,  0, -1,  0,
				 x, -y, -z,  0, -1,  0,

				-x, -y, -z, -1,  0,  0,
				-x, -y,  z, -1,  0,  0,
				-x,  y,  z, -1,  0,  0,
				-x,  y, -z, -1,  0,  0,
				-x, -y, -z, -1,  0,  0,
				-x,  y,  z, -1,  0,  0,

				 x,  y,  z,  1,  0,  0,
				 x, -y,  z,  1,  0,  0,
				 x, -y, -z,  1,  0,  0,
				 x,  y,  z,  1,  0,  0,
				 x, -y, -z,  1,  0,  0,
				 x,  y, -z,  1,  0,  0
			]
		};

	}

	sphere(radius = 1, res = 36) {

		const nx = [];
		const ny = [];
		const nz = [];
		const vertices = [];
		for (let i = 0; i <= res; i++) {
			const theta = i * Math.PI / res;
			const sinTheta = Math.sin(theta);
			const cosTheta = Math.cos(theta);
			for (let j = 0; j <= res; j++) {
				const phi = -j * 2 * Math.PI / res;
				nx.push(Math.cos(phi) * sinTheta)
				ny.push(cosTheta);
				nz.push(Math.sin(phi) * sinTheta);
			}
		}
		for (let i = 0; i < res; i++) {
			for (let j = 0; j < res; j++) {
				const first = (i * (res + 1)) + j;
				const second = first + res + 1;
				vertices.push(
					nx[first] * radius,
					ny[first] * radius,
					nz[first] * radius,
					nx[first],
					ny[first],
					nz[first],

					nx[second] * radius,
					ny[second] * radius,
					nz[second] * radius,
					nx[second],
					ny[second],
					nz[second],

					nx[first + 1] * radius,
					ny[first + 1] * radius,
					nz[first + 1] * radius,
					nx[first + 1],
					ny[first + 1],
					nz[first + 1],

					nx[second] * radius,
					ny[second] * radius,
					nz[second] * radius,
					nx[second],
					ny[second],
					nz[second],

					nx[second + 1] * radius,
					ny[second + 1] * radius,
					nz[second + 1] * radius,
					nx[second + 1],
					ny[second + 1],
					nz[second + 1],

					nx[first + 1] * radius,
					ny[first + 1] * radius,
					nz[first + 1] * radius,
					nx[first + 1],
					ny[first + 1],
					nz[first + 1]

				);
			}
		}

		return {
			pointers: this.meshesPointers(),
			vertexSize: 6,
			vertices: vertices
		};

	}

	cylinder ( radius = 1, res = 36) {

		let angle = 0;
		const alpha = 2 * Math.PI / res;
		const vertices = [];

		for ( let i = 0; i < res; i++) {

			const c0 = Math.cos(angle);
			const s0 = Math.sin(angle);
			const c1 = Math.cos(angle + alpha);
			const s1 = Math.sin(angle + alpha);

			vertices.push(

				c1 * radius, s1 * radius, -1, c1, s1, -1,
				c0 * radius, s0 * radius,  1, c0, s0,  1,
				c0 * radius, s0 * radius, -1, c0, s0, -1,

				c1 * radius, s1 * radius, -1, c1, s1, -1,
				c1 * radius, s1 * radius,  1, c1, s1,  1,
				c0 * radius, s0 * radius,  1, c0, s0,  1,

				c0 * radius, s0 * radius, -1, c0, s0, -1,
				0, 0, -1, 0, 0, -1,
				c1 * radius, s1 * radius, -1, c1, s1, -1,

				c1 * radius, s1 * radius,  1, c1, s1,  1,
				0, 0, -1, 0, 0,  1,
				c0 * radius, s0 * radius,  1, c0, s0,  1

			);

			angle += alpha;
		}

		return {
			pointers: this.meshesPointers(),
			vertexSize: 6,
			vertices: vertices
		};

	}

}

export class Shader {
    webGL: WebGL;
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    vs: WebGLShader;
    fs: WebGLShader;

    uniformCache: {};
    attributeCache: {}
    samplers: {}
    unitCounter: number;

	constructor(webGL, shaders) {

		this.webGL = webGL;
		this.gl = webGL.gl;
		this.program = this.gl.createProgram();
		this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.attachShader(this.program, this.vs);
		this.gl.attachShader(this.program, this.fs);
		this.compileShader(this.vs, shaders.vertex);
		this.compileShader(this.fs, shaders.fragment);
		this.link();
		this.uniformCache = {};
		this.attributeCache = {};
		this.samplers = {};
		this.unitCounter = 0;

	}

	compileShader(shader, source) {

		const boilerplate = `
			#ifdef GL_FRAGMENT_PRECISION_HIGH
				precision highp int;
				precision highp float;
			#else
				precision mediump int;
				precision mediump float;
			#endif
			#define PI 3.141592653589793
    `;

		this.gl.shaderSource(shader, boilerplate + '\n' + source);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			throw new Error(this.gl.getShaderInfoLog(shader));
		}

	}

	attributeLocation(name) {

		let location = this.attributeCache[name];
		if (location === void 0) {
			location = this.attributeCache[name] = this.gl.getAttribLocation(this.program, name);
		}
		return location;

	}

	uniformLocation(name) {

		let location = this.uniformCache[name];
		if (location === void 0) {
			location = this.uniformCache[name] = this.gl.getUniformLocation(this.program, name);
		}
		return location;

	}

	link() {

		this.gl.linkProgram(this.program);
		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			throw new Error(this.gl.getProgramInfoLog(this.program));
		}

	}

	use() {

		if (this.webGL.currentShader !== this) {
			this.webGL.currentShader = this;
			this.gl.useProgram(this.program);
		}
		return this;

	}

	draw(drawable) {

		drawable.setPointersForShader(this)
			.draw();
		return this;

	}

	int(name, value) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform1i(loc, value);
		}
		return this;

	}

	sampler(name, texture) {

		let unit = this.samplers[name];
		if (unit === void 0) {
			unit = this.samplers[name] = this.unitCounter++;
		}
		texture.bind(unit);
		this.int(name, unit);
		return this;

	}

	vec2(name, a, b) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform2f(loc, a, b);
		}
		return this;

	}

	vec3(name, a, b, c) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform3f(loc, a, b, c);
		}
		return this;

	}

	mat4(name, value) {

		const loc = this.uniformLocation(name);
		if (loc) {
			if (value instanceof Mat4) {
				this.gl.uniformMatrix4fv(loc, false, value.data);
			} else {
				this.gl.uniformMatrix4fv(loc, false, value);
			}
		}
		return this;

	}

	mat3(name, value) {

		const loc = this.uniformLocation(name);
		if (loc) {
			if (value instanceof Mat3) {
				this.gl.uniformMatrix3fv(loc, false, value.data);
			} else {
				this.gl.uniformMatrix3fv(loc, false, value);
			}
		}
		return this;

	}

	float(name, value) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform1f(loc, value);
		}
		return this;

	}

}

export class Drawable {

    pointers;
    webGL: WebGL;
    gl: WebGLRenderingContext;
    buffer: WebGLBuffer;
    mode: number;
    vertexSize: number;
    size: number;

	constructor(webGL, obj) {

		this.pointers = obj.pointers;
		this.webGL = webGL;
		this.gl = webGL.gl;
		this.buffer = this.gl.createBuffer();
		this.mode = this.gl.TRIANGLES;
		this.vertexSize = obj.vertexSize;
		this.upload(new Float32Array(obj.vertices));
	}

	upload(vertices) {

		this.size = vertices.length / this.vertexSize;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
		return this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

	}

	setPointersForShader(shader) {

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		for (let i = 0, len = this.pointers.length; i < len; ++i) {
			const pointer = this.pointers[i];
			this.setPointer(shader, pointer, i);
		}
		return this;

	}

	setPointer(shader, pointer, idx) {

		const location = shader.attributeLocation(pointer.name);
		if (location >= 0) {
			const unit = this.webGL.vertexUnits[location];
			if (!unit.enabled) {
				unit.enabled = true;
				this.gl.enableVertexAttribArray(location);
			}
			if (unit.drawable !== this || unit.idx !== idx) {
				const float_size = Float32Array.BYTES_PER_ELEMENT;
				unit.idx = idx;
				unit.drawable = this;
				this.gl.vertexAttribPointer(
					location,
					pointer.size,
					this.gl.FLOAT,
					false,
					pointer.stride * float_size,
					pointer.offset * float_size
				);
			}
		}
		return this;

	}

	draw(first = 0, size = this.size, mode = this.mode) {

		this.gl.drawArrays(mode, first, size);
		return this;

	}

}

export class Vec3 {
    x: number;
    y: number;
    z: number;

	constructor(x = 0.0, y = 0.0, z = 0.0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	copy(v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	}

	get() {
		return [this.x, this.y, this.z];
	}

	distance(b) {
		const dx = b.x - this.x;
		const dy = b.y - this.y;
		const dz = b.z - this.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

	transformMat4(v, mat) {
		const m = mat.data;
		const x = v.x;
		const y = v.y;
		const z = v.z;
		const w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
		this.x  = (m[0] * x + m[4] * y + m[8]  * z + m[12]) / w;
		this.y  = (m[1] * x + m[5] * y + m[9]  * z + m[13]) / w;
		this.z  = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
		return this;
	}

}

export class Mat3 {
    data: Float32Array;

	constructor() {

		this.data = new Float32Array(9);
		this.ident();

	}

	ident() {

		const d = this.data;
		d[0] = 1;
		d[1] = 0;
		d[2] = 0;
		d[3] = 0;
		d[4] = 1;
		d[5] = 0;
		d[6] = 0;
		d[7] = 0;
		d[8] = 1;
		return this;

	}

	fromMat4Rot(source) {
		return source.toMat3Rot(this);
	}

}

export class Mat4 {
    data: Float32Array;

	constructor() {

		this.data = new Float32Array(16);
		this.ident();

	}

	ident() {

		const d = this.data;
		d[0] = 1;
		d[1] = 0;
		d[2] = 0;
		d[3] = 0;
		d[4] = 0;
		d[5] = 1;
		d[6] = 0;
		d[7] = 0;
		d[8] = 0;
		d[9] = 0;
		d[10] = 1;
		d[11] = 0;
		d[12] = 0;
		d[13] = 0;
		d[14] = 0;
		d[15] = 1;
		return this;

	}

	zero() {

		const d = this.data;
		d[0] = 0;
		d[1] = 0;
		d[2] = 0;
		d[3] = 0;
		d[4] = 0;
		d[5] = 0
		d[6] = 0;
		d[7] = 0;
		d[8] = 0;
		d[9] = 0;
		d[10] = 0;
		d[11] = 0;
		d[12] = 0;
		d[13] = 0;
		d[14] = 0;
		d[15] = 0;
		return this;

	}

	set (a00, a10, a20, a30, a01, a11, a21, a31, a02, a12, a22, a32, a03, a13, a23, a33) {

		const d = this.data;
		d[0]  = a00;
		d[4]  = a10;
		d[8]  = a20;
		d[12] = a30;
		d[1]  = a01;
		d[5]  = a11;
		d[9]  = a21;
		d[13] = a31;
		d[2]  = a02;
		d[6]  = a12;
		d[10] = a22;
		d[14] = a32;
		d[3]  = a03;
		d[7]  = a13;
		d[11] = a23;
		d[15] = a33;
		return this;

	}

	perspective(data) {

		const fov = data.fov || 60;
		const aspect = data.aspect || 1;
		const near = data.near || 0.01;
		const far = data.far || 100;
		this.zero();
		const d = this.data;
		const top = near * Math.tan(fov * Math.PI / 360);
		const right = top * aspect;
		const left = -right;
		const bottom = -top;
		d[0] = (2 * near) / (right - left);
		d[5] = (2 * near) / (top - bottom);
		d[8] = (right + left) / (right - left);
		d[9] = (top + bottom) / (top - bottom);
		d[10] = -(far + near) / (far - near);
		d[11] = -1;
		d[14] = -(2 * far * near) / (far - near);
		return this;

	}

	ortho (near = -1, far = 1, top = -1, bottom = 1, left = -1, right = 1) {

		const rl = right - left;
		const tb = top - bottom;
		const fn = far - near;

		return this.set(
			2 / rl,
			0,
			0,
			-(left + right) / rl,
			0,
			2 / tb,
			0,
			-(top + bottom) / tb,
			0,
			0,
			-2 / fn,
			-(far + near) / fn,
			0,
			0,
			0,
			1
		);

	}

	trans(x, y, z) {

		const d = this.data;
		d[12] = d[0] * x + d[4] * y + d[8]  * z + d[12];
		d[13] = d[1] * x + d[5] * y + d[9]  * z + d[13];
		d[14] = d[2] * x + d[6] * y + d[10] * z + d[14];
		d[15] = d[3] * x + d[7] * y + d[11] * z + d[15];
		return this;

	}

	rotatex(angle) {

		const d = this.data;
		const rad = Math.PI * (angle / 180);
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a10 = d[4];
		const a11 = d[5];
		const a12 = d[6];
		const a13 = d[7];
		const a20 = d[8];
		const a21 = d[9];
		const a22 = d[10];
		const a23 = d[11];
		d[4] =  a10 *  c + a20 * s;
		d[5] =  a11 *  c + a21 * s;
		d[6] =  a12 *  c + a22 * s;
		d[7] =  a13 *  c + a23 * s;
		d[8] =  a10 * -s + a20 * c;
		d[9] =  a11 * -s + a21 * c;
		d[10] = a12 * -s + a22 * c;
		d[11] = a13 * -s + a23 * c;
		return this;

	}

	rotatey(angle) {

		const d = this.data;
		const rad = Math.PI * (angle / 180);
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a00 = d[0];
		const a01 = d[1];
		const a02 = d[2];
		const a03 = d[3];
		const a20 = d[8];
		const a21 = d[9];
		const a22 = d[10];
		const a23 = d[11];
		d[0] =  a00 * c + a20 * -s;
		d[1] =  a01 * c + a21 * -s;
		d[2] =  a02 * c + a22 * -s;
		d[3] =  a03 * c + a23 * -s;
		d[8] =  a00 * s + a20 *  c;
		d[9] =  a01 * s + a21 *  c;
		d[10] = a02 * s + a22 *  c;
		d[11] = a03 * s + a23 *  c;
		return this;

	}

	rotatez(angle) {

		const d = this.data;
		const rad = Math.PI * (angle / 180);
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a00 = d[0];
		const a01 = d[1];
		const a02 = d[2];
		const a03 = d[3];
		const a10 = d[4];
		const a11 = d[5];
		const a12 = d[6];
		const a13 = d[7];
		d[0] = a00 *  c + a10 * s;
		d[1] = a01 *  c + a11 * s;
		d[2] = a02 *  c + a12 * s;
		d[3] = a03 *  c + a13 * s;
		d[4] = a00 * -s + a10 * c;
		d[5] = a01 * -s + a11 * c;
		d[6] = a02 * -s + a12 * c;
		d[7] = a03 * -s + a13 * c;
		return this;

	}

	scale(x, y, z) {

		const d = this.data;
		d[0] *= x;
		d[1] *= x;
		d[2] *= x;
		d[3] *= x;
		d[4] *= y;
		d[5] *= y;
		d[6] *= y;
		d[7] *= y;
		d[8] *= z;
		d[9] *= z;
		d[10] *= z;
		d[11] *= z;
		return this;

	}

	toMat3Rot(dest) {

		const dst = dest.data;
		const src = this.data;
		const a00 = src[0];
		const a01 = src[1];
		const a02 = src[2];
		const a10 = src[4];
		const a11 = src[5];
		const a12 = src[6];
		const a20 = src[8];
		const a21 = src[9];
		const a22 = src[10];
		const b01 =  a22 * a11 - a12 * a21;
		const b11 = -a22 * a10 + a12 * a20;
		const b21 =  a21 * a10 - a11 * a20;
		const d = a00 * b01 + a01 * b11 + a02 * b21;
		const id = 1 / d;
		dst[0] = b01 * id;
		dst[3] = (-a22 * a01 + a02 * a21) * id;
		dst[6] = ( a12 * a01 - a02 * a11) * id;
		dst[1] = b11 * id;
		dst[4] = ( a22 * a00 - a02 * a20) * id;
		dst[7] = (-a12 * a00 + a02 * a10) * id;
		dst[2] = b21 * id;
		dst[5] = (-a21 * a00 + a01 * a20) * id;
		dst[8] = ( a11 * a00 - a01 * a10) * id;
		return dest;

	}

	multiply(m1, m2) {
		let b0, b1, b2, b3;
		const mat = this.data;
		const mat1 = m1.data;
		const mat2 = m2.data;
		const a00 = mat1[0];
		const a01 = mat1[1];
		const a02 = mat1[2];
		const a03 = mat1[3];
		const a10 = mat1[4];
		const a11 = mat1[5];
		const a12 = mat1[6];
		const a13 = mat1[7];
		const a20 = mat1[8];
		const a21 = mat1[9];
		const a22 = mat1[10];
		const a23 = mat1[11];
		const a30 = mat1[12];
		const a31 = mat1[13];
		const a32 = mat1[14];
		const a33 = mat1[15];
		b0 = mat2[0];
		b1 = mat2[1];
		b2 = mat2[2];
		b3 = mat2[3];
		mat[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		mat[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		mat[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		mat[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = mat2[4];
		b1 = mat2[5];
		b2 = mat2[6];
		b3 = mat2[7];
		mat[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		mat[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		mat[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		mat[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = mat2[8];
		b1 = mat2[9];
		b2 = mat2[10];
		b3 = mat2[11];
		mat[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		mat[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		mat[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		mat[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = mat2[12];
		b1 = mat2[13];
		b2 = mat2[14];
		b3 = mat2[15];
		mat[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		mat[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		mat[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		mat[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		return this;
	}
	inverse() {
		let a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33, b00, b01, b02, b03, b04, b05, b06, b07, b08, b09, b10, b11, d, invDet;
		const mat = this.data;
		a00 = mat[0];
		a01 = mat[1];
		a02 = mat[2];
		a03 = mat[3];
		a10 = mat[4];
		a11 = mat[5];
		a12 = mat[6];
		a13 = mat[7];
		a20 = mat[8];
		a21 = mat[9];
		a22 = mat[10];
		a23 = mat[11];
		a30 = mat[12];
		a31 = mat[13];
		a32 = mat[14];
		a33 = mat[15];
		b00 = a00 * a11 - a01 * a10;
		b01 = a00 * a12 - a02 * a10;
		b02 = a00 * a13 - a03 * a10;
		b03 = a01 * a12 - a02 * a11;
		b04 = a01 * a13 - a03 * a11;
		b05 = a02 * a13 - a03 * a12;
		b06 = a20 * a31 - a21 * a30;
		b07 = a20 * a32 - a22 * a30;
		b08 = a20 * a33 - a23 * a30;
		b09 = a21 * a32 - a22 * a31;
		b10 = a21 * a33 - a23 * a31;
		b11 = a22 * a33 - a23 * a32;
		d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
		if (d === 0) return;
		invDet = 1 / d;
		mat[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
		mat[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
		mat[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
		mat[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
		mat[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
		mat[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
		mat[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
		mat[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
		mat[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
		mat[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
		mat[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
		mat[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
		mat[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
		mat[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
		mat[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
		mat[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
		return this;
	}

}
