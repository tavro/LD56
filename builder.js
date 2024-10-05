const minCircleSize = 10;
const maxCircleSize = 100;

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

function resizecanvas2() {
	canvas2.width = window.innerWidth;
	canvas2.height = window.innerHeight;
	player2.draw();
}

class Node {
	constructor(size, color, position) {
		this.size = size;
		this.color = color;
		this.position = position; // { x: number, y: number }
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}

	containsPoint(x, y) {
		const distance = Math.sqrt(
			(x - this.position.x) ** 2 + (y - this.position.y) ** 2
		);
		return distance <= this.size;
	}
}

class Player {
	constructor(nodes) {
		this.nodes = nodes;
	}

	draw() {
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(ctx2);

			if (i > 0) {
				this.drawConnectingShape(
					this.nodes[i - 1].position.x,
					this.nodes[i - 1].position.y,
					this.nodes[i].position.x,
					this.nodes[i].position.y,
					this.nodes[i - 1].size,
					this.nodes[i].size,
					this.nodes[i - 1].color,
					this.nodes[i].color
				);
			}
		}
	}

	drawConnectingShape(x1, y1, x2, y2, size1, size2, color1, color2) {
		const controlHeight = 20;

		const gradient = ctx2.createLinearGradient(x1, y1, x2, y2);
		gradient.addColorStop(0, color1);
		gradient.addColorStop(1, color2);

		ctx2.beginPath();
		ctx2.moveTo(x1, y1 - size1);
		ctx2.lineTo(x1 + (x2 - x1) / 2, y1 - size1 - controlHeight);
		ctx2.lineTo(x2, y2 - size2);
		ctx2.lineTo(x2, y2 + size2);
		ctx2.lineTo(x1 + (x2 - x1) / 2, y1 + size1 + controlHeight);
		ctx2.lineTo(x1, y1 + size1);
		ctx2.closePath();

		ctx2.fillStyle = gradient;
		ctx2.fill();
	}

	resizeCircle(mouseX, delta) {
		let circleIndex = -1;
		const spacing = canvas2.width / (this.nodes.length + 1);

		for (let i = 0; i < this.nodes.length; i++) {
			const circleX = spacing * (i + 1);
			const radius = this.nodes[i].size;

			if (mouseX >= circleX - radius && mouseX <= circleX + radius) {
				circleIndex = i;
				break;
			}
		}

		if (circleIndex !== -1) {
			const newSize = Math.min(
				Math.max(this.nodes[circleIndex].size + delta, minCircleSize),
				maxCircleSize
			);

			this.nodes[circleIndex].size = newSize;

			for (let i = 0; i < this.nodes.length; i++) {
				if (i !== circleIndex) {
					const distance = spacing * (circleIndex + 1) - spacing * (i + 1);
					const totalRadius = this.nodes[circleIndex].size + this.nodes[i].size;

					if (distance < totalRadius) {
						this.nodes[circleIndex].size = Math.max(
							totalRadius - this.nodes[i].size,
							minCircleSize
						);
					}
				}
			}

			this.draw();
		}
	}
}

const nodes = [
	new Node(50, "red", {
		x: (window.innerWidth / 4) * 1,
		y: window.innerHeight / 2,
	}),
	new Node(50, "green", {
		x: (window.innerWidth / 4) * 2,
		y: window.innerHeight / 2,
	}),
	new Node(50, "blue", {
		x: (window.innerWidth / 4) * 3,
		y: window.innerHeight / 2,
	}),
];
const player2 = new Player(nodes);

window.addEventListener("resize", resizecanvas2);
resizecanvas2();

canvas2.addEventListener("wheel", (event) => {
	const delta = event.deltaY > 0 ? -5 : 5;
	player2.resizeCircle(event.clientX, delta);
});
