define("WebGLFramework", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Canvas = (function () {
        function Canvas(container) {
            this.elem = document.getElementById(container);
            this.width = 0;
            this.height = 0;
        }
        Canvas.prototype.enableFullscreen = function (style) {
            var _this = this;
            if (document.fullscreenEnabled ||
                document.webkitFullscreenEnabled ||
                document.mozFullScreenEnabled ||
                document.msFullscreenEnabled) {
                this.bfs = document.createElement("button");
                this.bfs.appendChild(document.createTextNode("Fullscreen"));
                this.elem.parentElement.appendChild(this.bfs);
                for (var s in style)
                    this.bfs.style[s] = style[s];
                this.bfs.addEventListener('click', function (e) {
                    e.preventDefault();
                    _this.requestFullscreen();
                });
            }
        };
        Canvas.prototype.requestFullscreen = function () {
            if (this.elem.requestFullscreen) {
                this.elem.requestFullscreen();
            }
            else if (this.elem.webkitRequestFullscreen) {
                this.elem.webkitRequestFullscreen();
            }
            else if (this.elem.mozRequestFullScreen) {
                this.elem.mozRequestFullScreen();
            }
            else if (this.elem.msRequestFullscreen) {
                this.elem.msRequestFullscreen();
            }
        };
        return Canvas;
    }());
    exports.Canvas = Canvas;
    var Pointer = (function () {
        function Pointer(canvas) {
            var _this = this;
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.xold = 0;
            this.yold = 0;
            this.zold = 0;
            this.isDown = false;
            this.canvas = canvas;
            window.addEventListener('mousemove', function (e) { return _this.move(e); }, false);
            canvas.elem.addEventListener('touchmove', function (e) { return _this.move(e); }, false);
            window.addEventListener('mousedown', function (e) { return _this.down(e); }, false);
            window.addEventListener('touchstart', function (e) { return _this.down(e); }, false);
            window.addEventListener('mouseup', function (e) { return _this.up(e); }, false);
            window.addEventListener('touchend', function (e) { return _this.up(e); }, false);
            window.addEventListener('wheel', function (e) { return _this.wheel(e); }, false);
        }
        Pointer.prototype.down = function (e) {
            if (e.target !== this.canvas.elem)
                return;
            this.move(e);
            this.xold = this.x;
            this.yold = this.y;
            this.isDown = true;
        };
        Pointer.prototype.up = function (e) {
            this.isDown = false;
        };
        Pointer.prototype.move = function (e) {
            var touchMode = e.targetTouches;
            var pointer = null;
            if (touchMode) {
                e.preventDefault();
                if (touchMode.length > 1) {
                    var dx = touchMode[0].clientX - touchMode[1].clientX;
                    var dy = touchMode[0].clientY - touchMode[1].clientY;
                    var d = dx * dx + dy * dy;
                    this.z += (d > this.zold) ? -0.2 : 0.2;
                    this.zold = d;
                    return;
                }
                pointer = touchMode[0];
            }
            else
                pointer = e;
            this.x = pointer.clientX;
            this.y = pointer.clientY;
        };
        Pointer.prototype.wheel = function (e) {
            e.preventDefault();
            this.z += e.deltaY > 0 ? -1 : 1;
        };
        return Pointer;
    }());
    exports.Pointer = Pointer;
    var WebGL = (function () {
        function WebGL(canvas, options) {
            this.canvas = canvas;
            this.gl = this.canvas.elem.getContext("webgl", options);
            if (!this.gl)
                this.gl = this.canvas.elem.getContext("experimental-webgl", options);
            if (!this.gl)
                throw new Error('This browser does not support WebGL');
            this.width = 0;
            this.height = 0;
            this.aspect = 0;
            this.vertexUnits = [];
            for (var i = 0; i < 16; ++i) {
                this.vertexUnits.push({
                    enabled: false,
                    drawable: null,
                    idx: null
                });
            }
            this.currentShader = null;
        }
        WebGL.prototype.getExtension = function (name) {
            var ext = this.gl.getExtension(name);
            if (!ext) {
                throw new Error('WebGL Extension not supported: ' + name);
            }
            return ext;
        };
        WebGL.prototype.adjustSize = function () {
            var canvasWidth = (this.canvas.elem.offsetWidth * 1) || 2;
            var canvasHeight = (this.canvas.elem.offsetHeight * 1) || 2;
            if (this.width !== canvasWidth || this.height !== canvasHeight) {
                this.width = this.canvas.width = this.canvas.elem.width = canvasWidth;
                this.height = this.canvas.height = this.canvas.elem.height = canvasHeight;
                this.aspect = this.width / this.height;
            }
            return this;
        };
        WebGL.prototype.viewport = function (left, top, width, height) {
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            if (width === void 0) { width = this.width; }
            if (height === void 0) { height = this.height; }
            this.gl.viewport(left, top, width, height);
            return this;
        };
        WebGL.prototype.cullFace = function (value) {
            if (value === void 0) { value = true; }
            if (value) {
                this.gl.enable(this.gl.CULL_FACE);
            }
            else {
                this.gl.disable(this.gl.CULL_FACE);
            }
            return this;
        };
        WebGL.prototype.clearColor = function (r, g, b, a) {
            if (r === void 0) { r = 0; }
            if (g === void 0) { g = 0; }
            if (b === void 0) { b = 0; }
            if (a === void 0) { a = 1; }
            this.gl.clearColor(r, g, b, a);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            return this;
        };
        WebGL.prototype.clearDepth = function (depth) {
            if (depth === void 0) { depth = 1; }
            this.gl.clearDepth(depth);
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
            return this;
        };
        WebGL.prototype.depthTest = function (value) {
            if (value === void 0) { value = true; }
            if (value) {
                this.gl.enable(this.gl.DEPTH_TEST);
            }
            else {
                this.gl.disable(this.gl.DEPTH_TEST);
            }
            return this;
        };
        WebGL.prototype.shader = function (params) {
            return new Shader(this, params);
        };
        WebGL.prototype.drawable = function (params) {
            return new Drawable(this, params);
        };
        WebGL.prototype.vec3 = function (x, y, z) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            return new Vec3(x, y, z);
        };
        WebGL.prototype.meshesPointers = function () {
            return [
                {
                    name: 'position',
                    size: 3,
                    offset: 0,
                    stride: 6
                }, {
                    name: 'normal',
                    size: 3,
                    offset: 3,
                    stride: 6
                }
            ];
        };
        WebGL.prototype.quad = function () {
            return {
                pointers: [{
                        name: 'position',
                        size: 2,
                        offset: 0,
                        stride: 2
                    }],
                vertexSize: 2,
                vertices: [
                    -1, -1, 1, -1, 1, 1,
                    -1, 1, -1, -1, 1, 1
                ]
            };
        };
        WebGL.prototype.plane = function (s) {
            return {
                pointers: this.meshesPointers(),
                vertexSize: 6,
                vertices: [
                    -s, 0, -s, 0, 1, 0,
                    -s, 0, s, 0, 1, 0,
                    s, 0, s, 0, 1, 0,
                    s, 0, -s, 0, 1, 0,
                    -s, 0, -s, 0, 1, 0,
                    s, 0, s, 0, 1, 0
                ]
            };
        };
        WebGL.prototype.cube = function (x, y, z) {
            if (x === void 0) { x = 1; }
            if (y === void 0) { y = 1; }
            if (z === void 0) { z = 1; }
            return {
                pointers: this.meshesPointers(),
                vertexSize: 6,
                vertices: [
                    -x, -y, -z, 0, 0, -1,
                    -x, y, -z, 0, 0, -1,
                    x, y, -z, 0, 0, -1,
                    x, -y, -z, 0, 0, -1,
                    -x, -y, -z, 0, 0, -1,
                    x, y, -z, 0, 0, -1,
                    x, y, z, 0, 0, 1,
                    -x, y, z, 0, 0, 1,
                    -x, -y, z, 0, 0, 1,
                    x, y, z, 0, 0, 1,
                    -x, -y, z, 0, 0, 1,
                    x, -y, z, 0, 0, 1,
                    -x, y, -z, 0, 1, 0,
                    -x, y, z, 0, 1, 0,
                    x, y, z, 0, 1, 0,
                    x, y, -z, 0, 1, 0,
                    -x, y, -z, 0, 1, 0,
                    x, y, z, 0, 1, 0,
                    x, -y, z, 0, -1, 0,
                    -x, -y, z, 0, -1, 0,
                    -x, -y, -z, 0, -1, 0,
                    x, -y, z, 0, -1, 0,
                    -x, -y, -z, 0, -1, 0,
                    x, -y, -z, 0, -1, 0,
                    -x, -y, -z, -1, 0, 0,
                    -x, -y, z, -1, 0, 0,
                    -x, y, z, -1, 0, 0,
                    -x, y, -z, -1, 0, 0,
                    -x, -y, -z, -1, 0, 0,
                    -x, y, z, -1, 0, 0,
                    x, y, z, 1, 0, 0,
                    x, -y, z, 1, 0, 0,
                    x, -y, -z, 1, 0, 0,
                    x, y, z, 1, 0, 0,
                    x, -y, -z, 1, 0, 0,
                    x, y, -z, 1, 0, 0
                ]
            };
        };
        WebGL.prototype.sphere = function (radius, res) {
            if (radius === void 0) { radius = 1; }
            if (res === void 0) { res = 36; }
            var nx = [];
            var ny = [];
            var nz = [];
            var vertices = [];
            for (var i = 0; i <= res; i++) {
                var theta = i * Math.PI / res;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);
                for (var j = 0; j <= res; j++) {
                    var phi = -j * 2 * Math.PI / res;
                    nx.push(Math.cos(phi) * sinTheta);
                    ny.push(cosTheta);
                    nz.push(Math.sin(phi) * sinTheta);
                }
            }
            for (var i = 0; i < res; i++) {
                for (var j = 0; j < res; j++) {
                    var first = (i * (res + 1)) + j;
                    var second = first + res + 1;
                    vertices.push(nx[first] * radius, ny[first] * radius, nz[first] * radius, nx[first], ny[first], nz[first], nx[second] * radius, ny[second] * radius, nz[second] * radius, nx[second], ny[second], nz[second], nx[first + 1] * radius, ny[first + 1] * radius, nz[first + 1] * radius, nx[first + 1], ny[first + 1], nz[first + 1], nx[second] * radius, ny[second] * radius, nz[second] * radius, nx[second], ny[second], nz[second], nx[second + 1] * radius, ny[second + 1] * radius, nz[second + 1] * radius, nx[second + 1], ny[second + 1], nz[second + 1], nx[first + 1] * radius, ny[first + 1] * radius, nz[first + 1] * radius, nx[first + 1], ny[first + 1], nz[first + 1]);
                }
            }
            return {
                pointers: this.meshesPointers(),
                vertexSize: 6,
                vertices: vertices
            };
        };
        WebGL.prototype.cylinder = function (radius, res) {
            if (radius === void 0) { radius = 1; }
            if (res === void 0) { res = 36; }
            var angle = 0;
            var alpha = 2 * Math.PI / res;
            var vertices = [];
            for (var i = 0; i < res; i++) {
                var c0 = Math.cos(angle);
                var s0 = Math.sin(angle);
                var c1 = Math.cos(angle + alpha);
                var s1 = Math.sin(angle + alpha);
                vertices.push(c1 * radius, s1 * radius, -1, c1, s1, -1, c0 * radius, s0 * radius, 1, c0, s0, 1, c0 * radius, s0 * radius, -1, c0, s0, -1, c1 * radius, s1 * radius, -1, c1, s1, -1, c1 * radius, s1 * radius, 1, c1, s1, 1, c0 * radius, s0 * radius, 1, c0, s0, 1, c0 * radius, s0 * radius, -1, c0, s0, -1, 0, 0, -1, 0, 0, -1, c1 * radius, s1 * radius, -1, c1, s1, -1, c1 * radius, s1 * radius, 1, c1, s1, 1, 0, 0, -1, 0, 0, 1, c0 * radius, s0 * radius, 1, c0, s0, 1);
                angle += alpha;
            }
            return {
                pointers: this.meshesPointers(),
                vertexSize: 6,
                vertices: vertices
            };
        };
        return WebGL;
    }());
    exports.WebGL = WebGL;
    var Shader = (function () {
        function Shader(webGL, shaders) {
            this.webGL = webGL;
            this.gl = webGL.gl;
            this.program = this.gl.createProgram();
            this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.attachShader(this.program, this.vs);
            this.gl.attachShader(this.program, this.fs);
            this.compileShader(this.vs, shaders.vertex);
            this.compileShader(this.fs, shaders.fragment);
            this.link();
            this.uniformCache = {};
            this.attributeCache = {};
            this.samplers = {};
            this.unitCounter = 0;
        }
        Shader.prototype.compileShader = function (shader, source) {
            var boilerplate = "\n\t\t\t#ifdef GL_FRAGMENT_PRECISION_HIGH\n\t\t\t\tprecision highp int;\n\t\t\t\tprecision highp float;\n\t\t\t#else\n\t\t\t\tprecision mediump int;\n\t\t\t\tprecision mediump float;\n\t\t\t#endif\n\t\t\t#define PI 3.141592653589793\n    ";
            this.gl.shaderSource(shader, boilerplate + '\n' + source);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                throw new Error(this.gl.getShaderInfoLog(shader));
            }
        };
        Shader.prototype.attributeLocation = function (name) {
            var location = this.attributeCache[name];
            if (location === void 0) {
                location = this.attributeCache[name] = this.gl.getAttribLocation(this.program, name);
            }
            return location;
        };
        Shader.prototype.uniformLocation = function (name) {
            var location = this.uniformCache[name];
            if (location === void 0) {
                location = this.uniformCache[name] = this.gl.getUniformLocation(this.program, name);
            }
            return location;
        };
        Shader.prototype.link = function () {
            this.gl.linkProgram(this.program);
            if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
                throw new Error(this.gl.getProgramInfoLog(this.program));
            }
        };
        Shader.prototype.use = function () {
            if (this.webGL.currentShader !== this) {
                this.webGL.currentShader = this;
                this.gl.useProgram(this.program);
            }
            return this;
        };
        Shader.prototype.draw = function (drawable) {
            drawable.setPointersForShader(this)
                .draw();
            return this;
        };
        Shader.prototype.int = function (name, value) {
            var loc = this.uniformLocation(name);
            if (loc) {
                this.gl.uniform1i(loc, value);
            }
            return this;
        };
        Shader.prototype.sampler = function (name, texture) {
            var unit = this.samplers[name];
            if (unit === void 0) {
                unit = this.samplers[name] = this.unitCounter++;
            }
            texture.bind(unit);
            this.int(name, unit);
            return this;
        };
        Shader.prototype.vec2 = function (name, a, b) {
            var loc = this.uniformLocation(name);
            if (loc) {
                this.gl.uniform2f(loc, a, b);
            }
            return this;
        };
        Shader.prototype.vec3 = function (name, a, b, c) {
            var loc = this.uniformLocation(name);
            if (loc) {
                this.gl.uniform3f(loc, a, b, c);
            }
            return this;
        };
        Shader.prototype.mat4 = function (name, value) {
            var loc = this.uniformLocation(name);
            if (loc) {
                if (value instanceof Mat4) {
                    this.gl.uniformMatrix4fv(loc, false, value.data);
                }
                else {
                    this.gl.uniformMatrix4fv(loc, false, value);
                }
            }
            return this;
        };
        Shader.prototype.mat3 = function (name, value) {
            var loc = this.uniformLocation(name);
            if (loc) {
                if (value instanceof Mat3) {
                    this.gl.uniformMatrix3fv(loc, false, value.data);
                }
                else {
                    this.gl.uniformMatrix3fv(loc, false, value);
                }
            }
            return this;
        };
        Shader.prototype.float = function (name, value) {
            var loc = this.uniformLocation(name);
            if (loc) {
                this.gl.uniform1f(loc, value);
            }
            return this;
        };
        return Shader;
    }());
    exports.Shader = Shader;
    var Drawable = (function () {
        function Drawable(webGL, obj) {
            this.pointers = obj.pointers;
            this.webGL = webGL;
            this.gl = webGL.gl;
            this.buffer = this.gl.createBuffer();
            this.mode = this.gl.TRIANGLES;
            this.vertexSize = obj.vertexSize;
            this.upload(new Float32Array(obj.vertices));
        }
        Drawable.prototype.upload = function (vertices) {
            this.size = vertices.length / this.vertexSize;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
            return this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        };
        Drawable.prototype.setPointersForShader = function (shader) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
            for (var i = 0, len = this.pointers.length; i < len; ++i) {
                var pointer = this.pointers[i];
                this.setPointer(shader, pointer, i);
            }
            return this;
        };
        Drawable.prototype.setPointer = function (shader, pointer, idx) {
            var location = shader.attributeLocation(pointer.name);
            if (location >= 0) {
                var unit = this.webGL.vertexUnits[location];
                if (!unit.enabled) {
                    unit.enabled = true;
                    this.gl.enableVertexAttribArray(location);
                }
                if (unit.drawable !== this || unit.idx !== idx) {
                    var float_size = Float32Array.BYTES_PER_ELEMENT;
                    unit.idx = idx;
                    unit.drawable = this;
                    this.gl.vertexAttribPointer(location, pointer.size, this.gl.FLOAT, false, pointer.stride * float_size, pointer.offset * float_size);
                }
            }
            return this;
        };
        Drawable.prototype.draw = function (first, size, mode) {
            if (first === void 0) { first = 0; }
            if (size === void 0) { size = this.size; }
            if (mode === void 0) { mode = this.mode; }
            this.gl.drawArrays(mode, first, size);
            return this;
        };
        return Drawable;
    }());
    exports.Drawable = Drawable;
    var Vec3 = (function () {
        function Vec3(x, y, z) {
            if (x === void 0) { x = 0.0; }
            if (y === void 0) { y = 0.0; }
            if (z === void 0) { z = 0.0; }
            this.x = x;
            this.y = y;
            this.z = z;
        }
        Vec3.prototype.set = function (x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        };
        Vec3.prototype.copy = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        };
        Vec3.prototype.get = function () {
            return [this.x, this.y, this.z];
        };
        Vec3.prototype.distance = function (b) {
            var dx = b.x - this.x;
            var dy = b.y - this.y;
            var dz = b.z - this.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };
        Vec3.prototype.transformMat4 = function (v, mat) {
            var m = mat.data;
            var x = v.x;
            var y = v.y;
            var z = v.z;
            var w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
            this.x = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
            this.y = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
            this.z = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
            return this;
        };
        return Vec3;
    }());
    exports.Vec3 = Vec3;
    var Mat3 = (function () {
        function Mat3() {
            this.data = new Float32Array(9);
            this.ident();
        }
        Mat3.prototype.ident = function () {
            var d = this.data;
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
        };
        Mat3.prototype.fromMat4Rot = function (source) {
            return source.toMat3Rot(this);
        };
        return Mat3;
    }());
    exports.Mat3 = Mat3;
    var Mat4 = (function () {
        function Mat4() {
            this.data = new Float32Array(16);
            this.ident();
        }
        Mat4.prototype.ident = function () {
            var d = this.data;
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
        };
        Mat4.prototype.zero = function () {
            var d = this.data;
            d[0] = 0;
            d[1] = 0;
            d[2] = 0;
            d[3] = 0;
            d[4] = 0;
            d[5] = 0;
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
        };
        Mat4.prototype.set = function (a00, a10, a20, a30, a01, a11, a21, a31, a02, a12, a22, a32, a03, a13, a23, a33) {
            var d = this.data;
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
        };
        Mat4.prototype.perspective = function (data) {
            var fov = data.fov || 60;
            var aspect = data.aspect || 1;
            var near = data.near || 0.01;
            var far = data.far || 100;
            this.zero();
            var d = this.data;
            var top = near * Math.tan(fov * Math.PI / 360);
            var right = top * aspect;
            var left = -right;
            var bottom = -top;
            d[0] = (2 * near) / (right - left);
            d[5] = (2 * near) / (top - bottom);
            d[8] = (right + left) / (right - left);
            d[9] = (top + bottom) / (top - bottom);
            d[10] = -(far + near) / (far - near);
            d[11] = -1;
            d[14] = -(2 * far * near) / (far - near);
            return this;
        };
        Mat4.prototype.ortho = function (near, far, top, bottom, left, right) {
            if (near === void 0) { near = -1; }
            if (far === void 0) { far = 1; }
            if (top === void 0) { top = -1; }
            if (bottom === void 0) { bottom = 1; }
            if (left === void 0) { left = -1; }
            if (right === void 0) { right = 1; }
            var rl = right - left;
            var tb = top - bottom;
            var fn = far - near;
            return this.set(2 / rl, 0, 0, -(left + right) / rl, 0, 2 / tb, 0, -(top + bottom) / tb, 0, 0, -2 / fn, -(far + near) / fn, 0, 0, 0, 1);
        };
        Mat4.prototype.trans = function (x, y, z) {
            var d = this.data;
            d[12] = d[0] * x + d[4] * y + d[8] * z + d[12];
            d[13] = d[1] * x + d[5] * y + d[9] * z + d[13];
            d[14] = d[2] * x + d[6] * y + d[10] * z + d[14];
            d[15] = d[3] * x + d[7] * y + d[11] * z + d[15];
            return this;
        };
        Mat4.prototype.rotatex = function (angle) {
            var d = this.data;
            var rad = Math.PI * (angle / 180);
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            var a10 = d[4];
            var a11 = d[5];
            var a12 = d[6];
            var a13 = d[7];
            var a20 = d[8];
            var a21 = d[9];
            var a22 = d[10];
            var a23 = d[11];
            d[4] = a10 * c + a20 * s;
            d[5] = a11 * c + a21 * s;
            d[6] = a12 * c + a22 * s;
            d[7] = a13 * c + a23 * s;
            d[8] = a10 * -s + a20 * c;
            d[9] = a11 * -s + a21 * c;
            d[10] = a12 * -s + a22 * c;
            d[11] = a13 * -s + a23 * c;
            return this;
        };
        Mat4.prototype.rotatey = function (angle) {
            var d = this.data;
            var rad = Math.PI * (angle / 180);
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            var a00 = d[0];
            var a01 = d[1];
            var a02 = d[2];
            var a03 = d[3];
            var a20 = d[8];
            var a21 = d[9];
            var a22 = d[10];
            var a23 = d[11];
            d[0] = a00 * c + a20 * -s;
            d[1] = a01 * c + a21 * -s;
            d[2] = a02 * c + a22 * -s;
            d[3] = a03 * c + a23 * -s;
            d[8] = a00 * s + a20 * c;
            d[9] = a01 * s + a21 * c;
            d[10] = a02 * s + a22 * c;
            d[11] = a03 * s + a23 * c;
            return this;
        };
        Mat4.prototype.rotatez = function (angle) {
            var d = this.data;
            var rad = Math.PI * (angle / 180);
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            var a00 = d[0];
            var a01 = d[1];
            var a02 = d[2];
            var a03 = d[3];
            var a10 = d[4];
            var a11 = d[5];
            var a12 = d[6];
            var a13 = d[7];
            d[0] = a00 * c + a10 * s;
            d[1] = a01 * c + a11 * s;
            d[2] = a02 * c + a12 * s;
            d[3] = a03 * c + a13 * s;
            d[4] = a00 * -s + a10 * c;
            d[5] = a01 * -s + a11 * c;
            d[6] = a02 * -s + a12 * c;
            d[7] = a03 * -s + a13 * c;
            return this;
        };
        Mat4.prototype.scale = function (x, y, z) {
            var d = this.data;
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
        };
        Mat4.prototype.toMat3Rot = function (dest) {
            var dst = dest.data;
            var src = this.data;
            var a00 = src[0];
            var a01 = src[1];
            var a02 = src[2];
            var a10 = src[4];
            var a11 = src[5];
            var a12 = src[6];
            var a20 = src[8];
            var a21 = src[9];
            var a22 = src[10];
            var b01 = a22 * a11 - a12 * a21;
            var b11 = -a22 * a10 + a12 * a20;
            var b21 = a21 * a10 - a11 * a20;
            var d = a00 * b01 + a01 * b11 + a02 * b21;
            var id = 1 / d;
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
        };
        Mat4.prototype.multiply = function (m1, m2) {
            var b0, b1, b2, b3;
            var mat = this.data;
            var mat1 = m1.data;
            var mat2 = m2.data;
            var a00 = mat1[0];
            var a01 = mat1[1];
            var a02 = mat1[2];
            var a03 = mat1[3];
            var a10 = mat1[4];
            var a11 = mat1[5];
            var a12 = mat1[6];
            var a13 = mat1[7];
            var a20 = mat1[8];
            var a21 = mat1[9];
            var a22 = mat1[10];
            var a23 = mat1[11];
            var a30 = mat1[12];
            var a31 = mat1[13];
            var a32 = mat1[14];
            var a33 = mat1[15];
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
        };
        Mat4.prototype.inverse = function () {
            var a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33, b00, b01, b02, b03, b04, b05, b06, b07, b08, b09, b10, b11, d, invDet;
            var mat = this.data;
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
            if (d === 0)
                return;
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
        };
        return Mat4;
    }());
    exports.Mat4 = Mat4;
});
define("thing", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Thing = (function () {
        function Thing() {
            this.damping = 0.8;
            this.centerAttraction = 0.02;
        }
        Thing.prototype.accelerate = function (ax, ay, az) {
            var v = this.vel;
            v.x += ax;
            v.y += ay;
            v.z += az;
        };
        Thing.prototype.move = function (dx, dy, dz) {
            this.pos.x += dx;
            this.pos.y += dy;
            this.pos.z += dz;
        };
        Thing.prototype.setRotation = function (a, b, c) {
            this.rot.x = a;
            this.rot.y = b;
            this.rot.z = c;
        };
        Thing.prototype.getPosition = function () {
            var p = this.pos;
            return { x: p.x, y: p.y, z: p.z };
        };
        ;
        Thing.prototype.update = function () {
            var v = this.vel;
            v.x *= this.damping;
            v.y *= this.damping;
            v.z *= this.damping;
            var p = this.pos;
            v.x -= p.x * this.centerAttraction;
            v.y -= p.y * this.centerAttraction;
            v.z -= p.z * this.centerAttraction;
            this.move(v.x, v.y, v.z);
        };
        Thing.prototype.reset = function () {
            this.pos.set(0, 0, 0);
            this.vel.set(0, 0, 0);
            this.rot.set(0, 0, 0);
        };
        return Thing;
    }());
    exports.Thing = Thing;
});
//# sourceMappingURL=index.js.map