const minNodeSize = 10;
const maxNodeSize = 100;

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

let animationFrameId;

function resizecanvas2() {
	canvas2.width = window.innerWidth;
	canvas2.height = window.innerHeight;
	player2.draw();
}

class NodeInfo {
	constructor(size, color, position) {
		this.size = size;
		this.color = color;
		this.position = position; // { x: number, y: number }
		this.type = null; // 'fins' or 'arms'
		this.xVelocity = (Math.random() - 0.5) * 2;
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

	drawEyes(ctx) {
		const eyeSize = this.size * 0.1;
		const eyeY = this.position.y - this.size * 0.2;

		ctx.beginPath();
		ctx.arc(this.position.x - this.size * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(this.position.x + this.size * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();

		const pupilSize = eyeSize * 0.5;
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.arc(this.position.x - this.size * 0.3, eyeY, pupilSize, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(this.position.x + this.size * 0.3, eyeY, pupilSize, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}

class Player2 {
	constructor(nodes) {
		this.nodes = nodes;
		this.time = 0;
	}

	draw() {
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(ctx2);

			if (i > 0) {
				this.drawInterpolatedCircles(this.nodes[i - 1], this.nodes[i]);
			}
		}

		this.nodes[0].drawEyes(ctx2);
		this.drawTail(this.nodes[this.nodes.length - 1]);
		this.drawMouth(this.nodes[0]);
	}

	drawInterpolatedCircles(node1, node2) {
		const numberOfCircles = 50;
		const dx = (node2.position.x - node1.position.x) / numberOfCircles;
		const dy = (node2.position.y - node1.position.y) / numberOfCircles;

		for (let i = 0; i <= numberOfCircles; i++) {
			const x = node1.position.x + i * dx;
			const y = node1.position.y + i * dy;

			const factor = i / numberOfCircles;

			const size = this.interpolateSize(node1.size, node2.size, factor);
			const color = this.interpolateColors(node1.color, node2.color, factor);

			ctx2.beginPath();
			ctx2.arc(x, y, size, 0, Math.PI * 2);
			ctx2.fillStyle = color;
			ctx2.fill();
			ctx2.closePath();
		}
	}

	interpolateColors(color1, color2, factor) {
		const rgb1 = this.hexToRgb(color1);
		const rgb2 = this.hexToRgb(color2);
		const result = rgb1.map((c1, i) =>
			Math.round(c1 + factor * (rgb2[i] - c1))
		);
		return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
	}

	interpolateSize(size1, size2, factor) {
		return size1 + (size2 - size1) * factor;
	}

	hexToRgb(hex) {
		const bigint = parseInt(hex.replace(/^#/, ""), 16);
		return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
	}

	drawTail(node) {
		const tailLength = 20;
		const tailWidth = 10;
		const tailX = node.position.x + node.size;
		const tailY = node.position.y;

		ctx2.fillStyle = node.color;
		ctx2.beginPath();
		ctx2.moveTo(tailX, tailY);
		ctx2.lineTo(tailX + tailLength, tailY - tailWidth);
		ctx2.lineTo(tailX + tailLength, tailY + tailWidth);
		ctx2.closePath();
		ctx2.fill();
	}

	drawMouth(node) {
		const mouthWidth = node.size * 0.5;
		const mouthX = node.position.x;
		const mouthY = node.position.y + node.size * 0.2;

		ctx2.fillStyle = "black";
		ctx2.beginPath();
		ctx2.arc(mouthX, mouthY, mouthWidth, 0, Math.PI, false);
		ctx2.fill();
	}

	animateNodes() {
		this.time += 0.05;

		const amplitude = 150;

		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].position.y =
				window.innerHeight / 2 + amplitude * Math.sin(this.time + i);

			this.nodes[i].position.x += this.nodes[i].xVelocity;

			if (
				this.nodes[i].position.x < 0 ||
				this.nodes[i].position.x > canvas2.width
			) {
				this.nodes[i].xVelocity *= -1;
			}
		}

		this.draw();

		animationFrameId = requestAnimationFrame(() => this.animateNodes());
	}

	resizeNode(mouseX, delta) {
		let nodeIndex = -1;
		const spacing = canvas2.width / (this.nodes.length + 1);

		for (let i = 0; i < this.nodes.length; i++) {
			const radius = this.nodes[i].size;

			if (
				mouseX >= this.nodes[i].position.x - radius &&
				mouseX <= this.nodes[i].position.x + radius
			) {
				nodeIndex = i;
				break;
			}
		}

		if (nodeIndex !== -1) {
			const newSize = Math.min(
				Math.max(this.nodes[nodeIndex].size + delta, minNodeSize),
				maxNodeSize
			);

			this.nodes[nodeIndex].size = newSize;

			for (let i = 0; i < this.nodes.length; i++) {
				if (i !== nodeIndex) {
					const distance = spacing * (nodeIndex + 1) - spacing * (i + 1);
					const totalRadius = this.nodes[nodeIndex].size + this.nodes[i].size;

					if (distance < totalRadius) {
						this.nodes[nodeIndex].size = Math.max(
							totalRadius - this.nodes[i].size,
							minNodeSize
						);
					}
				}
			}

			this.draw();
		}
	}

	changeNodeColor(mouseX, mouseY) {
		let nodeIndex = -1;

		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].containsPoint(mouseX, mouseY)) {
				nodeIndex = i;
				break;
			}
		}

		const newColor = prompt(
			"Enter a color (name or hex code):",
			this.nodes[nodeIndex].color
		);
		if (newColor) {
			this.nodes[nodeIndex].color = newColor;
			this.draw();
		}
		if (nodeIndex !== -1) {
			if (nodeIndex !== 0 && nodeIndex !== this.nodes.length - 1) {
				const typeChoice = prompt(
					"Choose between 'fins' or 'arms':",
					this.nodes[nodeIndex].type
				);
				if (typeChoice === "fins" || typeChoice === "arms") {
					this.nodes[nodeIndex].type = typeChoice;
					alert(`You have selected ${typeChoice} for node ${nodeIndex + 1}.`);
				}
			}
		}
	}
}

const nodes = [
	new NodeInfo(50, "#FF0000", {
		x: (window.innerWidth / 6) * 1,
		y: window.innerHeight / 2,
	}),
	new NodeInfo(50, "#00FF00", {
		x: (window.innerWidth / 6) * 2,
		y: window.innerHeight / 2,
	}),
	new NodeInfo(50, "#0000FF", {
		x: (window.innerWidth / 6) * 3,
		y: window.innerHeight / 2,
	}),
	new NodeInfo(50, "#FFFF00", {
		x: (window.innerWidth / 6) * 4,
		y: window.innerHeight / 2,
	}),
	new NodeInfo(50, "#FF00FF", {
		x: (window.innerWidth / 6) * 5,
		y: window.innerHeight / 2,
	}),
];

const player2 = new Player2(nodes);

window.addEventListener("resize", resizecanvas2);
resizecanvas2();

player2.animateNodes();

canvas2.addEventListener("wheel", (event) => {
	const delta = event.deltaY > 0 ? -5 : 5;
	player2.resizeNode(event.clientX, delta);
});

canvas2.addEventListener("click", (event) => {
	const mouseX = event.clientX;
	const mouseY = event.clientY;

	player2.changeNodeColor(mouseX, mouseY);
});
