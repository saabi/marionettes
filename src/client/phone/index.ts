import { MotionData } from 'MotionData';
import * as io from 'socket.io-client';
import {Vec3} from 'VecMath';

interface Vec {
    x: number;
    y: number;
    z: number;
}

class Device {

    acc: Vec;
    accacc: Vec;
    avgacc: Vec;
    rot: Vec;
    drift: Vec;
    absolute: boolean;
    rounder: number;

    constructor(target: MotionData) {
        var avgaccDisplay = document.getElementById('avgacc')!;
        var accDisplay = document.getElementById('acc')!;
        var rotDisplay = document.getElementById('rot')!;

        this.acc = { x: 0, y: 0, z: 0 };
        this.avgacc = { x: 0, y: 0, z: 0 };
        this.drift = { x: 0, y: 0, z: 0 };
        this.rot = { x: 0, y: 0, z: 0 };
        this.accacc = { x: 0, y: 0, z: 0 };
        this.absolute = true;
        this.rounder = 10000;

        let handleOrientation = (event: DeviceOrientationEvent) => {
            var absolute = event.absolute;
            var alpha = event.alpha!;
            var beta = event.beta!;
            var gamma = event.gamma!;
            this.absolute = absolute;
            this.rot.x = -alpha;
            this.rot.y = -beta;
            this.rot.z = gamma;
            target.setRotation(this.rot.x, this.rot.y, this.rot.z);
            rotDisplay.innerText = absolute?'abs-' : 'rel-' + (alpha).toFixed(5) + ', ' + (beta).toFixed(5) + ', ' + (gamma).toFixed(5);
        }

        let handleMotion = (event: DeviceMotionEvent) => {
            var a = event.acceleration!;
            var da = this.acc;
            da.x = a.x!;
            da.y = a.y!;
            da.z = a.z!;
            var dd = this.drift;
            let rounder = this.rounder;
            var fax = Math.round(rounder * (da.x - dd.x)) / rounder;
            var fay = Math.round(rounder * (da.y - dd.y)) / rounder;
            var faz = Math.round(rounder * (da.z - dd.z)) / rounder;
            target.accelerate(fax, fay, faz);

            var daa = this.avgacc;
            daa.x = daa.x * 0.99 + da.x * 0.01;
            daa.y = daa.y * 0.99 + da.y * 0.01;
            daa.z = daa.z * 0.99 + da.z * 0.01;

            accDisplay.innerText = (fax).toFixed(5) + ', ' + (fay).toFixed(5) + ', ' + (faz).toFixed(5);
            avgaccDisplay.innerText = (daa.x - dd.x).toFixed(5) + ', ' + (daa.y - dd.y).toFixed(5) + ', ' + (daa.z - dd.z).toFixed(5);
        }

        let handleTouch = (event: TouchEvent) => {
            this.drift.x = this.avgacc.x;
            this.drift.y = this.avgacc.y;
            this.drift.z = this.avgacc.z;
            target.damping = .99;
            target.centerAttraction = 0.0001;
            target.reset();
        }
        window.addEventListener("deviceorientation", handleOrientation, true);
        window.addEventListener("devicemotion", handleMotion, true);
        //window.addEventListener("touchend", handleTouch, true);
    }
}

const controllerVectors = {
	clefta: new Vec3(-1,0,0),
	crighta: new Vec3(1,0,0),
	cleft: new Vec3(-1,0,0.5),
	cright: new Vec3(1,0,0.5),
	cback: new Vec3(0,0,-1),
	cfront: new Vec3(0,0,1)
}

interface StringPulls {
    [name:string]: Vec3;
}
const stringPulls: StringPulls = {};

class Controller {
    children: HTMLDivElement[] = [];

    constructor (element: HTMLElement) {
        let children = element.getElementsByClassName('handle');
        for (let i = 0; i < children.length; i++) {
            let el = <HTMLDivElement>children[i];
            this.children.push(el);
            let v = <Vec3>(<any>controllerVectors)[el.id] || new Vec3();
            el.style.left = -v.x * 25 + 44 + 'vw';
            el.style.top = -v.z * 25 + 44 + 'vw';
        }
        element.ontouchstart = (ev:TouchEvent) => {
            ev.preventDefault();
        }
        element.ontouchmove = (ev:TouchEvent) => {
            ev.preventDefault();
            for (let i = 0; i < ev.touches.length; i++) {
                let t = ev.touches[i];
                let el1 = <HTMLDivElement>t.target;
                if (el1 === element)
                    continue;
                let x = t.pageX - element.offsetLeft;
                let y = t.pageY - element.offsetTop;
                el1.style.left = 100 * (x -element.offsetWidth*0.03) / element.offsetWidth + 'vw';
                el1.style.top = 100 * (y -element.offsetWidth*0.03) / element.offsetHeight + 'vw';
                let v1 = <Vec3>(<any>controllerVectors)[el1.id] || new Vec3()
                stringPulls[el1.id] = new Vec3(-4 * x / element.offsetWidth + 2, 0, -4 * y / element.offsetHeight + 2).sub(v1);
            }
        }
        element.ontouchend = (ev:TouchEvent) => {
            ev.preventDefault();
            for (let i = 0; i < ev.changedTouches.length; i++) {
                let t = ev.changedTouches[i];
                let el2 = <HTMLDivElement>t.target;
                if (el2 === element)
                    continue;
                let v = <Vec3>(<any>controllerVectors)[el2.id] || new Vec3();
                el2.style.left = -v.x * 25 + 44 + 'vw';
                el2.style.top = -v.z * 25 + 44 + 'vw';
                delete stringPulls[el2.id];
            }
        }
}
}

var data = new MotionData();
var phone = new Device(data);
var originOrientation = {x:0,y:0,z:0};
//let element = document.getElementById('thing');

let resetButton = document.getElementById('resetButton')!;
resetButton.onclick = () => {
    originOrientation = {x: phone.rot.x, y: phone.rot.y, z: phone.rot.z };
}

var socket = io();
socket.on('connect', () => {
    socket.emit('device', 'phone');
});

function update() {
    data.update();

    let rot = {x: phone.rot.x - originOrientation.x, y: phone.rot.y - originOrientation.y, z: phone.rot.z - originOrientation.z }
    var message = {
        acc: phone.acc,
        rot: rot,
        pulls: stringPulls
    }
    socket.emit('message', message);

    var p = data.pos;
    var r = data.rot;

    //var s = 'rotateX(' + r.y + 'deg) rotateY(' + -r.z + 'deg) rotateZ(' + r.x + 'deg) translate3d(' + p.x + 'px,' + p.y + 'px,' + p.z + 'px)';
    //element.style.transform = s;
}

new Controller(document.getElementById('controller')!);
setInterval(update, 16);
