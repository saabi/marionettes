/**
* Adapted from WebGL framework by Florian Boesch - @pyalot
* https://github.com/pyalot/soft-shadow-mapping/blob/master/framework.coffee
*/

import {Vec3, Mat3, Mat4} from './VecMath';

declare global {
	interface Document {
		readonly mozFullScreenEnabled: boolean;
		readonly msFullscreenEnabled: boolean;
	}
	interface HTMLElement {
		mozRequestFullScreen(): void;
		msRequestFullscreen(): void;
	}
}

interface CSSStyles {
	alignContent: string | null;
	alignItems: string | null;
	alignmentBaseline: string | null;
	alignSelf: string | null;
	animation: string | null;
	animationDelay: string | null;
	animationDirection: string | null;
	animationDuration: string | null;
	animationFillMode: string | null;
	animationIterationCount: string | null;
	animationName: string | null;
	animationPlayState: string | null;
	animationTimingFunction: string | null;
	backfaceVisibility: string | null;
	background: string | null;
	backgroundAttachment: string | null;
	backgroundClip: string | null;
	backgroundColor: string | null;
	backgroundImage: string | null;
	backgroundOrigin: string | null;
	backgroundPosition: string | null;
	backgroundPositionX: string | null;
	backgroundPositionY: string | null;
	backgroundRepeat: string | null;
	backgroundSize: string | null;
	baselineShift: string | null;
	border: string | null;
	borderBottom: string | null;
	borderBottomColor: string | null;
	borderBottomLeftRadius: string | null;
	borderBottomRightRadius: string | null;
	borderBottomStyle: string | null;
	borderBottomWidth: string | null;
	borderCollapse: string | null;
	borderColor: string | null;
	borderImage: string | null;
	borderImageOutset: string | null;
	borderImageRepeat: string | null;
	borderImageSlice: string | null;
	borderImageSource: string | null;
	borderImageWidth: string | null;
	borderLeft: string | null;
	borderLeftColor: string | null;
	borderLeftStyle: string | null;
	borderLeftWidth: string | null;
	borderRadius: string | null;
	borderRight: string | null;
	borderRightColor: string | null;
	borderRightStyle: string | null;
	borderRightWidth: string | null;
	borderSpacing: string | null;
	borderStyle: string | null;
	borderTop: string | null;
	borderTopColor: string | null;
	borderTopLeftRadius: string | null;
	borderTopRightRadius: string | null;
	borderTopStyle: string | null;
	borderTopWidth: string | null;
	borderWidth: string | null;
	bottom: string | null;
	boxShadow: string | null;
	boxSizing: string | null;
	breakAfter: string | null;
	breakBefore: string | null;
	breakInside: string | null;
	captionSide: string | null;
	clear: string | null;
	clip: string | null;
	clipPath: string | null;
	clipRule: string | null;
	color: string | null;
	colorInterpolationFilters: string | null;
	columnCount: any;
	columnFill: string | null;
	columnGap: any;
	columnRule: string | null;
	columnRuleColor: any;
	columnRuleStyle: string | null;
	columnRuleWidth: any;
	columns: string | null;
	columnSpan: string | null;
	columnWidth: any;
	content: string | null;
	counterIncrement: string | null;
	counterReset: string | null;
	cssFloat: string | null;
	cssText: string;
	cursor: string | null;
	direction: string | null;
	display: string | null;
	dominantBaseline: string | null;
	emptyCells: string | null;
	enableBackground: string | null;
	fill: string | null;
	fillOpacity: string | null;
	fillRule: string | null;
	filter: string | null;
	flex: string | null;
	flexBasis: string | null;
	flexDirection: string | null;
	flexFlow: string | null;
	flexGrow: string | null;
	flexShrink: string | null;
	flexWrap: string | null;
	floodColor: string | null;
	floodOpacity: string | null;
	font: string | null;
	fontFamily: string | null;
	fontFeatureSettings: string | null;
	fontSize: string | null;
	fontSizeAdjust: string | null;
	fontStretch: string | null;
	fontStyle: string | null;
	fontVariant: string | null;
	fontWeight: string | null;
	glyphOrientationHorizontal: string | null;
	glyphOrientationVertical: string | null;
	height: string | null;
	imeMode: string | null;
	justifyContent: string | null;
	kerning: string | null;
	layoutGrid: string | null;
	layoutGridChar: string | null;
	layoutGridLine: string | null;
	layoutGridMode: string | null;
	layoutGridType: string | null;
	left: string | null;
	letterSpacing: string | null;
	lightingColor: string | null;
	lineBreak: string | null;
	lineHeight: string | null;
	listStyle: string | null;
	listStyleImage: string | null;
	listStylePosition: string | null;
	listStyleType: string | null;
	margin: string | null;
	marginBottom: string | null;
	marginLeft: string | null;
	marginRight: string | null;
	marginTop: string | null;
	marker: string | null;
	markerEnd: string | null;
	markerMid: string | null;
	markerStart: string | null;
	mask: string | null;
	maxHeight: string | null;
	maxWidth: string | null;
	minHeight: string | null;
	minWidth: string | null;
	msContentZoomChaining: string | null;
	msContentZooming: string | null;
	msContentZoomLimit: string | null;
	msContentZoomLimitMax: any;
	msContentZoomLimitMin: any;
	msContentZoomSnap: string | null;
	msContentZoomSnapPoints: string | null;
	msContentZoomSnapType: string | null;
	msFlowFrom: string | null;
	msFlowInto: string | null;
	msFontFeatureSettings: string | null;
	msGridColumn: any;
	msGridColumnAlign: string | null;
	msGridColumns: string | null;
	msGridColumnSpan: any;
	msGridRow: any;
	msGridRowAlign: string | null;
	msGridRows: string | null;
	msGridRowSpan: any;
	msHighContrastAdjust: string | null;
	msHyphenateLimitChars: string | null;
	msHyphenateLimitLines: any;
	msHyphenateLimitZone: any;
	msHyphens: string | null;
	msImeAlign: string | null;
	msOverflowStyle: string | null;
	msScrollChaining: string | null;
	msScrollLimit: string | null;
	msScrollLimitXMax: any;
	msScrollLimitXMin: any;
	msScrollLimitYMax: any;
	msScrollLimitYMin: any;
	msScrollRails: string | null;
	msScrollSnapPointsX: string | null;
	msScrollSnapPointsY: string | null;
	msScrollSnapType: string | null;
	msScrollSnapX: string | null;
	msScrollSnapY: string | null;
	msScrollTranslation: string | null;
	msTextCombineHorizontal: string | null;
	msTextSizeAdjust: any;
	msTouchAction: string | null;
	msTouchSelect: string | null;
	msUserSelect: string | null;
	msWrapFlow: string;
	msWrapMargin: any;
	msWrapThrough: string;
	opacity: string | null;
	order: string | null;
	orphans: string | null;
	outline: string | null;
	outlineColor: string | null;
	outlineOffset: string | null;
	outlineStyle: string | null;
	outlineWidth: string | null;
	overflow: string | null;
	overflowX: string | null;
	overflowY: string | null;
	padding: string | null;
	paddingBottom: string | null;
	paddingLeft: string | null;
	paddingRight: string | null;
	paddingTop: string | null;
	pageBreakAfter: string | null;
	pageBreakBefore: string | null;
	pageBreakInside: string | null;
	perspective: string | null;
	perspectiveOrigin: string | null;
	pointerEvents: string | null;
	position: string | null;
	quotes: string | null;
	right: string | null;
	rotate: string | null;
	rubyAlign: string | null;
	rubyOverhang: string | null;
	rubyPosition: string | null;
	scale: string | null;
	stopColor: string | null;
	stopOpacity: string | null;
	stroke: string | null;
	strokeDasharray: string | null;
	strokeDashoffset: string | null;
	strokeLinecap: string | null;
	strokeLinejoin: string | null;
	strokeMiterlimit: string | null;
	strokeOpacity: string | null;
	strokeWidth: string | null;
	tableLayout: string | null;
	textAlign: string | null;
	textAlignLast: string | null;
	textAnchor: string | null;
	textDecoration: string | null;
	textIndent: string | null;
	textJustify: string | null;
	textKashida: string | null;
	textKashidaSpace: string | null;
	textOverflow: string | null;
	textShadow: string | null;
	textTransform: string | null;
	textUnderlinePosition: string | null;
	top: string | null;
	touchAction: string | null;
	transform: string | null;
	transformOrigin: string | null;
	transformStyle: string | null;
	transition: string | null;
	transitionDelay: string | null;
	transitionDuration: string | null;
	transitionProperty: string | null;
	transitionTimingFunction: string | null;
	translate: string | null;
	unicodeBidi: string | null;
	verticalAlign: string | null;
	visibility: string | null;
	webkitAlignContent: string | null;
	webkitAlignItems: string | null;
	webkitAlignSelf: string | null;
	webkitAnimation: string | null;
	webkitAnimationDelay: string | null;
	webkitAnimationDirection: string | null;
	webkitAnimationDuration: string | null;
	webkitAnimationFillMode: string | null;
	webkitAnimationIterationCount: string | null;
	webkitAnimationName: string | null;
	webkitAnimationPlayState: string | null;
	webkitAnimationTimingFunction: string | null;
	webkitAppearance: string | null;
	webkitBackfaceVisibility: string | null;
	webkitBackgroundClip: string | null;
	webkitBackgroundOrigin: string | null;
	webkitBackgroundSize: string | null;
	webkitBorderBottomLeftRadius: string | null;
	webkitBorderBottomRightRadius: string | null;
	webkitBorderImage: string | null;
	webkitBorderRadius: string | null;
	webkitBorderTopLeftRadius: string | null;
	webkitBorderTopRightRadius: string | null;
	webkitBoxAlign: string | null;
	webkitBoxDirection: string | null;
	webkitBoxFlex: string | null;
	webkitBoxOrdinalGroup: string | null;
	webkitBoxOrient: string | null;
	webkitBoxPack: string | null;
	webkitBoxSizing: string | null;
	webkitColumnBreakAfter: string | null;
	webkitColumnBreakBefore: string | null;
	webkitColumnBreakInside: string | null;
	webkitColumnCount: any;
	webkitColumnGap: any;
	webkitColumnRule: string | null;
	webkitColumnRuleColor: any;
	webkitColumnRuleStyle: string | null;
	webkitColumnRuleWidth: any;
	webkitColumns: string | null;
	webkitColumnSpan: string | null;
	webkitColumnWidth: any;
	webkitFilter: string | null;
	webkitFlex: string | null;
	webkitFlexBasis: string | null;
	webkitFlexDirection: string | null;
	webkitFlexFlow: string | null;
	webkitFlexGrow: string | null;
	webkitFlexShrink: string | null;
	webkitFlexWrap: string | null;
	webkitJustifyContent: string | null;
	webkitOrder: string | null;
	webkitPerspective: string | null;
	webkitPerspectiveOrigin: string | null;
	webkitTapHighlightColor: string | null;
	webkitTextFillColor: string | null;
	webkitTextSizeAdjust: any;
	webkitTextStroke: string | null;
	webkitTextStrokeColor: string | null;
	webkitTextStrokeWidth: string | null;
	webkitTransform: string | null;
	webkitTransformOrigin: string | null;
	webkitTransformStyle: string | null;
	webkitTransition: string | null;
	webkitTransitionDelay: string | null;
	webkitTransitionDuration: string | null;
	webkitTransitionProperty: string | null;
	webkitTransitionTimingFunction: string | null;
	webkitUserModify: string | null;
	webkitUserSelect: string | null;
	webkitWritingMode: string | null;
	whiteSpace: string | null;
	widows: string | null;
	width: string | null;
	wordBreak: string | null;
	wordSpacing: string | null;
	wordWrap: string | null;
	writingMode: string | null;
	zIndex: string | null;
	zoom: string | null;
	resize: string | null;
	userSelect: string | null;
	[index: string]: string;
}
type CSSParams = Partial<CSSStyles>;

export class Canvas {

	elem: HTMLCanvasElement;
	width: number;
	height: number;

	bfs: HTMLButtonElement;

	constructor(container: string) {

		this.elem = <HTMLCanvasElement>document.getElementById(container);
		this.width = 0;
		this.height = 0;

	}

	enableFullscreen(style: CSSParams) {

		if (
			document.fullscreenEnabled ||
			document.webkitFullscreenEnabled ||
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
		) {
			this.bfs = document.createElement("button");
			this.bfs.appendChild(document.createTextNode("Fullscreen"));
			this.elem.parentElement.appendChild(this.bfs);
			for (let s in style) this.bfs.style.setProperty(s, style[s]);
			this.bfs.addEventListener('click', e => {
				e.preventDefault();
				this.requestFullscreen();
			});
		}

	}

	requestFullscreen() {

		if (this.elem.requestFullscreen) {
			this.elem.requestFullscreen();
		} else if (this.elem.webkitRequestFullscreen) {
			this.elem.webkitRequestFullscreen();
		} else if (this.elem.mozRequestFullScreen) {
			this.elem.mozRequestFullScreen();
		} else if (this.elem.msRequestFullscreen) {
			this.elem.msRequestFullscreen();
		}

	}

}

export class Pointer {
	x: number;
	y: number;
	z: number;
	xold: number;
	yold: number;
	zold: number;
	isDown: boolean;
	canvas: Canvas;

	constructor(canvas: Canvas) {

		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.xold = 0;
		this.yold = 0;
		this.zold = 0;
		this.isDown = false;
		this.canvas = canvas;

		window.addEventListener('mousemove', e => this.move(e), false);
		canvas.elem.addEventListener('touchmove', e => this.move(e), false);
		window.addEventListener('mousedown', e => this.down(e), false);
		window.addEventListener('touchstart', e => this.down(e), false);
		window.addEventListener('mouseup', e => this.up(e), false);
		window.addEventListener('touchend', e => this.up(e), false);
		window.addEventListener('wheel', e => this.wheel(e), false);

	}

	down(e: Event) {

		if (e.target !== this.canvas.elem) return;
		this.move(<MouseEvent>e);
		this.xold = this.x;
		this.yold = this.y;
		this.isDown = true;

	}

	up(e: Event) {

		this.isDown = false;

	}

	move(e: TouchEvent | MouseEvent) {

		let pointer = null;
		if (e instanceof TouchEvent) {
			const touchMode = e.targetTouches;
			if (touchMode) {
				e.preventDefault();
				if (touchMode.length > 1) {
					const dx = touchMode[0].clientX - touchMode[1].clientX;
					const dy = touchMode[0].clientY - touchMode[1].clientY;
					const d = dx * dx + dy * dy;
					this.z += (d > this.zold) ? -0.2 : 0.2;
					this.zold = d;
					return;
				}
				pointer = touchMode[0];
			} else
				throw new Error("Something's screwey...")
		}
		else pointer = e;
		this.x = pointer.clientX;
		this.y = pointer.clientY;

	}

	wheel(e: WheelEvent) {

		e.preventDefault();
		this.z += e.deltaY > 0 ? -1 : 1;

	}

}

export interface VertexUnit {
	enabled: boolean;
	drawable: Drawable;
	idx: number;
}

export class WebGL {
	canvas: Canvas;
	gl: WebGLRenderingContext;

	width: number;
	height: number;
	aspect: number;
	//textureUnits: [];
	vertexUnits: VertexUnit[];
	currentShader: Shader;

	constructor(canvas: Canvas, options?: any) {

		this.canvas = canvas;
		this.gl = this.canvas.elem.getContext("webgl", options);
		if (!this.gl) this.gl = this.canvas.elem.getContext("experimental-webgl", options);
		if (!this.gl) throw new Error('This browser does not support WebGL');
		this.width = 0;
		this.height = 0;
		this.aspect = 0;
		/*
		this.textureUnits = [];
		for (let i = 0; i < 16; ++i) {
			this.textureUnits.push(null);
		}
		*/
		this.vertexUnits = [];
		for (let i = 0; i < 16; ++i) {
			this.vertexUnits.push({
				enabled: false,
				drawable: null,
				idx: null
			});
		}
		//this.currentShader = null;

	}

	getExtension(name: string) {

		const ext = this.gl.getExtension(name);
		if (!ext) {
			throw new Error('WebGL Extension not supported: ' + name);
		}
		return ext;

	}

	adjustSize() {

		const canvasWidth = (this.canvas.elem.offsetWidth * 1) || 2;
		const canvasHeight = (this.canvas.elem.offsetHeight * 1) || 2;
		if (this.width !== canvasWidth || this.height !== canvasHeight) {
			this.width = this.canvas.width = this.canvas.elem.width = canvasWidth;
			this.height = this.canvas.height = this.canvas.elem.height = canvasHeight;
			this.aspect = this.width / this.height;
		}
		return this;

	}

	viewport(left = 0, top = 0, width = this.width, height = this.height) {

		this.gl.viewport(left, top, width, height);
		return this;

	}

	cullFace(value = true) {

		if (value) {
			this.gl.enable(this.gl.CULL_FACE);
		} else {
			this.gl.disable(this.gl.CULL_FACE);
		}
		return this;

	}

	clearColor(r = 0, g = 0, b = 0, a = 1) {

		this.gl.clearColor(r, g, b, a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		return this;

	}

	clearDepth(depth = 1) {

		this.gl.clearDepth(depth);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
		return this;

	}

	depthTest(value = true): WebGL {

		if (value) {
			this.gl.enable(this.gl.DEPTH_TEST);
		} else {
			this.gl.disable(this.gl.DEPTH_TEST);
		}
		return this;

	}
	/*
	texture(params) {
		return new Texture(this, params);
	}
	
	framebuffer() {
		return new Framebuffer(this);
	}
	
	depthbuffer() {
		return new Depthbuffer(this);
	}
	*/
	shader(params: ShaderParams) {
		return new Shader(this, params);
	}

	drawable(params: Geometry) {
		return new Drawable(this, params);
	}
	/*
	filter(size, filter) {
		return new Filter(this, size, filter);
	}
	*/
	vec3(x = 0, y = 0, z = 0) {
		return new Vec3(x, y, z);
	}

	mat3() {
		return new Mat3();
	}

	mat4() {
		return new Mat4();
	}

	meshesPointers(): MeshPointer[] {

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

	}

	quad() {

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

	}

	plane(s: number): Geometry {

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

	}

	cube(x = 1, y = 1, z = 1) {

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

	}

	sphere(radius = 1, res = 36) {

		const nx = [];
		const ny = [];
		const nz = [];
		const vertices = [];
		for (let i = 0; i <= res; i++) {
			const theta = i * Math.PI / res;
			const sinTheta = Math.sin(theta);
			const cosTheta = Math.cos(theta);
			for (let j = 0; j <= res; j++) {
				const phi = -j * 2 * Math.PI / res;
				nx.push(Math.cos(phi) * sinTheta)
				ny.push(cosTheta);
				nz.push(Math.sin(phi) * sinTheta);
			}
		}
		for (let i = 0; i < res; i++) {
			for (let j = 0; j < res; j++) {
				const first = (i * (res + 1)) + j;
				const second = first + res + 1;
				vertices.push(
					nx[first] * radius,
					ny[first] * radius,
					nz[first] * radius,
					nx[first],
					ny[first],
					nz[first],

					nx[second] * radius,
					ny[second] * radius,
					nz[second] * radius,
					nx[second],
					ny[second],
					nz[second],

					nx[first + 1] * radius,
					ny[first + 1] * radius,
					nz[first + 1] * radius,
					nx[first + 1],
					ny[first + 1],
					nz[first + 1],

					nx[second] * radius,
					ny[second] * radius,
					nz[second] * radius,
					nx[second],
					ny[second],
					nz[second],

					nx[second + 1] * radius,
					ny[second + 1] * radius,
					nz[second + 1] * radius,
					nx[second + 1],
					ny[second + 1],
					nz[second + 1],

					nx[first + 1] * radius,
					ny[first + 1] * radius,
					nz[first + 1] * radius,
					nx[first + 1],
					ny[first + 1],
					nz[first + 1]

				);
			}
		}

		return {
			pointers: this.meshesPointers(),
			vertexSize: 6,
			vertices: vertices
		};

	}

	cylinder(radius = 1, res = 36) {

		let angle = 0;
		const alpha = 2 * Math.PI / res;
		const vertices = [];

		for (let i = 0; i < res; i++) {

			const c0 = Math.cos(angle);
			const s0 = Math.sin(angle);
			const c1 = Math.cos(angle + alpha);
			const s1 = Math.sin(angle + alpha);

			vertices.push(

				c1 * radius, s1 * radius, -1, c1, s1, -1,
				c0 * radius, s0 * radius, 1, c0, s0, 1,
				c0 * radius, s0 * radius, -1, c0, s0, -1,

				c1 * radius, s1 * radius, -1, c1, s1, -1,
				c1 * radius, s1 * radius, 1, c1, s1, 1,
				c0 * radius, s0 * radius, 1, c0, s0, 1,

				c0 * radius, s0 * radius, -1, c0, s0, -1,
				0, 0, -1, 0, 0, -1,
				c1 * radius, s1 * radius, -1, c1, s1, -1,

				c1 * radius, s1 * radius, 1, c1, s1, 1,
				0, 0, -1, 0, 0, 1,
				c0 * radius, s0 * radius, 1, c0, s0, 1

			);

			angle += alpha;
		}

		return {
			pointers: this.meshesPointers(),
			vertexSize: 6,
			vertices: vertices
		};

	}

}

interface ShaderParams {
	vertex: string;
	fragment: string;
}

export class Shader {
	webGL: WebGL;
	gl: WebGLRenderingContext;
	program: WebGLProgram;
	vs: WebGLShader;
	fs: WebGLShader;

	uniformCache: { [name: string]: WebGLUniformLocation };
	attributeCache: { [name: string]: number };
	samplers: {}
	unitCounter: number;

	constructor(webGL: WebGL, shaders: ShaderParams) {

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

	compileShader(shader: WebGLShader, source: string) {

		const boilerplate = `
		#ifdef GL_FRAGMENT_PRECISION_HIGH
		precision highp int;
		precision highp float;
		#else
		precision mediump int;
		precision mediump float;
		#endif
		#define PI 3.141592653589793
		`;

		this.gl.shaderSource(shader, boilerplate + '\n' + source);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			throw new Error(this.gl.getShaderInfoLog(shader));
		}

	}

	attributeLocation(name: string) {

		let location = this.attributeCache[name];
		if (location === void 0) {
			location = this.attributeCache[name] = this.gl.getAttribLocation(this.program, name);
		}
		return location;

	}

	uniformLocation(name: string) {

		let location = this.uniformCache[name];
		if (location === void 0) {
			location = this.uniformCache[name] = this.gl.getUniformLocation(this.program, name);
		}
		return location;

	}

	link() {

		this.gl.linkProgram(this.program);
		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			throw new Error(this.gl.getProgramInfoLog(this.program));
		}

	}

	use() {

		if (this.webGL.currentShader !== this) {
			this.webGL.currentShader = this;
			this.gl.useProgram(this.program);
		}
		return this;

	}

	draw(drawable: Drawable) {

		drawable.setPointersForShader(this)
			.draw();
		return this;

	}

	int(name: string, value: number) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform1i(loc, value);
		}
		return this;

	}

	/*
	sampler(name: string, texture) {
		
		let unit = this.samplers[name];
		if (unit === void 0) {
			unit = this.samplers[name] = this.unitCounter++;
		}
		texture.bind(unit);
		this.int(name, unit);
		return this;
		
	}
	*/

	vec2(name: string, a: number, b: number) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform2f(loc, a, b);
		}
		return this;

	}

	vec3(name: string, a: number, b: number, c: number) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform3f(loc, a, b, c);
		}
		return this;

	}

	mat4(name: string, value: Mat4 | Float32Array | number[]) {

		const loc = this.uniformLocation(name);
		if (loc) {
			if (value instanceof Mat4) {
				this.gl.uniformMatrix4fv(loc, false, value.data);
			} else {
				this.gl.uniformMatrix4fv(loc, false, value);
			}
		}
		return this;

	}

	mat3(name: string, value: Mat3 | Float32Array | number[]) {

		const loc = this.uniformLocation(name);
		if (loc) {
			if (value instanceof Mat3) {
				this.gl.uniformMatrix3fv(loc, false, value.data);
			} else {
				this.gl.uniformMatrix3fv(loc, false, value);
			}
		}
		return this;

	}

	float(name: string, value: number) {

		const loc = this.uniformLocation(name);
		if (loc) {
			this.gl.uniform1f(loc, value);
		}
		return this;

	}

}

interface MeshPointer {
	name: string;
	size: number;
	offset: number;
	stride: number;
}

interface Geometry {
	pointers: MeshPointer[];
	vertexSize: number;
	vertices: number[];
}

export class Drawable {

	pointers: MeshPointer[];
	webGL: WebGL;
	gl: WebGLRenderingContext;
	buffer: WebGLBuffer;
	mode: number;
	vertexSize: number;
	size: number;

	constructor(webGL: WebGL, obj: Geometry) {

		this.pointers = obj.pointers;
		this.webGL = webGL;
		this.gl = webGL.gl;
		this.buffer = this.gl.createBuffer();
		this.mode = this.gl.TRIANGLES;
		this.vertexSize = obj.vertexSize;
		this.upload(new Float32Array(obj.vertices));
	}

	upload(vertices: Float32Array) {

		this.size = vertices.length / this.vertexSize;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
		return this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

	}

	setPointersForShader(shader: Shader) {

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		for (let i = 0, len = this.pointers.length; i < len; ++i) {
			const pointer = this.pointers[i];
			this.setPointer(shader, pointer, i);
		}
		return this;

	}

	setPointer(shader: Shader, pointer: MeshPointer, idx: number) {

		const location = shader.attributeLocation(pointer.name);
		if (location >= 0) {
			const unit = this.webGL.vertexUnits[location];
			if (!unit.enabled) {
				unit.enabled = true;
				this.gl.enableVertexAttribArray(location);
			}
			if (unit.drawable !== this || unit.idx !== idx) {
				const float_size = Float32Array.BYTES_PER_ELEMENT;
				unit.idx = idx;
				unit.drawable = this;
				this.gl.vertexAttribPointer(
					location,
					pointer.size,
					this.gl.FLOAT,
					false,
					pointer.stride * float_size,
					pointer.offset * float_size
				);
			}
		}
		return this;

	}

	draw(first = 0, size = this.size, mode = this.mode) {

		this.gl.drawArrays(mode, first, size);
		return this;

	}

}

