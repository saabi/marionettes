import { WebGL, Vec3, Mat4, Canvas, Pointer, Shader } from 'WebGLFramework';

var friction = 0.001;

interface NodeParams {
	x: number;
	y: number;
	z: number;
	w: number;
	mass?: number;
	color: number[];
	id?: Node;
	free?: boolean;
}
// Node class
let tmpVec3 = new Vec3;
let tmp1Vec3 = new Vec3;
let vel = new Vec3;
class Node {
	name: string;
	pos: Vec3;
	old: Vec3;
	radius: number;
	mass: number;
	rgb: Vec3;
	free: boolean;

	constructor(name: string, node: NodeParams) {
		this.name = name;
		this.pos = new Vec3(node.x, node.y, node.z);
		this.old = new Vec3(node.x, node.y, node.z);
		this.radius = Math.pow(node.w, 1 / 3) / 15;
		this.mass = node.mass || 1.0;
		this.rgb = new Vec3(node.color[0], node.color[1], node.color[2]);
		this.free = ('free' in node) ? node.free : true;
	}
	// verlet integration
	integrate(dt: number) {
		if (!this.free)
			return;

		const acc = -9.81;
		//const acc = 0;
		tmpVec3.copy(this.pos);
		tmp1Vec3.copy(this.old).mul(1 - friction);
		this.pos.mul(2 - friction).sub(tmp1Vec3);
		this.pos.y += acc * dt * dt;
		this.old.copy(tmpVec3);
	}
	// draw node
	draw(shader: Shader) {
		shader.vec3('modelColor', this.rgb.x, this.rgb.y, this.rgb.z)
			.mat4('model', new Mat4()
				.trans(this.pos.x, this.pos.y, this.pos.z)
				.scale(this.radius, this.radius, this.radius)
			)
			.draw(sphereGeom);
	}
	checkPlane(pos: number) {
		// ground (water?)
		let limit = pos + this.radius;
		if (this.pos.y <= limit) {
			this.pos.x -= (this.pos.x - this.old.x) * 0.02;
			this.pos.z -= (this.pos.z - this.old.z) * 0.02;
			this.pos.y = limit + (limit - this.pos.y) * .5;
			this.old.y = limit + (limit - this.old.y) * .5;
		}
	}
}
// constraint class
class Constraint {
	n0: Node;
	n1: Node;
	size: number;
	dist: number;

	constructor(n0: Node, n1: Node, size: number) {
		this.n0 = n0;
		this.n1 = n1;
		this.size = size || 0;
		this.dist = n0.pos.distance(n1.pos);
	}
	// solve constraint
	solve() {
		const n0 = this.n0.pos;
		const n1 = this.n1.pos;
		let dx = n0.x - n1.x;
		let dy = n0.y - n1.y;
		let dz = n0.z - n1.z;
		const currentDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
		const delta = 0.5 * (currentDist - this.dist) / currentDist;
		dx *= delta;
		dy *= delta;
		dz *= delta;
		let m1 = (this.n0.mass * (this.n0.free ? 1 : 100000) + this.n1.mass * (this.n1.free ? 1 : 100000));
		let m2 = (this.n0.free ? 1 : 100000) * this.n0.mass / m1;
		m1 = (this.n1.free ? 1 : 100000) * this.n1.mass / m1;
		n1.x += dx * m2;
		n1.y += dy * m2;
		n1.z += dz * m2;
		n0.x -= dx * m1;
		n0.y -= dy * m1;
		n0.z -= dz * m1;
	}
	draw(shader: Shader) {
		if (!this.size) return;
		const dx = this.n1.pos.x - this.n0.pos.x;
		const dy = this.n1.pos.y - this.n0.pos.y;
		const dz = this.n1.pos.z - this.n0.pos.z;
		const ln = Math.sqrt(dx * dx + dy * dy + dz * dz);
		const a = -Math.atan2(dy, dz) * 180 / Math.PI;
		const b = Math.asin(dx / ln) * 180 / Math.PI;

		shader.vec3('modelColor', 1, 1, 1)
			.mat4('model', new Mat4()
				.trans(this.n0.pos.x, this.n0.pos.y, this.n0.pos.z)
				.rotatex(a)
				.rotatey(b)
				.trans(0, 0, ln * 0.5)
				.scale(this.size, this.size, ln * 0.5)
			)
			.draw(tubeGeom);
	}
}
// animation loop
let lastTime = 0;
let firstTime = true;
const run = (currentTime: number) => {
	requestAnimationFrame(run);
	let dt = (currentTime - lastTime) / 1000;
	const runs = 20;
	if (firstTime) {
		firstTime = false;
		dt = .001666 / runs;
	}
	if (dt > .3) {
		console.error(dt);
		dt = 0.016 / runs;
	}
	lastTime = currentTime;
	// solve constraints
	for (let i = 0; i < runs; i++) {
		// manage pointer
		if (pointer.isDown) {
			if (!drag) {
				// determine which sphere is under the pointer ?
				let dmax = 10000,
					over = null;
				viewProj.multiply(camProj, camView);
				for (let n of nodes) {
					point.transformMat4(n.pos, viewProj);
					let x = Math.round(((point.x + 1) / 2.0) * canvas.width);
					let y = Math.round(((1 - point.y) / 2.0) * canvas.height);
					let dx = Math.abs(pointer.x - x);
					let dy = Math.abs(pointer.y - y);
					let d = Math.sqrt(dx * dx + dy * dy);
					if (d < dmax) {
						dmax = d;
						over = n;
					}
				}
				canvas.elem.style.cursor = 'move';
				drag = over;
				dragFreeness = drag.free;
				drag.free = false;
				rgb.copy(drag.rgb);
				//if (drag.radius !== 0.1) drag.rgb.set(2, 1, 0);
			}
			// dragging
			let x = (2.0 * pointer.x / canvas.width - 1) * 0.55 * camDist * gl.aspect;
			let y = (-2.0 * pointer.y / canvas.height + 1) * 0.55 * camDist;
			tmpVec3.copy(drag.pos);
			drag.pos.x += (x - drag.pos.x) / runs;
			drag.pos.y += (y - drag.pos.y) / runs;
			drag.pos.z *= 0.99;
			drag.old.copy(tmpVec3);
		} else {
			// stop dragging
			if (drag) {
				canvas.elem.style.cursor = 'pointer';
				drag.rgb.copy(rgb);
				drag.free = dragFreeness;
				drag = null;
			}
		}
		// integration
		for (let n of nodes) {
			n.integrate(dt / runs);
			n.checkPlane(-1);
		}
		for (let n of constraints) {
			n.solve();
		}
	}
	// webGL rendering
	gl
		.adjustSize()
		.viewport()
		.cullFace()
		.clearColor(0, 0, 0, 0)
		.clearDepth(1);
	// camera
	camProj.perspective({
		fov: 60,
		aspect: gl.aspect,
		near: 0.01,
		far: 100
	});
	pointer.z = Math.min(Math.max(pointer.z, 3), 21);
	camDist += 0.1 * ((pointer.z / 3) - camDist);
	camView
		.ident()
		.trans(0, 0, -camDist);
	// light position
	const light = theStruct.nodes['light'].id.pos;
	// set uniforms
	displayShader
		.use()
		.vec3('uPointLightingLocation', light.x, light.y + 0.06, light.z)
		.vec3('uPointLightingColor', 1.0, 1.0, 1.0)
		.mat4('camProj', camProj)
		.mat4('camView', camView);
	// draw ground
	displayShader.vec3('modelColor', 0.6, 1.0, 1.2)
		.mat4('model', new Mat4().trans(0.0, -1.0, 0.0))
		.draw(planeGeom);
	// draw nodes
	for (let n of nodes) {
		n.draw(displayShader);
	}
	// draw constraints
	for (let c of constraints) {
		c.draw(displayShader);
	}
}
/**
 * Init script
 */
const canvas = new Canvas("canvas");
const gl = new WebGL(canvas).depthTest();
const pointer = new Pointer(canvas);
const point = gl.vec3();
const camProj = gl.mat4();
const camView = gl.mat4();
const viewProj = gl.mat4();
const planeGeom = gl.drawable(gl.plane(60));
const sphereGeom = gl.drawable(gl.sphere(1, 36));
const tubeGeom = gl.drawable(gl.cylinder(1, 36));
const nodes: Node[] = [];
const constraints: Constraint[] = [];
let drag: Node = null;
let dragFreeness: boolean;
let rgb = gl.vec3();
let camDist = 3;
pointer.z = camDist * 3;

canvas.enableFullscreen({
	position: 'absolute',
	right: '7px',
	bottom: '7px',
	cursor: 'pointer',
	background: '#1e1e1e',
	fontFamily: 'Lato, Lucida Grande, Lucida Sans Unicode, Tahoma, Sans-Serif',
	fontSize: '0.8rem',
	padding: '2px 7px',
	borderRadius: '3px',
	border: '3px solid transparent',
	color: 'white',
	whiteSpace: 'nowrap',
	textAlign: 'center',
	userSelect: 'none'
});

const displayShader = gl.shader({
	vertex: `
			uniform mat4 camProj, camView;
			uniform mat4 model;
			attribute vec3 position, normal;
			varying vec3 vLigthPosition;
			varying vec3 vNormal;
			void main(){
				vec4 vWorldPosition = model * vec4(position, 1.0);
				gl_Position = camProj * camView * vWorldPosition;
				vLigthPosition = vWorldPosition.xyz;
				vNormal = normal;
			}
		`,
	fragment: `
			uniform vec3 modelColor;
			uniform vec3 uPointLightingLocation;
			uniform vec3 uPointLightingColor;
			varying vec3 vLigthPosition;
			varying vec3 vNormal;
			void main(){
				vec3 lightDirection = normalize(uPointLightingLocation - vLigthPosition);
				float angle = max(dot(lightDirection, vNormal), 0.001);
				vec3 diffuse = pow(uPointLightingColor * angle * modelColor, vec3(1.0));
				gl_FragColor = vec4(diffuse, 1.0);
			}
		`
});

export interface Struct {
	nodes: { [name: string]: NodeParams };
	constraints: any[];
}

let theStruct: Struct;

export function init(struct: Struct) {
	theStruct = struct;
	// load nodes
	for (let n in struct.nodes) {
		const node = new Node(n, struct.nodes[n]);
		struct.nodes[n].id = node;
		nodes.push(node);
	}
	// define constraints
	for (let i = 0; i < struct.constraints.length; i++) {
		constraints.push(new Constraint(
			struct.nodes[struct.constraints[i][0]].id,
			struct.nodes[struct.constraints[i][1]].id,
			struct.constraints[i][2]
		));
	}
	nodes[3].pos.x += 0.01;
	nodes[3].pos.z += 0.01;
	run(0);
}

declare global {
	function resize(): void;
	interface Window {
		setFriction: (f: number) => void;
		getFriction: () => number;
		updateNodes: (f: (n: Node) => void) => void;
	}
}
window.setFriction = function (f) { friction = f; }
window.getFriction = function () { return friction };

window.updateNodes = function (f: (n: Node) => void) {
	for (let n of nodes) {
		f(n);
	}
}