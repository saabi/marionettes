/**
* Adapted from WebGL framework by Florian Boesch - @pyalot
* https://github.com/pyalot/soft-shadow-mapping/blob/master/framework.coffee
*/

import {Vec3, Mat3, Mat4} from './VecMath';

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

	bfs?: HTMLButtonElement;

	constructor(container: string) {
		const elem = document.getElementById(container);
		if (elem && elem.tagName == 'CANVAS')
			this.elem = <HTMLCanvasElement>elem;
		else
			throw new Error('Not a Canvas element!');
		this.width = 0;
		this.height = 0;

	}

	enableFullscreen(style: any) {

		if (
			document.fullscreenEnabled ||
			document.webkitFullscreenEnabled ||
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
		) {
			this.bfs = document.createElement("button");
			this.bfs.appendChild(document.createTextNode("Fullscreen"));
			this.elem.parentElement!.appendChild(this.bfs);
			for (let s in style) this.bfs.style.setProperty(s, style[s]);
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

	constructor(canvas: Canvas) {

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

	down(e: Event) {

		if (e.target !== this.canvas.elem) return;
		this.move(<MouseEvent>e);
		this.xold = this.x;
		this.yold = this.y;
		this.isDown = true;

	}

	up(e: Event) {

		this.isDown = false;

	}

	move(e: TouchEvent | MouseEvent) {

		let pointer = null;
		if (e instanceof TouchEvent) {
			const touchMode = e.targetTouches;
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
			} else
				throw new Error("Something's screwey...")
		}
		else pointer = e;
		this.x = pointer.clientX;
		this.y = pointer.clientY;

	}

	wheel(e: WheelEvent) {

		e.preventDefault();
		this.z += e.deltaY > 0 ? -1 : 1;

	}

}

export interface VertexUnit {
	enabled: boolean;
	drawable: Drawable | null;
	idx: number | null;
}

export class WebGL {
	canvas: Canvas;
	gl: WebGLRenderingContext;

	width: number;
	height: number;
	aspect: number;
	//textureUnits: [];
	vertexUnits: VertexUnit[];
	currentShader: Shader | null = null;

	constructor(canvas: Canvas, options?: any) {

		this.canvas = canvas;
		let gl = this.canvas.elem.getContext("webgl", options);
		if (!gl) gl = this.canvas.elem.getContext("experimental-webgl", options);
		if (!gl) throw new Error('This browser does not support WebGL');
		this.gl = gl;
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
		//this.currentShader = null;

	}

	getExtension(name: string) {

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

	depthTest(value = true): WebGL {

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
	shader(params: ShaderParams) {
		return new Shader(this, params);
	}

	drawable(params: Geometry) {
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

	mat3() {
		return new Mat3();
	}

	mat4() {
		return new Mat4();
	}

	meshesPointers(): MeshPointer[] {

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
				-1, -1, 1, -1, 1, 1,
				-1, 1, -1, -1, 1, 1
			]
		};

	}

	plane(s: number): Geometry {

		return {
			pointers: this.meshesPointers(),
			vertexSize: 6,
			vertices: [
				-s, 0, -s, 0, 1, 0,
				-s, 0, s, 0, 1, 0,
				s, 0, s, 0, 1, 0,
				s, 0, -s, 0, 1, 0,
				-s, 0, -s, 0, 1, 0,
				s, 0, s, 0, 1, 0
			]
		};

	}

	cube(x = 1, y = 1, z = 1) {

		return {
			pointers: this.meshesPointers(),
			vertexSize: 6,
			vertices: [
				-x, -y, -z, 0, 0, -1,
				-x, y, -z, 0, 0, -1,
				x, y, -z, 0, 0, -1,
				x, -y, -z, 0, 0, -1,
				-x, -y, -z, 0, 0, -1,
				x, y, -z, 0, 0, -1,

				x, y, z, 0, 0, 1,
				-x, y, z, 0, 0, 1,
				-x, -y, z, 0, 0, 1,
				x, y, z, 0, 0, 1,
				-x, -y, z, 0, 0, 1,
				x, -y, z, 0, 0, 1,

				-x, y, -z, 0, 1, 0,
				-x, y, z, 0, 1, 0,
				x, y, z, 0, 1, 0,
				x, y, -z, 0, 1, 0,
				-x, y, -z, 0, 1, 0,
				x, y, z, 0, 1, 0,

				x, -y, z, 0, -1, 0,
				-x, -y, z, 0, -1, 0,
				-x, -y, -z, 0, -1, 0,
				x, -y, z, 0, -1, 0,
				-x, -y, -z, 0, -1, 0,
				x, -y, -z, 0, -1, 0,

				-x, -y, -z, -1, 0, 0,
				-x, -y, z, -1, 0, 0,
				-x, y, z, -1, 0, 0,
				-x, y, -z, -1, 0, 0,
				-x, -y, -z, -1, 0, 0,
				-x, y, z, -1, 0, 0,

				x, y, z, 1, 0, 0,
				x, -y, z, 1, 0, 0,
				x, -y, -z, 1, 0, 0,
				x, y, z, 1, 0, 0,
				x, -y, -z, 1, 0, 0,
				x, y, -z, 1, 0, 0
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

	cylinder(radius = 1, res = 36) {

		let angle = 0;
		const alpha = 2 * Math.PI / res;
		const vertices = [];

		for (let i = 0; i < res; i++) {

			const c0 = Math.cos(angle);
			const s0 = Math.sin(angle);
			const c1 = Math.cos(angle + alpha);
			const s1 = Math.sin(angle + alpha);

			vertices.push(

				c1 * radius, s1 * radius, -1, c1, s1, -1,
				c0 * radius, s0 * radius, 1, c0, s0, 1,
				c0 * radius, s0 * radius, -1, c0, s0, -1,

				c1 * radius, s1 * radius, -1, c1, s1, -1,
				c1 * radius, s1 * radius, 1, c1, s1, 1,
				c0 * radius, s0 * radius, 1, c0, s0, 1,

				c0 * radius, s0 * radius, -1, c0, s0, -1,
				0, 0, -1, 0, 0, -1,
				c1 * radius, s1 * radius, -1, c1, s1, -1,

				c1 * radius, s1 * radius, 1, c1, s1, 1,
				0, 0, -1, 0, 0, 1,
				c0 * radius, s0 * radius, 1, c0, s0, 1

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

interface ShaderParams {
	vertex: string;
	fragment: string;
}

export class Shader {
	webGL: WebGL;
	gl: WebGLRenderingContext;
	program: WebGLProgram;
	vs: WebGLShader;
	fs: WebGLShader;

	uniformCache: { [name: string]: WebGLUniformLocation };
	attributeCache: { [name: string]: number };
	samplers: {}
	unitCounter: number;

	constructor(webGL: WebGL, shaders: ShaderParams) {

		this.webGL = webGL;
		this.gl = webGL.gl;
		const program = this.gl.createProgram(); 
		if (!program) throw new Error('Program failed to compile.');
		this.program = program;
		const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
		if (!vs) throw new Error('Shader failed to compile.');
		this.vs = vs;
		const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		if (!fs) throw new Error('Shader failed to compile.');
		this.fs = fs;		
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

	compileShader(shader: WebGLShader, source: string) {

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
			throw new Error(this.gl.getShaderInfoLog(shader) || "Unknown error.");
		}

	}

	attributeLocation(name: string) {

		let location = this.attributeCache[name];
		if (location === void 0) {
			location = this.attributeCache[name] = this.gl.getAttribLocation(this.program, name);
		}
		return location;

	}

	uniformLocation(name: string) {

		let location = this.uniformCache[name];
		if (location === void 0) {
			const l = this.gl.getUniformLocation(this.program, name);
			if (!l) throw new Error('Uniform location not found.')
			location = this.uniformCache[name] = l;
		}
		return location;

	}

	link() {

		this.gl.linkProgram(this.program);
		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			throw new Error(this.gl.getProgramInfoLog(this.program) || "Unknown error.");
		}

	}

	use() {

		if (this.webGL.currentShader !== this) {
			this.webGL.currentShader = this;
			this.gl.useProgram(this.program);
		}
		return this;

	}

	draw(drawable: Drawable) {

		drawable.setPointersForShader(this)
			.draw();
		return this;

	}

	int(name: string, value: number) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform1i(loc, value);
		}
		return this;

	}

	/*
	sampler(name: string, texture) {
		
		let unit = this.samplers[name];
		if (unit === void 0) {
			unit = this.samplers[name] = this.unitCounter++;
		}
		texture.bind(unit);
		this.int(name, unit);
		return this;
		
	}
	*/

	vec2(name: string, a: number, b: number) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform2f(loc, a, b);
		}
		return this;

	}

	vec3(name: string, a: number, b: number, c: number) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform3f(loc, a, b, c);
		}
		return this;

	}

	mat4(name: string, value: Mat4 | Float32Array | number[]) {

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

	mat3(name: string, value: Mat3 | Float32Array | number[]) {

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

	float(name: string, value: number) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform1f(loc, value);
		}
		return this;

	}

}

interface MeshPointer {
	name: string;
	size: number;
	offset: number;
	stride: number;
}

interface Geometry {
	pointers: MeshPointer[];
	vertexSize: number;
	vertices: number[];
}

export class Drawable {

	pointers: MeshPointer[];
	webGL: WebGL;
	gl: WebGLRenderingContext;
	buffer: WebGLBuffer;
	mode: number;
	vertexSize: number;
	size: number = 0;

	constructor(webGL: WebGL, obj: Geometry) {

		this.pointers = obj.pointers;
		this.webGL = webGL;
		this.gl = webGL.gl;
		const buffer = this.gl.createBuffer();
		if (!buffer) throw new Error("Error");
		this.buffer = buffer;
		this.mode = this.gl.TRIANGLES;
		this.vertexSize = obj.vertexSize;
		this.upload(new Float32Array(obj.vertices));
	}

	upload(vertices: Float32Array) {

		this.size = vertices.length / this.vertexSize;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
		return this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

	}

	setPointersForShader(shader: Shader) {

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		for (let i = 0, len = this.pointers.length; i < len; ++i) {
			const pointer = this.pointers[i];
			this.setPointer(shader, pointer, i);
		}
		return this;

	}

	setPointer(shader: Shader, pointer: MeshPointer, idx: number) {

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

