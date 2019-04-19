import { Vec3 } from './VecMath';

export class MotionData {
    pos = new Vec3;
    vel = new Vec3;
    rot = new Vec3;
    damping = 0.8;
    centerAttraction = 0.003;

    accelerate(ax: number, ay: number, az: number) {
        var v = this.vel;
        v.x += ax;
        v.y += ay;
        v.z += az;
    }
    move(dx: number, dy: number, dz: number) {
        this.pos.x += dx;
        this.pos.y += dy;
        this.pos.z += dz;
    }
    setRotation(x: number, y: number, z: number) {
        this.rot.x = x;
        this.rot.y = y;
        this.rot.z = z;
    }
    getPosition() {
        var p = this.pos;
        return { x: p.x, y: p.y, z: p.z };
    };
    update() {
        // dampen
        var v = this.vel;
        v.x *= this.damping;
        v.y *= this.damping;
        v.z *= this.damping;

        //accelerate towards center
        var p = this.pos;
        v.x -= p.x * this.centerAttraction;
        v.y -= p.y * this.centerAttraction;
        v.z -= p.z * this.centerAttraction;
        this.move(v.x, v.y, v.z);
    }
    reset() {
        this.pos.set(0, 0, 0);
        this.vel.set(0, 0, 0);
        this.rot.set(0, 0, 0);
    }

} 