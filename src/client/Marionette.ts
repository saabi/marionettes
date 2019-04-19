import { MotionData } from './MotionData';
import { AssemblyParams, Assembly } from './VerletIntegration';
import { Vec3, Mat4 } from './VecMath';

const controllerCenter = new Vec3(0, 1.5, 0);
const controllerVectors = {
	clefta: new Vec3(-1,0,0),
	crighta: new Vec3(1,0,0),
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
		["ccenter", "clefta", 0.02, 1],
		["ccenter", "crighta", 0.02, 1],
		["ccenter", "cback", 0.02, 1],
		["ccenter", "cfront", 0.02, 1]
	);
}

createController(marionetteTemplate, controllerCenter, controllerVectors);
createRope(marionetteTemplate, 30, 'ropeccenter', 'ccenter', 'head');
createRope(marionetteTemplate, 30, 'ropecleft', 'cleft', 'lwrist');
createRope(marionetteTemplate, 30, 'ropecright', 'cright', 'rwrist');
createRope(marionetteTemplate, 30, 'ropeclefta', 'clefta', 'lknee');
createRope(marionetteTemplate, 30, 'ropecrighta', 'crighta', 'rknee');
createRope(marionetteTemplate, 30, 'ropecback', 'cback', 's4');

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

export class Marionette {
	phoneData: MotionData;
	assembly: Assembly;
	origin: Vec3;
	target: Vec3;
	lifeTime: number;
    ropes: string[];
    controllerMapping: {[name:string]: number;};

    constructor( origin:Vec3, target:Vec3, ) {
        this.phoneData = new MotionData();
        this.origin = origin;
        this.target = target;
        this.lifeTime = 0;
        this.ropes = ['ccenter', 'cleft', 'clefta', 'cright', 'crighta', 'cback'];
        this.assembly = new Assembly(marionetteTemplate, origin);
        this.phoneData = new MotionData();
        this.controllerMapping = {
            ccenter:-1,
            cright:-1,
            cleft:-1,
            crighta:-1,
            clefta:-1,
            cfront:-1,
            cback:-1
        }

        let ns = this.assembly.nodes;
        for (let i = 0; i < ns.length; i++) {
            if (ns[i].name in this.controllerMapping)
            this.controllerMapping[ns[i].name] = i;
        }
    }

    update(motion:any) {
        let thing = this.phoneData;
        let origin = this.origin;
        let target = this.target;
        let phase = this.lifeTime/3;
        if (phase >1) 
        	phase = 1;
        let p = EasingFunctions.easeInOutCubic(phase)
    
        thing.accelerate(motion.acc.x, motion.acc.y, motion.acc.z)
        thing.setRotation(motion.rot.x, motion.rot.z, motion.rot.y)
        thing.update();
    
        var pos = thing.pos;
        var p1 = new Vec3(
            origin.x * (1-p) + target.x * p + controllerCenter.x + pos.x/100,
            origin.y * (1-p) + target.y * p + controllerCenter.y + pos.z/100,
            origin.z * (1-p) + target.z * p + controllerCenter.z + pos.y/100
        );
        var r = thing.rot;
        this.positionController(controllerVectors, p1, r);
        for (let i in this.ropes) {
            let n = this.ropes[i];
            this.freeRope(n);
            if (motion.pulls !== undefined && (n in motion.pulls)) {
                let fv = motion.pulls[n];
                this.grabRope(n, new Vec3(fv.x, fv.y, fv.z), r);
            }
        }    
    }
    freeRope(rope:string) {
        for(let i = 0; i<30; i++) {
            let n1 = this.assembly.nodeIndex['rope'+rope+i.toString()];
            n1.free = true;
        }
    }
    grabRope(rope:string, v:Vec3, rot: Vec3) {
        let mat = new Mat4();
        mat.rotatey(-rot.x);
        mat.rotatez(rot.y);
		mat.rotatex(rot.z);
		v.transformMat4(v, mat)
        let l = 0;
        let d = v.length();
        let n = this.assembly.nodeIndex[rope];
        let ni = 0;
        let md = 0;
        for(let i = 0; i<29; i++) {
            let n1 = this.assembly.nodeIndex['rope'+rope+i.toString()];
            n1.free = true;
            if (l<d) {
                md = n.pos.distance(n1.pos);
                l += md;
                n = n1;
                ni = i;
            }
        }
        v.mul(d/l);
        let a = (90 - ni * 2) * Math.PI/180;
        v.mul(Math.cos(a))
        v.y = -Math.sin(a)*l;

        n.free = false;
        n.pos = new Vec3().copy(this.assembly.nodeIndex[rope].pos).add(v);
    }
    positionController(vectors:any, pos: Vec3, rot: Vec3) {
        let mapping = this.controllerMapping;
        let mat = new Mat4();
        mat.trans(pos.x, pos.y, pos.z);
        mat.rotatey(-rot.x);
        mat.rotatez(rot.y);
        mat.rotatex(rot.z);
        for (let n in vectors) {
            let v = <Vec3>vectors[n];
            let p = this.assembly.nodes[mapping[n]].pos
            p.transformMat4(v, mat);
        }
        this.assembly.nodes[mapping['ccenter']].pos.set(pos.x, pos.y, pos.z);
    }
}
