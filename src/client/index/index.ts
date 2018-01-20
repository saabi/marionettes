import * as io from 'socket.io-client';
import { Vec3 } from 'VecMath';
import { AssemblyParams, Assembly } from 'verlet3';
import { Renderer, AssemblyList } from 'Renderer';
import { PhoneData } from 'thing';

interface Marionette {
	element: HTMLElement;
	phoneData: PhoneData;
	assembly: Assembly;
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
const assemblies: AssemblyList = {};
const controllers: ControllerMappingList = {};

let marionettes: MarionetteList = {};
let numMarionettes = 0;

function left(width: number, count: number, index: number) {
	let mid = width / count / 2;
	return mid + index * width / count;
}
function addMarionette(id: string) {
	console.log(`phone added: ${id}`)
	let thing = new PhoneData();

	let puppet: Marionette = {
		element: document.createElement('div'),
		phoneData: new PhoneData,
		assembly: new Assembly(marionetteTemplate, new Vec3(0,0,0))
	}
	let mapping: ControllerMapping = {
		ccenter:-1,
		ctop:-1,
		cright:-1,
		cleft:-1,
		cright1:-1,
		cleft1:-1,
		cfront:-1,
		cback:-1
	}
	let ns = puppet.assembly.nodes
	for (let i = 0; i < ns.length; i++) {
		if (ns[i].name in mapping)
			mapping[ns[i].name] = i;
	}
	numMarionettes++;
	puppet.element.id = id;
	puppet.element.className = 'thing'
	document.body.appendChild(puppet.element);
	marionettes[id] = puppet;
	assemblies[id] = puppet.assembly;
	controllers[id] = mapping;

	let i = 0;
	for (let j in marionettes) {
		marionettes[j].element.style.left = left(document.body.offsetWidth, numMarionettes, i++) + 'px';
	}
}
function removeMarionette(id: string) {
	console.log(`phone removed: ${id}`)
	document.getElementById(id).remove();
	delete marionettes[id];
	delete assemblies[id];
	delete controllers[id];
	numMarionettes--;
	let i = 0;
	for (let j in marionettes) {
		marionettes[j].element.style.left = left(document.body.offsetWidth, numMarionettes, i++) + 'px';
	}
}
function update(motion: any) {
	if (!(motion.id in marionettes)) {
		return
	}

	let thing = marionettes[motion.id].phoneData;
	let element = marionettes[motion.id].element;

	thing.accelerate(motion.acc.x, motion.acc.y, motion.acc.z)
	thing.setRotation(-motion.rot.x, -motion.rot.z, -motion.rot.y)
	thing.update();

	let a = assemblies[motion.id];
	let c = controllers[motion.id];
	let ccenter = a.nodes[c.ccenter];
	ccenter.pos.x = -thing.pos.x/100;
	ccenter.pos.y = thing.pos.z/100+1.5;
	ccenter.pos.z = thing.pos.y/100;
	let ctop = a.nodes[c.ctop];
	ctop.pos.x = -thing.pos.x/100;
	ctop.pos.y = thing.pos.z/100+2;
	ctop.pos.z = thing.pos.y/100;
	let cleft = a.nodes[c.cleft];
	cleft.pos.x = -thing.pos.x/100-1;
	cleft.pos.y = thing.pos.z/100+1.5;
	cleft.pos.z = thing.pos.y/100;
	let cright = a.nodes[c.cright];
	cright.pos.x = -thing.pos.x/100+1;
	cright.pos.y = thing.pos.z/100+1.5;
	cright.pos.z = thing.pos.y/100;
	let cleft1 = a.nodes[c.cleft];
	cleft1.pos.x = -thing.pos.x/100-1;
	cleft1.pos.y = thing.pos.z/100+1.5;
	cleft1.pos.z = thing.pos.y/100+0.4;
	let cright1 = a.nodes[c.cright];
	cright1.pos.x = -thing.pos.x/100+1;
	cright1.pos.y = thing.pos.z/100+1.5;
	cright1.pos.z = thing.pos.y/100+0.4;
	let cback = a.nodes[c.cback];
	cback.pos.x = -thing.pos.x/100;
	cback.pos.y = thing.pos.z/100+1.5;
	cback.pos.z = thing.pos.y/100-1;
	let cfront = a.nodes[c.cfront];
	cfront.pos.x = -thing.pos.x/100;
	cfront.pos.y = thing.pos.z/100+1.5;
	cfront.pos.z = thing.pos.y/100+1;
	var p = thing.pos;
	var r = thing.rot;

	var s = 'rotateX(' + (r.z) + 'deg) rotateY(' + -r.y + 'deg) rotateZ(' + r.x + 'deg) translate3d(' + p.x + 'px,' + p.y + 'px,' + p.z + 'px)';
	element.style.transform = s;
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
	ctop: new Vec3(0,0.5,0),
	cleft: new Vec3(-1,0,0),
	cright: new Vec3(1,0,0),
	cleft1: new Vec3(-1,0,0.5),
	cright1: new Vec3(1,0,0.5),
	cback: new Vec3(0,0,-1),
	cfront: new Vec3(0,0,1)
}
const marionetteTemplate: AssemblyParams = {
	nodes: {
		head: {
			x: 0,
			y: 1 - 1,
			z: 0,
			w: 0.1,
			mass: 5.0,
			color: [1.5, 1.2, 0.8]
		},
		s1: {
			x: 0,
			y: 0.92 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [1.5, 1.2, 0.8]
		},
		s2: {
			x: 0,
			y: 0.88 - 1,
			z: -0.05,
			w: 0.03,
			mass: 5.0,
			color: [1.5, 1.2, 0.8]
		},
		s3: {
			x: 0,
			y: 0.75 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		s4: {
			x: 0,
			y: 0.64 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [1.5, 1.2, 0.8]
		},
		s5: {
			x: 0,
			y: 0.58 - 1,
			z: 0.04,
			w: 0.03,
			mass: 5.0,
			color: [1.5, 1.2, 0.8]
		},
		s6: {
			x: 0,
			y: 0.52 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		lshoulder: {
			x: 0.13,
			y: 0.91 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		lelbow: {
			x: 0.13,
			y: 0.7 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		lwrist: {
			x: 0.13,
			y: 0.52 - 1 + 0.48,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		rshoulder: {
			x: -0.13,
			y: 0.91 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		relbow: {
			x: -0.13,
			y: 0.7 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		rwrist: {
			x: -0.13,
			y: 0.52 - 1 + 0.48,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		lhip: {
			x: 0.06,
			y: 0.58 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		lknee: {
			x: 0.06,
			y: 0.29 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		lankle: {
			x: 0.06,
			y: 0.1 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		rhip: {
			x: -0.06,
			y: 0.58 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		rknee: {
			x: -0.06,
			y: 0.29 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		},
		rankle: {
			x: -0.06,
			y: 0.1 - 1,
			z: 0,
			w: 0.03,
			mass: 5.0,
			color: [0.8, 1.2, 1.5]
		}
	},
	constraints: [
		["head", "s1", 0.01],
		["s1", "s2", 0.01],
		["s2", "s3", 0.01],
		["s3", "s1", 0.01],
		["s3", "s4", 0.01],
		["s4", "s5", 0.01],
		["s5", "s6", 0.01],
		["s6", "s4", 0.01],
		["s1", "lshoulder", 0.01],
		["s2", "lshoulder", 0.01],
		["s3", "lshoulder", 0.01],
		["lshoulder", "lelbow", 0.01],
		["lelbow", "lwrist", 0.01],
		["s1", "rshoulder", 0.01],
		["s2", "rshoulder", 0.01],
		["s3", "rshoulder", 0.01],
		["rshoulder", "relbow", 0.01],
		["relbow", "rwrist", 0.01],
		["s4", "lhip", 0.01],
		["s5", "lhip", 0.01],
		["s6", "lhip", 0.01],
		["lhip", "lknee", 0.01],
		["lknee", "lankle", 0.01],
		["s4", "rhip", 0.01],
		["s5", "rhip", 0.01],
		["s6", "rhip", 0.01],
		["rhip", "rknee", 0.01],
		["rknee", "rankle", 0.01]
	]
};

function interpolate(v1: number, v2: number, p: number) {
	return (v2 - v1) * p + v1;
}
function createString(struct: AssemblyParams, sections: number, name: string, attachTo: string, x: number, y: number, z: number) {
	let destNode = struct.nodes[attachTo];
	for (let i = 0; i < sections; i++) {
		let p = i / sections;
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
		let p = i / sections;
		struct.nodes[name + i] = {
			x: interpolate(fromPos.x, toPos.x, p),
			y: interpolate(fromPos.y, toPos.y, p),
			z: interpolate(fromPos.z, toPos.z, p),
			w: 0.001,
			mass: 1,
			color: [0.8, 1.2, 1.5],
		};
		struct.constraints.push([name + i, name + (i + 1), 0.005]);
	}
	//struct.nodes[name + '0'].free = false;
	struct.constraints[struct.constraints.length - 1][1] = to;
	struct.constraints.push([from, name+'0', 0.005]);
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
			mass: 1.0,
			color: [1.5, 1.2, 0.8],
			free: false
		}
	}
	template.constraints.push(
		["ccenter", "ctop", 0.01],
		["ccenter", "cleft", 0.01],
		["ccenter", "cright", 0.01],
		["ccenter", "cleft1", 0.01],
		["ccenter", "cright1", 0.01],
		["ccenter", "cback", 0.01],
		["ccenter", "cfront", 0.01],
		["ctop", "cleft", 0.01],
		["ctop", "cright", 0.01],
		["ctop", "cleft1", 0.01],
		["ctop", "cright1", 0.01],
		["ctop", "cback", 0.01],
		["ctop", "cfront", 0.01],
		["cback", "cleft", 0.01],
		["cback", "cright", 0.01],
		["cleft", "cleft1", 0.01],
		["cright", "cright1", 0.01],
		["cleft1", "cfront", 0.01],
		["cright1", "cfront", 0.01]
	);
}

//createString(marionetteTemplate, 30, 'ropehead', 'head', 'ccenter', 0, 1.5, 0);
//createString(marionetteTemplate, 30, 'ropelwrist', 'lwrist', 'cleft', -.13, 1.5, 0);
//createString(marionetteTemplate, 30, 'roperwrist', 'rwrist', 'cright', .13, 1.5, 0);
createController(marionetteTemplate, controllerCenter, controllerVectors);
createRope(marionetteTemplate, 30, 'ropehead', 'head', 'ccenter');
createRope(marionetteTemplate, 30, 'ropelwrist', 'lwrist', 'cleft');
createRope(marionetteTemplate, 30, 'roperwrist', 'rwrist', 'cright');

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
	// verlet integration
	for (let i = 0; i < runs; i++) {
		// manage pointer
		/*
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
		*/
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
	Renderer.drawScene(assemblies);
}

run(0);