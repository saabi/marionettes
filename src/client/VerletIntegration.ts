//import { WebGL, Vec3, Mat4, Canvas, Pointer, Shader } from 'WebGLFramework';
import { Vec3, Mat4} from './VecMath';

var friction = 0.001;

export interface NodeParams {
	x: number;
	y: number;
	z: number;
	w: number;
	mass?: number;
	color: number[];
	id?: Node;
	free?: boolean;
}
export interface AssemblyParams {
	nodes: { [name: string]: NodeParams };
	constraints: any[];
}

// Node class
let tmpVec3 = new Vec3;
let tmp1Vec3 = new Vec3;
let vel = new Vec3;
export class Node {
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
export class Constraint {
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
}

export class Assembly {
    readonly nodes: Node[] = [];
    readonly constraints: Constraint[] = [];

    constructor(struct: AssemblyParams, offset: Vec3) {
        // load nodes
        for (let n in struct.nodes) {
			const node = new Node(n, struct.nodes[n]);
			node.pos.add(offset);
            struct.nodes[n].id = node;
            this.nodes.push(node);
        }
        // define constraints
        for (let i = 0; i < struct.constraints.length; i++) {
            this.constraints.push(new Constraint(
                struct.nodes[struct.constraints[i][0]].id,
                struct.nodes[struct.constraints[i][1]].id,
                struct.constraints[i][2]
            ));
        }
    }
}

declare global {
	function resize(): void;
	interface Window {
		setFriction: (f: number) => void;
		getFriction: () => number;
	}
}
window.setFriction = function (f) { friction = f; }
window.getFriction = function () { return friction };
