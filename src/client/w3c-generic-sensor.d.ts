// Type definitions for W3C Generic Sensor API 1.0
// Project: https://www.w3.org/TR/generic-sensor/
// Definitions by: Kenneth Rohde Christiansen <https://github.com/kenchris>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.2

// Explainer: https://www.w3.org/TR/motion-sensors/

export interface DOMPointReadOnly {
    /**
     * x coordinate / readonly
     */
    x: number;
    /**
     * y coordinate / readonly
     */
    y: number;
    /**
     * z coordinate / readonly
     */
    z: number;
    /**
     * w coordinate / readonly
     */
    w: number;

    /**
     * Post-multiply point with matrix.
     * @param matrix
     */
    matrixTransform(matrix:DOMMatrixReadOnly): DOMPoint;
}

interface DOMPoint extends DOMPointReadOnly {
    /**
     * x coordinate
     */
    x: number;
    /**
     * y coordinate
     */
    y: number;
    /**
     * z coordinate
     */
    z: number;
    /**
     * w coordinate
     */
    w: number;
}

interface DOMPointInit {
    /**
     * x coordinate: 0
     */
    x: number;
    /**
     * y coordinate: 0
     */
    y: number;
    /**
     * z coordinate: 0
     */
    z?: number;
    /**
     * w coordinate: 1
     */
    w?: number;
}

interface DOMMatrixReadOnly {
    /**
     * These attributes are simple aliases for certain elements of the 4x4 matrix
     */
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;

    m11: number;
    m12: number;
    m13: number;
    m14: number;
    m21: number;
    m22: number;
    m23: number;
    m24: number;
    m31: number;
    m32: number;
    m33: number;
    m34: number;
    m41: number;
    m42: number;
    m43: number;
    m44: number;

    is2D: boolean;
    isIdentity: boolean;

    translate(tx: number, ty: number, tz?: number): DOMMatrix;
    scale(scale: number, originX?: number, originY?: number): DOMMatrix;
    scale3d(scale: number, originX?: number, originY?: number, originZ?: number): DOMMatrix;
    scaleNonUniform(scale: number, scaleX: number, scaleY: number, scaleZ: number, originX: number, originY: number, originZ: number): DOMMatrix;
    rotate(angle: number, originX?: number, originY?: number): DOMMatrix;
    rotateFromVector(x: number, y: number): DOMMatrix;
    rotateAxisAngle(x: number, y: number, z: number, angle: number): DOMMatrix;
    skewX(sx: number): DOMMatrix;
    skewY(sx: number): DOMMatrix;

    multiply(other: DOMMatrix): DOMMatrix;
    flipX(): DOMMatrix;
    flipY(): DOMMatrix;
    inverse(): DOMMatrix;

    transformPoint(point?: DOMPointInit): DOMPoint;

    toFloat32Array(): Array<number>;
    toFloat64Array(): Array<number>;
}

interface DOMMatrix extends DOMMatrixReadOnly {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;

    m11: number;
    m12: number;
    m13: number;
    m14: number;
    m21: number;
    m22: number;
    m23: number;
    m24: number;
    m31: number;
    m32: number;
    m33: number;
    m34: number;
    m41: number;
    m42: number;
    m43: number;
    m44: number;


    multiplySelf(other: DOMMatrix): DOMMatrix;
    preMultiplySelf(other: DOMMatrix): DOMMatrix;
    translateSelf(tx: number, ty: number, tz?: number): DOMMatrix;
    scaleSelf(scale: number, originX?: number, originY?: number): DOMMatrix;
    scale3dSelf(scale: number, originX?: number, originY?: number, originZ?: number): DOMMatrix;
    scaleNonUniformSelf(scaleX: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number): DOMMatrix;
    rotateSelf(angle: number, originX?: number, originY?: number): DOMMatrix;
    rotateFromVectorSelf(x: number, y: number): DOMMatrix;
    rotateAxisAngleSelf(x: number, y: number, z: number, angle: number): DOMMatrix;

    skewXSelf(sx: number): DOMMatrix;
    skewYSelf(sy: number): DOMMatrix;
    invertSelf(): DOMMatrix;
    setMatrixValue(transformList: DOMMatrix): DOMMatrix;
}

declare class SensorErrorEvent extends Event {
    constructor(type: string, errorEventInitDict: SensorErrorEventInit);
    readonly error: Error;
}

interface SensorErrorEventInit extends EventInit {
    error: Error;
}

declare class Sensor extends EventTarget {
    readonly activated: boolean;
    readonly timestamp?: number; // Should be DOMHighResTimeStamp.
    start(): void;
    stop(): void;

    onreading: (this: this, ev: Event) => any;
    onactivate: (this: this, ev: Event) => any;
    onerror: (this: this, ev: SensorErrorEvent) => any;

    addEventListener(type: "reading" | "activate", listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "error", listener: (this: this, ev: SensorErrorEvent) => any, useCapture?: boolean): void;
}

interface SensorOptions {
    frequency?: number;
}

// Accelerometer: https://www.w3.org/TR/accelerometer/

declare class Accelerometer extends Sensor {
  constructor(options?: SensorOptions);
  readonly x?: number;
  readonly y?: number;
  readonly z?: number;
}

declare class LinearAccelerationSensor extends Accelerometer {
    constructor(options?: SensorOptions);
}

declare class GravitySensor extends Accelerometer {
    constructor(options?: SensorOptions);
}

// Gyroscope: https://www.w3.org/TR/gyroscope/

declare class Gyroscope extends Sensor {
    constructor(options?: SensorOptions);
    readonly x?: number;
    readonly y?: number;
    readonly z?: number;
}

// Magnetometer: https://www.w3.org/TR/magnetometer/

declare class Magnetometer extends Sensor {
    constructor(options?: SensorOptions);
    readonly x?: number;
    readonly y?: number;
    readonly z?: number;
}

declare class UncalibratedMagnetometer extends Sensor {
    constructor(options?: SensorOptions);
    readonly x?: number;
    readonly y?: number;
    readonly z?: number;
    readonly xBias?: number;
    readonly yBias?: number;
    readonly zBias?: number;
}

// Orientation Sensor: https://www.w3.org/TR/orientation-sensor/

type RotationMatrixType = Float32Array | Float64Array | DOMMatrix;

declare class OrientationSensor extends Sensor {
    readonly quaternion?: [number,number,number,number];
    populateMatrix(targetMatrix: RotationMatrixType): void;
}

declare class AbsoluteOrientationSensor extends OrientationSensor {
    constructor(options?: SensorOptions);
}

declare class RelativeOrientationSensor extends OrientationSensor {
    constructor(options?: SensorOptions);
}
