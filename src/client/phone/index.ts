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
        var avgaccDisplay = document.getElementById('avgacc');
        var accDisplay = document.getElementById('acc');
        var rotDisplay = document.getElementById('rot');

        this.acc = { x: 0, y: 0, z: 0 };
        this.avgacc = { x: 0, y: 0, z: 0 };
        this.drift = { x: 0, y: 0, z: 0 };
        this.rot = { x: 0, y: 0, z: 0 };
        this.accacc = { x: 0, y: 0, z: 0 };
        this.absolute = true;
        this.rounder = 10000;

        let handleOrientation = (event: DeviceOrientationEvent) => {
            var absolute = event.absolute;
            var alpha = event.alpha;
            var beta = event.beta;
            var gamma = event.gamma;
            this.absolute = absolute;
            if (!absolute) {
                this.rot.x = alpha;
                this.rot.y = beta;
                this.rot.z = gamma;
            }
            else {
                this.rot.x += alpha;
                this.rot.y += beta;
                this.rot.z += gamma;
            }
            target.setRotation(this.rot.x, this.rot.y, this.rot.z);
            rotDisplay.innerText = absolute?'abs' : 'rel' + (alpha).toFixed(5) + ', ' + (beta).toFixed(5) + ', ' + (gamma).toFixed(5);
        }

        let handleMotion = (event: DeviceMotionEvent) => {
            var a = event.acceleration;
            var da = this.acc;
            da.x = a.x;
            da.y = a.y;
            da.z = a.z;
            var dd = this.drift;
            let rounder = this.rounder;
            var fax = -Math.round(rounder * (da.x - dd.x)) / rounder;
            var fay = Math.round(rounder * (da.y - dd.y)) / rounder;
            var faz = -Math.round(rounder * (da.z - dd.z)) / rounder;
            target.accelerate(fax, fay, faz);

            var daa = this.avgacc;
            daa.x = daa.x * 0.99 + a.x * 0.01;
            daa.y = daa.y * 0.99 + a.y * 0.01;
            daa.z = daa.z * 0.99 + a.z * 0.01;

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
        window.addEventListener("touchend", handleTouch, true);
    }
}

const controllerVectors = {
	cleft1: new Vec3(-1,0,0),
	cright1: new Vec3(1,0,0),
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
            el.style.left = v.x * 25 + 48 + 'vw';
            el.style.top = -v.z * 25 + 48 + 'vw';
            el.ontouchmove = (ev:TouchEvent) => {
                let t = ev.touches[0];
                let x = t.pageX - element.offsetLeft;
                let y = t.pageY - element.offsetTop;
                el.style.left = 100*x/element.offsetWidth + 'vw';
                el.style.top = 100*y/element.offsetHeight + 'vw';
                let v1
                let v = <Vec3>(<any>controllerVectors)[ev.srcElement.id] || new Vec3()
                stringPulls[ev.srcElement.id] = new Vec3()
            }
            el.ontouchend = (ev:TouchEvent) => {
                let v = <Vec3>(<any>controllerVectors)[ev.srcElement.id] || new Vec3();
                el.style.left = v.x * 25 + 48 + 'vw';
                el.style.top = -v.z * 25 + 48 + 'vw';                    
            }
        }
    }
}

var data = new MotionData();
var phone = new Device(data);
var originOrientation = {x:0,y:0,z:0};
//let element = document.getElementById('thing');

let resetButton = document.getElementById('resetButton');
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
        rot: rot
    }
    socket.emit('message', message);

    var p = data.pos;
    var r = data.rot;

    //var s = 'rotateX(' + r.y + 'deg) rotateY(' + -r.z + 'deg) rotateZ(' + r.x + 'deg) translate3d(' + p.x + 'px,' + p.y + 'px,' + p.z + 'px)';
    //element.style.transform = s;
}

new Controller(document.getElementById('controller'));
setInterval(update, 16);
