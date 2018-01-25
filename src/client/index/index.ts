import * as io from 'socket.io-client';
import { Vec3, Mat4 } from 'VecMath';
import { AssemblyParams, Assembly } from 'VerletIntegration';
import { Renderer, AssemblyList } from 'Renderer';
import { MotionData } from 'MotionData';

interface Marionette {
	phoneData: MotionData;
	assembly: Assembly;
	origin: Vec3;
	target: Vec3;
	lifeTime: number;
}
interface MarionetteList {
	[id: string]: Marionette;
}
interface ControllerMapping {
	[name:string]: number;
}
interface ControllerMappingList {
	[id:string]: ControllerMapping;
}

interface PhoneAddedMessage {
	id: string;
	slot: number;
}
const assemblies: AssemblyList = {};
const controllers: ControllerMappingList = {};

let marionettes: MarionetteList = {};
let numMarionettes = 0;

function left(width: number, count: number, index: number) {
	let mid = width / count / 2;
	return mid + index * width / count;
}
function addMarionette(msg: PhoneAddedMessage) {
	console.log(`phone added: ${msg.id} - ${msg.slot}`);
	let id = msg.id;
	let slot = msg.slot;
	let thing = new MotionData();

	let p = Math.ceil(slot/2) * ( (slot%2)===0 ? 2 : -2 ); 
	let origin = new Vec3(p, 4, 0);
	let target = new Vec3(p, 0, 0);
	let marionette: Marionette = {
		phoneData: new MotionData,
		assembly: new Assembly(marionetteTemplate, origin),
		origin: origin,
		target: target,
		lifeTime: 0
	}
	let mapping: ControllerMapping = {
		ccenter:-1,
		cright:-1,
		cleft:-1,
		cright1:-1,
		cleft1:-1,
		cfront:-1,
		cback:-1
	}
	let ns = marionette.assembly.nodes
	for (let i = 0; i < ns.length; i++) {
		if (ns[i].name in mapping)
			mapping[ns[i].name] = i;
	}
	numMarionettes++;
	marionettes[id] = marionette;
	assemblies[id] = marionette.assembly;
	controllers[id] = mapping;
}
function removeMarionette(id: string) {
	console.log(`phone removed: ${id}`)
	delete marionettes[id];
	delete assemblies[id];
	delete controllers[id];
	numMarionettes--;
}
function update(motion: any) {
	if (!(motion.id in marionettes)) {
		return
	}

	let marionette = marionettes[motion.id];
	let thing = marionette.phoneData;
	let origin = marionette.origin;
	let target = marionette.target;
	let phase = marionette.lifeTime/3;
	if (phase >1) 
	phase = 1;
	let p = EasingFunctions.easeInOutCubic(phase)


	thing.accelerate(motion.acc.x, motion.acc.y, motion.acc.z)
	thing.setRotation(-motion.rot.x, -motion.rot.z, -motion.rot.y)
	thing.update();

	let a = assemblies[motion.id];
	let c = controllers[motion.id];
	var pos = thing.pos;
	var p1 = new Vec3(
		origin.x * (1-p) + target.x * p + controllerCenter.x + pos.x/100,
		origin.y * (1-p) + target.y * p + controllerCenter.y + pos.z/100,
		origin.z * (1-p) + target.z * p + controllerCenter.z + pos.y/100
	);
	var r = thing.rot;
	positionController(a, c, controllerVectors, p1, r);

}
function positionController(assembly: Assembly, mapping: ControllerMapping, vectors:any, pos: Vec3, rot: Vec3) {
	let mat = new Mat4();
	mat.trans(pos.x, pos.y, pos.z);
	mat.rotatey(-rot.x);
	mat.rotatez(rot.y);
	mat.rotatex(rot.z);
	for (let n in vectors) {
		let v = <Vec3>vectors[n];
		let p = assembly.nodes[mapping[n]].pos
		p.transformMat4(v, mat);
	}
	assembly.nodes[mapping['ccenter']].pos.set(pos.x, pos.y, pos.z);
}

let socket = io();
socket.on('connect', () => {
	socket.emit('device', 'desktop');
});

socket.on('phoneadded', addMarionette);
socket.on('phoneremoved', removeMarionette);
socket.on('motion', update);

const lightStruct: AssemblyParams = {
	nodes: {
		light: {
			x: 1,
			y: 1.7,
			z: 0,
			w: 0.1,
			mass: 0.6,
			color: [1000.0, 1000.0, 1000.0],
			free: false
		}
	},
	constraints: []
}

const controllerCenter = new Vec3(0, 1.5, 0);
const controllerVectors = {
	cleft1: new Vec3(-1,0,0),
	cright1: new Vec3(1,0,0),
	cleft: new Vec3(-1,0,0.5),
	cright: new Vec3(1,0,0.5),
	cback: new Vec3(0,0,-1),
	cfront: new Vec3(0,0,1)
}
const marionetteTemplate: AssemblyParams = {
	nodes: {
		head: {
			x: 0,
			y: 1 - 1,
			z: 0,
			w: 0.2,
			mass: 105.0,
			color: [1.5, 1.2, 0.8]
		},
		s1: {
			x: 0,
			y: 0.92 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [1.5, 1.2, 0.8]
		},
		s2: {
			x: 0,
			y: 0.88 - 1,
			z: -0.05,
			w: 0.03,
			mass: 105.0,
			color: [1.5, 1.2, 0.8]
		},
		s3: {
			x: 0,
			y: 0.75 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		s4: {
			x: 0,
			y: 0.64 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [1.5, 1.2, 0.8]
		},
		lshoulder: {
			x: 0.13,
			y: 0.91 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		lelbow: {
			x: 0.13,
			y: 0.7 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		lwrist: {
			x: 0.13,
			y: 0.52 - 1 + 0.48,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		rshoulder: {
			x: -0.13,
			y: 0.91 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		relbow: {
			x: -0.13,
			y: 0.7 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		rwrist: {
			x: -0.13,
			y: 0.52 - 1 + 0.48,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		lhip: {
			x: 0.06,
			y: 0.58 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		lknee: {
			x: 0.06,
			y: 0.29 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		lankle: {
			x: 0.06,
			y: 0.1 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		rhip: {
			x: -0.06,
			y: 0.58 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		rknee: {
			x: -0.06,
			y: 0.29 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		},
		rankle: {
			x: -0.06,
			y: 0.1 - 1,
			z: 0,
			w: 0.03,
			mass: 105.0,
			color: [0.8, 1.2, 1.5]
		}
	},
	constraints: [
		["head", "s1", 0.01, 0.5],
		["s1", "s2", 0.01, 0.5],
		["s2", "s3", 0.01, 0.5],
		["s3", "s1", 0.01, 0.5],
		["s3", "s4", 0.01, 0.5],
		["s1", "lshoulder", 0.01, 0.5],
		["s2", "lshoulder", 0.01, 0.5],
		["s3", "lshoulder", 0.01, 0.5],
		["lshoulder", "lelbow", 0.01, 0.5],
		["lelbow", "lwrist", 0.01, 0.5],
		["s1", "rshoulder", 0.01, 0.5],
		["s2", "rshoulder", 0.01, 0.5],
		["s3", "rshoulder", 0.01, 0.5],
		["rshoulder", "relbow", 0.01, 0.5],
		["relbow", "rwrist", 0.01, 0.5],
		["s4", "lhip", 0.01, 0.5],
		["lhip", "lknee", 0.01, 0.5],
		["lknee", "lankle", 0.01, 0.5],
		["s4", "rhip", 0.01, 0.5],
		["lhip", "rhip", 0.01, 0.5],
		["rhip", "rknee", 0.01, 0.5],
		["rknee", "rankle", 0.01, 0.5]
	]
};

function interpolate(v1: number, v2: number, p: number) {
	return (v2 - v1) * p + v1;
}
let EasingFunctions = {
	// no easing, no acceleration
	linear: function (t:number) { return t },
	// accelerating from zero velocity
	easeInQuad: function (t:number) { return t*t },
	// decelerating to zero velocity
	easeOutQuad: function (t:number) { return t*(2-t) },
	// acceleration until halfway, then deceleration
	easeInOutQuad: function (t:number) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
	// accelerating from zero velocity 
	easeInCubic: function (t:number) { return t*t*t },
	// decelerating to zero velocity 
	easeOutCubic: function (t:number) { return (--t)*t*t+1 },
	// acceleration until halfway, then deceleration 
	easeInOutCubic: function (t:number) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
	// accelerating from zero velocity 
	easeInQuart: function (t:number) { return t*t*t*t },
	// decelerating to zero velocity 
	easeOutQuart: function (t:number) { return 1-(--t)*t*t*t },
	// acceleration until halfway, then deceleration
	easeInOutQuart: function (t:number) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
	// accelerating from zero velocity
	easeInQuint: function (t:number) { return t*t*t*t*t },
	// decelerating to zero velocity
	easeOutQuint: function (t:number) { return 1+(--t)*t*t*t*t },
	// acceleration until halfway, then deceleration 
	easeInOutQuint: function (t:number) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
  }
function createString(struct: AssemblyParams, sections: number, name: string, attachTo: string, x: number, y: number, z: number) {
	let destNode = struct.nodes[attachTo];
	for (let i = 0; i < sections; i++) {
		let p = (i+1) / (sections+2);
		struct.nodes[name + i] = {
			x: interpolate(x, destNode.x, p),
			y: interpolate(y, destNode.y, p),
			z: interpolate(z, destNode.z, p),
			w: 0.001,
			mass: 1,
			color: [0.8, 1.2, 1.5],
		};
		struct.constraints.push([name + i, name + (i + 1), 0.005]);
	}
	struct.nodes[name + '0'].free = false;
	struct.constraints[struct.constraints.length - 1][1] = attachTo;
}
function createRope(struct: AssemblyParams, sections: number, name: string, from: string, to: string) {
	let fromNode = struct.nodes[from];
	let toNode = struct.nodes[to];
	let fromPos = new Vec3(fromNode.x, fromNode.y, fromNode.z);
	let toPos = new Vec3(toNode.x, toNode.y, toNode.z);
	for (let i = 0; i < sections; i++) {
		let p = (i+1) / (sections+2);
		struct.nodes[name + i] = {
			x: interpolate(fromPos.x, toPos.x, p),
			y: interpolate(fromPos.y, toPos.y, p),
			z: interpolate(fromPos.z, toPos.z, p),
			w: 0.00,
			mass: 1,
			color: [0.8, 1.2, 1.5],
		};
		struct.constraints.push([name + i, name + (i + 1), 0.001, 0.5]);
		if (i + 2 < sections)
			struct.constraints.push([name + i, name + (i + 2), 0.00, 0.5]);
		if (i + 3 < sections)
			struct.constraints.push([name + i, name + (i + 3), 0.00, 0.5]);
		if (i + 4 < sections)
			struct.constraints.push([name + i, name + (i + 4), 0.00, 0.5]);
	}
	//struct.nodes[name + '0'].free = false;
	struct.constraints[struct.constraints.length - 1][1] = to;
	struct.constraints.push([from, name+'0', 0.001, 0.5]);
}
function createController(template: AssemblyParams, center: Vec3, vectors: any) {
	template.nodes.ccenter = {
		x: center.x,
		y: center.y,
		z: center.z,
		w: 0.1,
		mass: 1.0,
		color: [1.5, 1.2, 0.8],
		free: false
	};
	for (let n in vectors) {
		let v = <Vec3>vectors[n];
		template.nodes[n] = {
			x: v.x + center.x,
			y: v.y + center.y,
			z: v.z + center.z,
			w: 0.1,
			mass: 150.0,
			color: [1.5, 1.2, 0.8],
			free: false
		}
	}
	template.constraints.push(
		["ccenter", "cleft", 0.02, 1],
		["ccenter", "cright", 0.02, 1],
		["ccenter", "cleft1", 0.02, 1],
		["ccenter", "cright1", 0.02, 1],
		["ccenter", "cback", 0.02, 1],
		["ccenter", "cfront", 0.02, 1]
	);
}

createController(marionetteTemplate, controllerCenter, controllerVectors);
createRope(marionetteTemplate, 30, 'ropehead', 'head', 'ccenter');
createRope(marionetteTemplate, 30, 'ropelwrist', 'lwrist', 'cleft');
createRope(marionetteTemplate, 30, 'roperwrist', 'rwrist', 'cright');
createRope(marionetteTemplate, 30, 'ropelknee', 'lknee', 'cleft1');
createRope(marionetteTemplate, 30, 'roperknee', 'rknee', 'cright1');
createRope(marionetteTemplate, 30, 'ropes4', 's4', 'cback');

// animation loop
let lastTime = 0;
let firstTime = true;
const run = (currentTime: number) => {
	requestAnimationFrame(run);

	let dt = (currentTime - lastTime) / 1000;
	for (let i in marionettes) {
		let a = marionettes[i];
		a.lifeTime += dt;
	}
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
	// verlet integration
	for (let i = 0; i < runs; i++) {
		// integration
		for (let a in assemblies) {
			let ass = assemblies[a];
			for (let n of ass.nodes) {
				n.integrate(dt / runs);
				n.checkPlane(-1);
			}
			for (let n of ass.constraints) {
				n.solve();
			}	
		}
	}
	let minx = Number.POSITIVE_INFINITY, maxx = Number.NEGATIVE_INFINITY;
	for (let i in marionettes) {
		let a = marionettes[i];
		minx = minx > a.target.x ? a.target.x : minx;
		maxx = maxx < a.target.x ? a.target.x : maxx;
	}
	Renderer.drawScene(assemblies, new Vec3((minx+maxx)/-2, -0.5, -3-(maxx-minx)));
}

run(0);