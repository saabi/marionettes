import {Thing} from 'thing';
import * as io from 'socket.io-client';
import {init, Struct} from 'verlet3';

/*
interface Vec {
    x:number;
    y:number;
    z:number;
}
*/

interface Puppet {
    element: HTMLElement;
    thing: Thing;
}
interface Puppets {
    [id:string]:Puppet;
}
let puppets: Puppets = {};
let numPuppets = 0;

function left(width: number, count: number, index: number) {
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

const struct:Struct = {
  nodes: {
    head: {
      x: 0,
      y: 1-1,
      z: 0,
      w: 0.1,
      mass: 1.0,
      color: [1.5, 1.2, 0.8]
    },
    s1: {
      x: 0,
      y: 0.92-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [1.5, 1.2, 0.8]
    },
    s2: {
      x: 0,
      y: 0.88-1,
      z: 0.04,
      w: 0.03,
      mass: 1.0,
      color: [1.5, 1.2, 0.8]
    },
    s3: {
      x: 0,
      y: 0.84-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    s4: {
      x: 0,
      y: 0.6-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [1.5, 1.2, 0.8]
    },
    s5: {
      x: 0,
      y: 0.56-1,
      z: 0.04,
      w: 0.03,
      mass: 1.0,
      color: [1.5, 1.2, 0.8]
    },
    s6: {
      x: 0,
      y: 0.52-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    lshoulder: {
      x: 0.13,
      y: 0.91-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    lelbow: {
      x: 0.13,
      y: 0.7-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    lwrist: {
      x: 0.13,
      y: 0.52-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    rshoulder: {
      x: -0.13,
      y: 0.91-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    relbow: {
      x: -0.13,
      y: 0.7-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    rwrist: {
      x: -0.13,
      y: 0.52-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    lhip: {
      x: 0.06,
      y: 0.58-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    lknee: {
      x: 0.06,
      y: 0.29-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    lankle: {
      x: 0.06,
      y: 0-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    rhip: {
      x: -0.06,
      y: 0.58-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    rknee: {
      x: -0.06,
      y: 0.29-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    rankle: {
      x: -0.06,
      y: 0-1,
      z: 0,
      w: 0.03,
      mass: 1.0,
      color: [0.8, 1.2, 1.5]
    },
    // light
    light: {
      x: 0,
      y: 1.2,
      z: 0,
      w: 0.1,
      mass: 0.6,
      color: [1000.0, 1000.0, 1000.0],
      free: false
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
    return (v2-v1)*p+v1;
}
function createString(struct: Struct, sections:number, name: string, attachTo: string, x: number, y: number, z: number) {
    let destNode = struct.nodes[attachTo];
    for (let i=0; i<sections; i++) {
        let p = i/sections;
        struct.nodes[name+i] = {
        x: interpolate(x, destNode.x, p),
        y: interpolate(y, destNode.y, p),
        z: interpolate(z, destNode.z, p),
        w: 0.003,
        mass: 0.01,
        color: [0.8, 1.2, 1.5],
        };
        struct.constraints.push([name+i, name+(i+1), 0.005]);
    }
    struct.nodes[name+'0'].free = false;
    struct.constraints[struct.constraints.length-1][1] = attachTo;
}

createString(struct, 15, 'shead', 'head', 0, 1.5, 0);
createString(struct, 15, 'slwrist', 'lwrist', -.13, 1.02, 0);
createString(struct, 15, 'srwrist', 'rwrist', .13, 1.02, 0);

init(struct);