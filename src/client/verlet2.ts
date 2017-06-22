((struct) => {

	// Node class
	class Node {
		constructor(node) {
				this.x = node.x;
				this.y = node.y;
				this.w = node.w;
				this.oldX = node.x;
				this.oldY = node.y;
				this.mass = node.mass || 1.0;
				this.color = node.color;
			}
			// verlet integration
		integrate() {
				const x = this.x;
				const y = this.y;
				this.x += this.x - this.oldX;
				this.y += this.y - this.oldY + 0.1;
				this.oldX = x;
				this.oldY = y;
			}
			// draw node
		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.w, 0, 2 * Math.PI);
			ctx.fillStyle = this.color;
			ctx.fill();
			// drag
			if (pointer.isDown) {
				if (!drag) {
					if (ctx.isPointInPath(pointer.x, pointer.y)) {
						drag = this;
					}
				}
			} else drag = null;
		}
		checkScreenLimits() {
			// bottom + friction
			if (this.y > canvas.height - this.w) {
				const d = this.y - canvas.height + this.w;
				this.x -= d * (this.x - this.oldX) / 10;
				this.y = canvas.height - this.w;
			}
			// top
			if (this.y < this.w) this.y = this.w;
			// left
			if (this.x > canvas.width - this.w) this.x = canvas.width - this.w;
			// right
			if (this.x < this.w) this.x = this.w;
		}
	}

	// constraint class
	class Constraint {
		constructor(n0, n1) {
				this.n0 = n0;
				this.n1 = n1;
				const dx = n0.x - n1.x;
				const dy = n0.y - n1.y;
				this.dist = Math.sqrt(dx * dx + dy * dy);
			}
			// solve constraint
		solve() {
				let dx = this.n0.x - this.n1.x;
				let dy = this.n0.y - this.n1.y;
				const currentDist = Math.sqrt(dx * dx + dy * dy);
				const delta = 0.5 * (currentDist - this.dist) / currentDist;
				dx *= delta;
				dy *= delta;
				let m1 = (this.n0.mass + this.n1.mass);
				let m2 = this.n0.mass / m1;
				m1 = this.n1.mass / m1;
				this.n1.x += dx * m2;
				this.n1.y += dy * m2;
				this.n0.x -= dx * m1;
				this.n0.y -= dy * m1;
			}
			// draw constraint
		draw() {
			ctx.beginPath();
			ctx.moveTo(this.n0.x, this.n0.y);
			ctx.lineTo(this.n1.x, this.n1.y);
			ctx.strokeStyle = "#f00";
			ctx.stroke();
		}
	}

	// Canvas class
	class Canvas {
		constructor(container) {
			this.elem = document.getElementById(container);
			this.ctx = this.elem.getContext("2d");
			window.addEventListener('resize', _ => this.resize(), false);
			this.resize();
			return [this, this.ctx];
		}
		resize() {
			this.width = this.elem.width = this.elem.offsetWidth;
			this.height = this.elem.height = this.elem.offsetHeight;
		}
	}

	// Pointer class
	class Pointer {
		constructor(canvas) {
			this.x = 0;
			this.y = 0;
			this.isDown = false;
			window.addEventListener('mousemove', e => this.move(e), false);
			canvas.elem.addEventListener('touchmove', e => this.move(e), false);
			window.addEventListener('mousedown', e => this.down(e), false);
			window.addEventListener('touchstart', e => this.down(e), false);
			window.addEventListener('mouseup', e => this.up(e), false);
			window.addEventListener('touchend', e => this.up(e), false);
		}
		down(e) {
			this.move(e);
			this.isDown = true;
		}
		up(e) {
			this.isDown = false;
		}
		move(e) {
			const touchMode = e.targetTouches;
			let pointer = null;
			if (touchMode) {
				e.preventDefault();
				pointer = touchMode[0];
			} else pointer = e;
			this.x = pointer.clientX;
			this.y = pointer.clientY;
		}
	}

	// animation loop
	const run = () => {
		requestAnimationFrame(run);
		// clear screen
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// integration
		for (let n of nodes) {
			n.integrate();
			n.checkScreenLimits();
		}
		// dragging
		if (drag) {
			drag.x += (pointer.x - drag.x) / (drag.mass * 100);
			drag.y += (pointer.y - drag.y) / (drag.mass * 100);
			ctx.beginPath();
			ctx.moveTo(drag.x, drag.y);
			ctx.lineTo(pointer.x, pointer.y);
			ctx.strokeStyle = "#0f0";
			ctx.stroke();
		}
		// solve constraints
		for (let i = 0; i < 5; i++) {
			for (let n of constraints) {
				n.solve();
			}
		}
		// draw constraints
		for (let n of constraints) {
			n.draw();
		}
		// draw nodes
		for (let n of nodes) {
			n.draw();
		}
	}

	// init script
	const [canvas, ctx] = new Canvas("canvas");
	const pointer = new Pointer(canvas);
	const nodes = new Set();
	const constraints = new Set();
	let drag = null;

	// load nodes
	for (let n in struct.nodes) {
		const node = new Node(struct.nodes[n]);
		struct.nodes[n].id = node;
		nodes.add(node);
	}
	
	// load constraints
	for (let i = 0; i < struct.constraints.length; i++) {
		constraints.add(new Constraint(
			struct.nodes[struct.constraints[i][0]].id,
			struct.nodes[struct.constraints[i][1]].id
		));
	}
	
	// start
	nodes.values().next().value.x += 5;
	run();

})(

	{
		nodes: {
			n0: {
				x: 100,
				y: 200,
				w: 30,
				mass: 1.0,
				color: "#fff"
			},
			n1: {
				x: 300,
				y: 200,
				w: 30,
				mass: 1.0,
				color: "#fff"
			},
			n2: {
				x: 200,
				y: 0,
				w: 10,
				mass: 0.1,
				color: "#f00"
			},
			n3: {
				x: 200,
				y: 20,
				w: 10,
				mass: 0.1,
				color: "#fff"
			},
			n4: {
				x: 200,
				y: 40,
				w: 10,
				mass: 0.1,
				color: "#fff"
			},
			n5: {
				x: 200,
				y: 60,
				w: 10,
				mass: 0.1,
				color: "#fff"
			},
			n6: {
				x: 200,
				y: 80,
				w: 10,
				mass: 0.1,
				color: "#fff"
			},
			n7: {
				x: 200,
				y: 100,
				w: 10,
				mass: 0.1,
				color: "#fff"
			},
			n8: {
				x: 200,
				y: 140,
				w: 30,
				mass: 1.0,
				color: "#f00"
			}
		},
		constraints: [
			["n0", "n1"],
			["n1", "n2"],
			["n2", "n0"],
			["n2", "n3"],
			["n3", "n4"],
			["n4", "n5"],
			["n5", "n6"],
			["n6", "n7"],
			["n7", "n8"]
		]
	}

);