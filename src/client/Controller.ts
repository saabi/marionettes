import { Vec3 } from './VecMath';

interface Vec {
	x: number;
	y: number;
	z: number;
}
/*
async function initSensors() {
	const canAcc = await navigator.permissions.query({ name: 'accelerometer' });
	if (canAcc.state === 'denied') {
		console.log('Permission to use accelerometer sensor is denied.');
		return;
	}
	const canRot = await navigator.permissions.query({ name: 'gyroscope' });
	if (canRot.state === 'denied') {
		console.log('Permission to use accelerometer sensor is denied.');
		return;
	}
	console.log('Can use both sensors!');

	const sensor = new AbsoluteOrientationSensor({frequency: 1});
	sensor.onerror = event => {
		console.log(event);
	};
	sensor.onreading = ev => {
		console.log(ev);
	}
	sensor.start();
}
*/

export class Device {

	acc: Vec;
	accacc: Vec;
	avgacc: Vec;
	rot: Vec;
	drift: Vec;
	absolute: boolean;
	avgGravity: Vec;
	gravitySamples: number = 0;
	//rounder: number;

	useRawAcceleration = false;

	constructor() {
		//initSensors();

		this.acc = { x: 0, y: 0, z: 0 };
		this.avgacc = { x: 0, y: 0, z: 0 };
		this.drift = { x: 0, y: 0, z: 0 };
		this.rot = { x: 0, y: 0, z: 0 };
		this.accacc = { x: 0, y: 0, z: 0 };
		this.absolute = true;
		this.avgGravity = { x: 0, y: 0, z: 0 };

		let handleOrientation = (ev: /*DeviceOrientation*/Event) => {
			const event = <DeviceOrientationEvent>ev;
			const absolute = event.absolute;
			const alpha = event.alpha!;
			const beta = event.beta!;
			const gamma = event.gamma!;
			this.absolute = absolute;
			this.rot.x = -alpha;
			this.rot.y = -beta;
			this.rot.z = gamma;
		}

		let handleMotion = (ev: /*DeviceMotion*/Event) => {
			const event = <DeviceMotionEvent>ev;
			let tmpVec: Vec3 | Vec | DeviceAcceleration | null = null;
			let accVec: Vec = {x:0, y: 0, z: 0};
			if (!this.useRawAcceleration) {
				tmpVec = event.acceleration;
				if (tmpVec && tmpVec.x) {
					//accVec = {x:tmpVec.x, y: tmpVec.y!, z: tmpVec.z!};
					accVec.x = tmpVec.x;
					accVec.y = tmpVec.y!;
					accVec.z = tmpVec.z!;	
				}
			}
			if (this.useRawAcceleration || !tmpVec || !tmpVec.x) {
				tmpVec = event.accelerationIncludingGravity;
				if (!tmpVec || !tmpVec.x)
					return; //throw new Error('Acceleration sensor not supported.')

				let myAcc = new Vec3(tmpVec.x, tmpVec.y!, tmpVec.z!);
				let myAcc1 = new Vec3(tmpVec.x, tmpVec.y!, tmpVec.z!);
				if (this.gravitySamples < 500) {
					const ag = this.avgGravity;
					ag.x = ag.x  + myAcc.x;
					ag.y = ag.y  + myAcc.y;
					ag.z = ag.z  + myAcc.z;
					this.gravitySamples++;
					myAcc.sub(myAcc1.normalize().mul(9.81));
				}
				else {
					const ag = this.avgGravity;
					let myAcc2 = new Vec3(ag.x, ag.y!, ag.z!);
					myAcc.sub(myAcc1.normalize().mul(myAcc2.mul(1/500).length()));

					//myAcc.sub(myAcc1.mul(1/500));
				}
					
				//accVec = {x: myAcc.x, y: myAcc.y!, z: myAcc.z!};

				accVec.x = myAcc.x;
				accVec.y = myAcc.y;
				accVec.z = myAcc.z;
			}
			var da = this.acc;
			da.x = accVec.x;
			da.y = accVec.y;
			da.z = accVec.z;

			var daa = this.avgacc;
			daa.x = daa.x * 0.99 + da.x * 0.01;
			daa.y = daa.y * 0.99 + da.y * 0.01;
			daa.z = daa.z * 0.99 + da.z * 0.01;
		}
/*
		let handleTouch = (event: TouchEvent) => {
			this.drift.x = this.avgacc.x;
			this.drift.y = this.avgacc.y;
			this.drift.z = this.avgacc.z;
		}*/
//		window.ondeviceorientation = handleOrientation;
		window.addEventListener("deviceorientation", handleOrientation, true);
		window.addEventListener("devicemotion", handleMotion, true);
		//window.addEventListener("touchend", handleTouch, true);
	}
}

interface StringPulls {
	[name: string]: Vec3;
}

const controllerVectors: StringPulls = {
	clefta: new Vec3(-1, 0, 0),
	crighta: new Vec3(1, 0, 0),
	cleft: new Vec3(-1, 0, 0.5),
	cright: new Vec3(1, 0, 0.5),
	cback: new Vec3(0, 0, -1),
	cfront: new Vec3(0, 0, 1)
}

// Firefox resets some properties in stored/cached 
// Event objects when new events are fired so
// we have to store a clone.
// TODO: Should we store the original object when using Chrome?
function iterationCopy(src: any) {
	let target: any = {};
	for (let prop in src) {
		target[prop] = src[prop];
	}
	return <PointerEvent>target;
}

class PointerEventCache {
	readonly pointers: PointerEvent[] = [];

	storeEvent(ev: PointerEvent) {
		const pointers = this.pointers;
		for (var i = 0; i < pointers.length; i++) {
			if (pointers[i].pointerId === ev.pointerId) {
				const evClone = iterationCopy(ev);
				pointers[i] = evClone;
				break;
			}
		}
		if (i === pointers.length)
			pointers.push(ev);
	}
	findEvent(ev: PointerEvent) {
		const pointers = this.pointers;
		for (var i = 0; i < pointers.length; i++)
			if (pointers[i].pointerId === ev.pointerId)
				return pointers[i];
		return null;
	}
	removeEvent(ev: PointerEvent) {
		const pointers = this.pointers;
		for (var i = 0; i < pointers.length; i++) {
			if (pointers[i].pointerId === ev.pointerId) {
				pointers.splice(i, 1);
				break;
			}
		}
	}
}

export class StringController {
	readonly stringPulls: StringPulls = {};
	readonly children: HTMLDivElement[] = [];
	peCache = new PointerEventCache();

	constructor(element: HTMLElement, classes: string) {
		const stringNames = Object.keys(controllerVectors);
		for (let i = 0; i < stringNames.length; i++) {
			const name = stringNames[i];
			const v = controllerVectors[name];

			const el = document.createElement('div');
			element.appendChild(el);
			el.id = name;
			el.className = classes;
			el.style.left = -v.x * 25 + 44 + '%';
			el.style.top = -v.z * 25 + 44 + '%';

			this.children.push(el);

			let ox = 0;
			let oy = 0;
			el.onpointerdown = (ev: PointerEvent) => {
				/*if (name !== ev.target!.id)
					throw new Error('fuck!');*/

				ev.preventDefault();
				ox = ev.offsetX;
				oy = ev.offsetY;

				el.setPointerCapture(ev.pointerId);
				this.peCache.storeEvent(ev);
			}
			el.onpointermove = (ev: PointerEvent) => {
				/*if (name !== ev.target!.id)
					throw new Error('fuck!');*/

				ev.preventDefault();
				if (!this.peCache.findEvent(ev))
					return;

				let x = el.offsetLeft - ox + ev.offsetX;
				let y = el.offsetTop - oy + ev.offsetY;
				x *= 100 / element.offsetWidth;
				y *= 100 / element.offsetHeight;

				el.style.left = x + '%';
				el.style.top = y + '%';
				let v1 = controllerVectors[name];
				this.stringPulls[name] = new Vec3(-4 * x/100 + 2, 0, -4 * y/100 + 2).sub(v1);

				this.peCache.storeEvent(ev);
			}
			el.onpointerup = (ev:PointerEvent) => {
				/*if (name !== ev.target!.id)
					throw new Error('fuck!');*/

				ev.preventDefault();

				let v = controllerVectors[name];
				el.style.left = -v.x * 25 + 44 + '%';
				el.style.top = -v.z * 25 + 44 + '%';
				delete this.stringPulls[name];

				el.releasePointerCapture(ev.pointerId);
				this.peCache.removeEvent(ev);
			}
			/*
			el.onpointercancel = () => {
				console.log('cancel');
			}
			el.onpointerover = () => {
				console.log('over');
			}
			el.onpointerout = () => {
				console.log('out');
			}
			el.onpointerenter = () => {
				console.log('enter');
			}
			el.onpointerleave = () => {
				console.log('leave');
			}
			*/
		}
	}
}
