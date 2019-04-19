//import * as io from 'socket.io-client';

/*
function left(width: number, count: number, index: number) {
	let mid = width / count / 2;
	return mid + index * width / count;
}
*/
import { Vec3 } from './VecMath';
import { Marionette } from './Marionette';
import { Renderer, AssemblyList } from './Renderer';

interface MarionetteAddedMessage {
	id: string;
	slot: number;
}

interface MarionetteList {
	[id: string]: Marionette;
}

let marionettes: MarionetteList = {};
const assemblies: AssemblyList = {};


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

export function addMarionette(msg: MarionetteAddedMessage) {
	console.log(`phone added: ${msg.id} - ${msg.slot}`);
	let id = msg.id;
	let slot = msg.slot;

	let p = Math.ceil(slot/2) * ( (slot%2)===0 ? 2 : -2 ); 
	let origin = new Vec3(p, 4, 0);
	let target = new Vec3(p, 0, 0);
	let marionette: Marionette = new Marionette(origin, target);
	marionettes[id] = marionette;
	assemblies[id] = marionette.assembly;
}
export function removeMarionette(id: string) {
	console.log(`phone removed: ${id}`)
	delete marionettes[id];
	delete assemblies[id];
}
export function update(motion: any) {
	if (!(motion.id in marionettes)) {
		return
	}

	let marionette = marionettes[motion.id];
	marionette.update(motion);

	//d.innerText = JSON.stringify(motion.pulls)
}

export function start() {
    run(0);
}
/*
let d = document.createElement('pre');
d.style.position = 'absolute';
d.style.color = 'white;'
document.body.appendChild(d);
*/