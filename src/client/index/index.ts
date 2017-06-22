import {Thing} from 'thing';
import * as io from 'socket.io-client';

interface Vec {
    x:number;
    y:number;
    z:number;
}

interface Puppet {
    element: HTMLElement;
    thing: Thing;
}
interface Puppets {
    [id:string]:Puppet;
}
let puppets: Puppets = {};
let numPuppets = 0;

function left(width, count, index) {
    let mid = width/count/2;
    return mid+index*width/count;
}
function addPuppet(id:string) {
    console.log(`phone added: ${id}`)
    let thing = new Thing();

    let puppet = {
        element: document.createElement('div'),
        thing: new Thing
    }
    numPuppets++;
    puppet.element.id = id;
    puppet.element.className = 'thing'
    document.body.appendChild(puppet.element);
    puppets[id] = puppet;
    let i = 0;
    for (let j in puppets) {
        puppets[j].element.style.left = left(document.body.offsetWidth, numPuppets, i++)+'px';
    }
}
function removePuppet(id:string) {
    console.log(`phone removed: ${id}`)
    document.getElementById(id).remove();
    delete puppets[id];
    numPuppets--;
    let i = 0;
    for (let j in puppets) {
        puppets[j].element.style.left = left(document.body.offsetWidth, numPuppets, i++)+'px';
    }
}
function update(motion:any) {
    if (!(motion.id in puppets)) {
        return
    }

    let thing = puppets[motion.id].thing;
    let element = puppets[motion.id].element;

    thing.accelerate(motion.acc.x, motion.acc.y, motion.acc.z )
    thing.setRotation(-motion.rot.x, -motion.rot.z, -motion.rot.y )
    thing.update();

    var p = thing.pos;
    var r = thing.rot;

    var s = 'rotateZ('+r.x+'deg) rotateY('+-r.y+'deg) rotateX('+r.z+'deg) translate3d('+(p.x-50)+'px,'+(p.y-80)+'px,'+p.z+'px)';
    element.style.transform = s;
}

let socket = io();
socket.on('connect', () => {
    socket.emit('device', 'desktop');
});

socket.on('phoneadded', addPuppet);
socket.on('phoneremoved', removePuppet);
socket.on('motion', update);

