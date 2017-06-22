import {Thing} from 'thing';
import * as io from 'socket.io-client';

interface Vec {
    x:number;
    y:number;
    z:number;
}

class Device {

    acc: Vec;
    accacc: Vec;
    avgacc: Vec;
    rot: Vec;
    drift: Vec;
    absolute: boolean;
    rounder: number;

    constructor ( target: Thing ) {
        var avgaccDisplay = document.getElementById('avgacc');
        var accDisplay = document.getElementById('acc');
        var rotDisplay = document.getElementById('rot');
        
        this.acc = {x:0, y:0, z:0};
        this.avgacc = {x:0, y:0, z:0};
        this.drift = {x:0, y:0, z:0};
        this.rot = {x:0, y:0, z:0};
        this.accacc = {x:0, y:0, z:0};
        this.absolute = true;
        this.rounder = 10000;

        let handleOrientation = ( event:DeviceOrientationEvent ) => {
            var absolute = event.absolute;
            var alpha    = event.alpha;
            var beta     = event.beta;
            var gamma    = event.gamma;
            this.absolute = absolute;
            this.rot.x = alpha;
            this.rot.y = beta;
            this.rot.z = gamma;
            target.setRotation(beta, alpha, gamma);
            rotDisplay.innerText = (alpha).toFixed(5) + ', ' + (beta).toFixed(5) + ', ' + (gamma).toFixed(5);
        }

        let handleMotion = ( event:DeviceMotionEvent ) => {
            var a = event.acceleration;
            var da = this.acc;
            da.x = a.x;
            da.y = a.y;
            da.z = a.z;
            var dd = this.drift;
            let rounder = this.rounder;
            var fax = -Math.round(rounder*(da.x-dd.x))/rounder;
            var fay =  Math.round(rounder*(da.y-dd.y))/rounder;
            var faz = -Math.round(rounder*(da.z-dd.z))/rounder;
            target.accelerate(fax, fay, faz);

            var daa = this.avgacc;
            daa.x = daa.x * 0.99 + a.x * 0.01;
            daa.y = daa.y * 0.99 + a.y * 0.01;
            daa.z = daa.z * 0.99 + a.z * 0.01;

            accDisplay.innerText = (fax).toFixed(5) + ', ' + (fay).toFixed(5) + ', ' + (faz).toFixed(5);
            avgaccDisplay.innerText = (daa.x-dd.x).toFixed(5) + ', ' + (daa.y-dd.y).toFixed(5) + ', ' + (daa.z-dd.z).toFixed(5);
        }

        let handleTouch = ( event:TouchEvent ) => {
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

var thing = new Thing();
var phone = new Device(thing);

let element = document.getElementById('thing')

var socket = io();
socket.on('connect', () => {
    socket.emit('device', 'phone');
});

function update() {
    thing.update();

    var message = {
        acc: phone.acc,
        rot: phone.rot
    }
    socket.emit('message', message);

    var p = thing.pos;
    var r = thing.rot;

    var s = 'rotateZ('+r.x+'deg) rotateY('+-r.y+'deg) rotateX('+r.z+'deg) translate3d('+(p.x-25)+'px,'+(p.y-40)+'px,'+p.z+'px)';
    element.style.transform = s;
}

setInterval(update, 16);
