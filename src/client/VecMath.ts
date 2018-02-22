interface Camera {
	fov: number;
	aspect: number;
	near: number;
	far: number;
}

export class Vec3 {
	x: number;
	y: number;
	z: number;

	constructor(x = 0.0, y = 0.0, z = 0.0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	copy(v: Vec3) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	}

	get() {
		return [this.x, this.y, this.z];
	}

	add(v: Vec3) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}
	sub(v: Vec3) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	}
	mul(v: number) {
		this.x *= v;
		this.y *= v;
		this.z *= v;
		return this;
	}

	length () {
		const dx = this.x;
		const dy = this.y;
		const dz = this.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);		
	}
	distance(b: Vec3) {
		const dx = b.x - this.x;
		const dy = b.y - this.y;
		const dz = b.z - this.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

	transformMat4(v: Vec3, mat: Mat4) {
		const m = mat.data;
		const x = v.x;
		const y = v.y;
		const z = v.z;
		const w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
		this.x = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
		this.y = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
		this.z = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
		return this;
	}

}

export class Mat3 {
	data: Float32Array;

	constructor() {

		this.data = new Float32Array(9);
		this.ident();

	}

	ident() {

		const d = this.data;
		d[0] = 1;
		d[1] = 0;
		d[2] = 0;
		d[3] = 0;
		d[4] = 1;
		d[5] = 0;
		d[6] = 0;
		d[7] = 0;
		d[8] = 1;
		return this;

	}

	fromMat4Rot(source: Mat4) {
		return source.toMat3Rot(this);
	}

}

export class Mat4 {
	data: Float32Array;

	constructor() {

		this.data = new Float32Array(16);
		this.ident();

	}

	static fromArray(a: number[]) {
		const mat = new Mat4();
		if (a.length !== 16)
			throw new Error('Wrong array size!');
		
		for (let i = 0; i < mat.data.length; i++) {
			mat.data[i] = a[i];
		}
		return mat;
	}

	ident() {

		const d = this.data;
		d[0] = 1;
		d[1] = 0;
		d[2] = 0;
		d[3] = 0;
		d[4] = 0;
		d[5] = 1;
		d[6] = 0;
		d[7] = 0;
		d[8] = 0;
		d[9] = 0;
		d[10] = 1;
		d[11] = 0;
		d[12] = 0;
		d[13] = 0;
		d[14] = 0;
		d[15] = 1;
		return this;

	}

	zero() {

		const d = this.data;
		d[0] = 0;
		d[1] = 0;
		d[2] = 0;
		d[3] = 0;
		d[4] = 0;
		d[5] = 0
		d[6] = 0;
		d[7] = 0;
		d[8] = 0;
		d[9] = 0;
		d[10] = 0;
		d[11] = 0;
		d[12] = 0;
		d[13] = 0;
		d[14] = 0;
		d[15] = 0;
		return this;

	}

	set(a00: number, a10: number, a20: number, a30: number, a01: number, a11: number, a21: number, a31: number, a02: number, a12: number, a22: number, a32: number, a03: number, a13: number, a23: number, a33: number) {

		const d = this.data;
		d[0] = a00;
		d[4] = a10;
		d[8] = a20;
		d[12] = a30;
		d[1] = a01;
		d[5] = a11;
		d[9] = a21;
		d[13] = a31;
		d[2] = a02;
		d[6] = a12;
		d[10] = a22;
		d[14] = a32;
		d[3] = a03;
		d[7] = a13;
		d[11] = a23;
		d[15] = a33;
		return this;

	}

	perspective(data: Camera) {

		const fov = data.fov || 60;
		const aspect = data.aspect || 1;
		const near = data.near || 0.01;
		const far = data.far || 100;
		this.zero();
		const d = this.data;
		const top = near * Math.tan(fov * Math.PI / 360);
		const right = top * aspect;
		const left = -right;
		const bottom = -top;
		d[0] = (2 * near) / (right - left);
		d[5] = (2 * near) / (top - bottom);
		d[8] = (right + left) / (right - left);
		d[9] = (top + bottom) / (top - bottom);
		d[10] = -(far + near) / (far - near);
		d[11] = -1;
		d[14] = -(2 * far * near) / (far - near);
		return this;

	}

	ortho(near = -1, far = 1, top = -1, bottom = 1, left = -1, right = 1) {

		const rl = right - left;
		const tb = top - bottom;
		const fn = far - near;

		return this.set(
			2 / rl,
			0,
			0,
			-(left + right) / rl,
			0,
			2 / tb,
			0,
			-(top + bottom) / tb,
			0,
			0,
			-2 / fn,
			-(far + near) / fn,
			0,
			0,
			0,
			1
		);

	}

	trans(x: number, y: number, z: number) {

		const d = this.data;
		d[12] = d[0] * x + d[4] * y + d[8] * z + d[12];
		d[13] = d[1] * x + d[5] * y + d[9] * z + d[13];
		d[14] = d[2] * x + d[6] * y + d[10] * z + d[14];
		d[15] = d[3] * x + d[7] * y + d[11] * z + d[15];
		return this;

	}

	rotatex(angle: number) {

		const d = this.data;
		const rad = Math.PI * (angle / 180);
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a10 = d[4];
		const a11 = d[5];
		const a12 = d[6];
		const a13 = d[7];
		const a20 = d[8];
		const a21 = d[9];
		const a22 = d[10];
		const a23 = d[11];
		d[4] = a10 * c + a20 * s;
		d[5] = a11 * c + a21 * s;
		d[6] = a12 * c + a22 * s;
		d[7] = a13 * c + a23 * s;
		d[8] = a10 * -s + a20 * c;
		d[9] = a11 * -s + a21 * c;
		d[10] = a12 * -s + a22 * c;
		d[11] = a13 * -s + a23 * c;
		return this;

	}

	rotatey(angle: number) {

		const d = this.data;
		const rad = Math.PI * (angle / 180);
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a00 = d[0];
		const a01 = d[1];
		const a02 = d[2];
		const a03 = d[3];
		const a20 = d[8];
		const a21 = d[9];
		const a22 = d[10];
		const a23 = d[11];
		d[0] = a00 * c + a20 * -s;
		d[1] = a01 * c + a21 * -s;
		d[2] = a02 * c + a22 * -s;
		d[3] = a03 * c + a23 * -s;
		d[8] = a00 * s + a20 * c;
		d[9] = a01 * s + a21 * c;
		d[10] = a02 * s + a22 * c;
		d[11] = a03 * s + a23 * c;
		return this;

	}

	rotatez(angle: number) {

		const d = this.data;
		const rad = Math.PI * (angle / 180);
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const a00 = d[0];
		const a01 = d[1];
		const a02 = d[2];
		const a03 = d[3];
		const a10 = d[4];
		const a11 = d[5];
		const a12 = d[6];
		const a13 = d[7];
		d[0] = a00 * c + a10 * s;
		d[1] = a01 * c + a11 * s;
		d[2] = a02 * c + a12 * s;
		d[3] = a03 * c + a13 * s;
		d[4] = a00 * -s + a10 * c;
		d[5] = a01 * -s + a11 * c;
		d[6] = a02 * -s + a12 * c;
		d[7] = a03 * -s + a13 * c;
		return this;

	}

	scale(x: number, y: number, z: number) {

		const d = this.data;
		d[0] *= x;
		d[1] *= x;
		d[2] *= x;
		d[3] *= x;
		d[4] *= y;
		d[5] *= y;
		d[6] *= y;
		d[7] *= y;
		d[8] *= z;
		d[9] *= z;
		d[10] *= z;
		d[11] *= z;
		return this;

	}

	toMat3Rot(dest: Mat3) {

		const dst = dest.data;
		const src = this.data;
		const a00 = src[0];
		const a01 = src[1];
		const a02 = src[2];
		const a10 = src[4];
		const a11 = src[5];
		const a12 = src[6];
		const a20 = src[8];
		const a21 = src[9];
		const a22 = src[10];
		const b01 = a22 * a11 - a12 * a21;
		const b11 = -a22 * a10 + a12 * a20;
		const b21 = a21 * a10 - a11 * a20;
		const d = a00 * b01 + a01 * b11 + a02 * b21;
		const id = 1 / d;
		dst[0] = b01 * id;
		dst[3] = (-a22 * a01 + a02 * a21) * id;
		dst[6] = (a12 * a01 - a02 * a11) * id;
		dst[1] = b11 * id;
		dst[4] = (a22 * a00 - a02 * a20) * id;
		dst[7] = (-a12 * a00 + a02 * a10) * id;
		dst[2] = b21 * id;
		dst[5] = (-a21 * a00 + a01 * a20) * id;
		dst[8] = (a11 * a00 - a01 * a10) * id;
		return dest;

	}

	multiply(m1: Mat4, m2: Mat4) {
		let b0, b1, b2, b3;
		const mat = this.data;
		const mat1 = m1.data;
		const mat2 = m2.data;
		const a00 = mat1[0];
		const a01 = mat1[1];
		const a02 = mat1[2];
		const a03 = mat1[3];
		const a10 = mat1[4];
		const a11 = mat1[5];
		const a12 = mat1[6];
		const a13 = mat1[7];
		const a20 = mat1[8];
		const a21 = mat1[9];
		const a22 = mat1[10];
		const a23 = mat1[11];
		const a30 = mat1[12];
		const a31 = mat1[13];
		const a32 = mat1[14];
		const a33 = mat1[15];
		b0 = mat2[0];
		b1 = mat2[1];
		b2 = mat2[2];
		b3 = mat2[3];
		mat[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		mat[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		mat[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		mat[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = mat2[4];
		b1 = mat2[5];
		b2 = mat2[6];
		b3 = mat2[7];
		mat[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		mat[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		mat[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		mat[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = mat2[8];
		b1 = mat2[9];
		b2 = mat2[10];
		b3 = mat2[11];
		mat[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		mat[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		mat[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		mat[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = mat2[12];
		b1 = mat2[13];
		b2 = mat2[14];
		b3 = mat2[15];
		mat[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		mat[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		mat[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		mat[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		return this;
	}
	inverse() {
		let a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33, b00, b01, b02, b03, b04, b05, b06, b07, b08, b09, b10, b11, d, invDet;
		const mat = this.data;
		a00 = mat[0];
		a01 = mat[1];
		a02 = mat[2];
		a03 = mat[3];
		a10 = mat[4];
		a11 = mat[5];
		a12 = mat[6];
		a13 = mat[7];
		a20 = mat[8];
		a21 = mat[9];
		a22 = mat[10];
		a23 = mat[11];
		a30 = mat[12];
		a31 = mat[13];
		a32 = mat[14];
		a33 = mat[15];
		b00 = a00 * a11 - a01 * a10;
		b01 = a00 * a12 - a02 * a10;
		b02 = a00 * a13 - a03 * a10;
		b03 = a01 * a12 - a02 * a11;
		b04 = a01 * a13 - a03 * a11;
		b05 = a02 * a13 - a03 * a12;
		b06 = a20 * a31 - a21 * a30;
		b07 = a20 * a32 - a22 * a30;
		b08 = a20 * a33 - a23 * a30;
		b09 = a21 * a32 - a22 * a31;
		b10 = a21 * a33 - a23 * a31;
		b11 = a22 * a33 - a23 * a32;
		d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
		if (d === 0) return undefined;
		invDet = 1 / d;
		mat[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
		mat[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
		mat[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
		mat[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
		mat[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
		mat[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
		mat[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
		mat[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
		mat[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
		mat[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
		mat[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
		mat[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
		mat[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
		mat[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
		mat[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
		mat[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
		return this;
	}

}
