import { WebGL, Canvas, Pointer, Shader } from './WebGLFramework';
import { Node, Constraint, Assembly } from './VerletIntegration';
import { Vec3, Mat4 } from './VecMath';

export interface AssemblyList {
    [id:string]: Assembly;
}

// Node class
export namespace Renderer {
    const canvas = new Canvas("canvas");
    const gl = new WebGL(canvas).depthTest();
    const displayShader = gl.shader({
        vertex: `
                uniform mat4 camProj, camView;
                uniform mat4 model;
                attribute vec3 position, normal;
                varying vec3 vLigthPosition;
                varying vec3 vNormal;
                void main(){
                    vec4 vWorldPosition = model * vec4(position, 1.0);
                    gl_Position = camProj * camView * vWorldPosition;
                    vLigthPosition = vWorldPosition.xyz;
                    vNormal = normal;
                }
            `,
        fragment: `
                uniform vec3 modelColor;
                uniform vec3 uPointLightingLocation;
                uniform vec3 uPointLightingColor;
                varying vec3 vLigthPosition;
                varying vec3 vNormal;
                void main(){
                    vec3 lightDirection = normalize(uPointLightingLocation - vLigthPosition);
                    float angle = max(dot(lightDirection, vNormal), 0.001);
                    vec3 diffuse = pow(uPointLightingColor * angle * modelColor, vec3(1.0));
                    gl_FragColor = vec4(diffuse, 1.0);
                }
            `
    });

    const camProj = gl.mat4();
    const camView = gl.mat4();
//    const viewProj = gl.mat4();
    const light = new Vec3(1, 1.7, 0);
    

    const planeGeom = gl.drawable(gl.plane(60));
    const sphereGeom = gl.drawable(gl.sphere(1, 36));
    const tubeGeom = gl.drawable(gl.cylinder(1, 36));

    const pointer = new Pointer(canvas);
    var camDist = 10;

    // set
    export function setLight(v: Vec3) {
        light.set(v.x, v.y, v.z);
    }
    export function setCamDist(d: number) {
        camDist = d;
    }
    // draw
    export function drawNode(node: Node, shader: Shader) {
        shader.vec3('modelColor', node.rgb.x, node.rgb.y, node.rgb.z)
            .mat4('model', new Mat4()
                .trans(node.pos.x, node.pos.y, node.pos.z)
                .scale(node.radius, node.radius, node.radius)
            )
            .draw(sphereGeom);
    }
    export function drawConstraint(constraint: Constraint, shader: Shader) {
        if (!constraint.size) return;
        const dx = constraint.n1.pos.x - constraint.n0.pos.x;
        const dy = constraint.n1.pos.y - constraint.n0.pos.y;
        const dz = constraint.n1.pos.z - constraint.n0.pos.z;
        const ln = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const a = -Math.atan2(dy, dz) * 180 / Math.PI;
        const b = Math.asin(dx / ln) * 180 / Math.PI;

        shader.vec3('modelColor', 1, 1, 1)
            .mat4('model', new Mat4()
                .trans(constraint.n0.pos.x, constraint.n0.pos.y, constraint.n0.pos.z)
                .rotatex(a)
                .rotatey(b)
                .trans(0, 0, ln * 0.5)
                .scale(constraint.size, constraint.size, ln * 0.5)
            )
            .draw(tubeGeom);
    }
    export function drawAssembly(assembly: Assembly) {
        for (let n of assembly.nodes) {
            drawNode(n, displayShader);
        }
        for (let c of assembly.constraints) {
            drawConstraint(c, displayShader);
        }
    }
    export function drawScene(assemblies: AssemblyList, camera:Vec3) {
        // webGL frame rendering setup
        gl
            .adjustSize()
            .viewport()
            .cullFace()
            .clearColor(0, 0, 0, 0)
            .clearDepth(1);
        // camera
        camProj.perspective({
            fov: 60,
            aspect: gl.aspect,
            near: 0.01,
            far: 100
        });

        // mouse pointer
        pointer.z = Math.min(Math.max(pointer.z, 3), 21);
        camDist += 0.1 * ((pointer.z / 3) - camDist);
        camView
            .ident()
            .trans(camera.x, camera.y, camera.z);

        // set uniforms
        displayShader
            .use()
            .vec3('uPointLightingLocation', light.x, light.y, light.z)
            .vec3('uPointLightingColor', 1.0, 1.0, 1.0)
            .mat4('camProj', camProj)
            .mat4('camView', camView);
        // draw ground
        displayShader.vec3('modelColor', 0.6, 1.0, 1.2)
            .mat4('model', new Mat4().trans(0.0, -1.0, 0.0))
            .draw(planeGeom);

        for (let a in assemblies) {
            drawAssembly(assemblies[a]);
        }
    }
}
