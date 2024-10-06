const minNodeSize = 1;
const maxNodeSize = 5;

const builder_canvas = document.getElementById("canvas2");
const builder_context = builder_canvas.getContext("2d");

let animationFrameId;

function resizecanvas2() {
	builder_canvas.width = window.innerWidth;
	builder_canvas.height = window.innerHeight;
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

		this.drawFeature(ctx);
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

	drawFeature(ctx) {
		if (this.type === "arms") {
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(this.position.x, this.position.y - this.size * 1.2);
			ctx.lineTo(this.position.x, this.position.y - this.size * 2);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(this.position.x, this.position.y + this.size * 1.2);
			ctx.lineTo(this.position.x, this.position.y + this.size * 2);
			ctx.stroke();
		} else if (this.type === "fins") {
			ctx.fillStyle = "black";

			ctx.beginPath();
			ctx.moveTo(this.position.x, this.position.y - this.size * 1.1);
			ctx.lineTo(
				this.position.x - this.size * 0.6,
				this.position.y - this.size * 1.5
			);
			ctx.lineTo(
				this.position.x + this.size * 0.6,
				this.position.y - this.size * 1.5
			);
			ctx.closePath();
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(this.position.x, this.position.y + this.size * 1.1);
			ctx.lineTo(
				this.position.x - this.size * 0.6,
				this.position.y + this.size * 1.5
			);
			ctx.lineTo(
				this.position.x + this.size * 0.6,
				this.position.y + this.size * 1.5
			);
			ctx.closePath();
			ctx.fill();
		}
	}
}

class Player2 {
	constructor(nodes) {
		this.nodes = nodes;
		this.time = 0;
	}

	draw() {
		builder_context.clearRect(
			0,
			0,
			builder_canvas.width,
			builder_canvas.height
		);

		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(builder_context);

			if (i > 0) {
				this.drawInterpolatedCircles(this.nodes[i - 1], this.nodes[i]);
			}
		}

		this.nodes[0].drawEyes(builder_context);
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

			builder_context.beginPath();
			builder_context.arc(x, y, size, 0, Math.PI * 2);
			builder_context.fillStyle = color;
			builder_context.fill();
			builder_context.closePath();
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

		builder_context.fillStyle = node.color;
		builder_context.beginPath();
		builder_context.moveTo(tailX, tailY);
		builder_context.lineTo(tailX + tailLength, tailY - tailWidth);
		builder_context.lineTo(tailX + tailLength, tailY + tailWidth);
		builder_context.closePath();
		builder_context.fill();
	}

	drawMouth(node) {
		const mouthWidth = node.size * 0.5;
		const mouthX = node.position.x;
		const mouthY = node.position.y + node.size * 0.2;

		builder_context.fillStyle = "black";
		builder_context.beginPath();
		builder_context.arc(mouthX, mouthY, mouthWidth, 0, Math.PI, false);
		builder_context.fill();
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
				this.nodes[i].position.x > builder_canvas.width
			) {
				this.nodes[i].xVelocity *= -1;
			}
		}

		this.draw();

		animationFrameId = requestAnimationFrame(() => this.animateNodes());
	}
}

// const nodes = [
// 	new NodeInfo(50, "#FF0000", {
// 		x: window.innerWidth / 6,
// 		y: window.innerHeight / 2,
// 	}),
// 	new NodeInfo(50, "#FF00FF", {
// 		x: (window.innerWidth / 6) * 5,
// 		y: window.innerHeight / 2,
// 	}),
// ];

// const player2 = new Player2(nodes);

window.addEventListener("resize", resizecanvas2);
resizecanvas2();

// player2.animateNodes();

document.addEventListener("keydown", (event) => {
	if (event.key === "n" || event.key === "N") {
		addNode();
	}
});

builder_canvas.addEventListener("wheel", (event) => {
	const delta = event.deltaY > 0 ? -5 : 5;
	resizeNode(event.clientX, event.clientY, delta);
});

builder_canvas.addEventListener("click", (event) => {
	const mouseX = event.clientX;
	const mouseY = event.clientY;

	changeNodeColor(mouseX, mouseY);
});

// ______________________________________________

function addNode() {
	if (player_new.playerBody.nodes.length < 2) return;

	const lastNode =
		player_new.playerBody.nodes[player_new.playerBody.nodes.length - 1];
	const secondLastNode =
		player_new.playerBody.nodes[player_new.playerBody.nodes.length - 2];

	const newX = (secondLastNode.position.x + lastNode.position.x) / 2;
	const newY = (secondLastNode.position.y + lastNode.position.y) / 2;

	const newNode = new Node_New(
		(secondLastNode.size + lastNode.size) / 2,
		"#000000",
		{ x: newX, y: newY }
	);

	player_new.playerBody.nodes.splice(
		player_new.playerBody.nodes.length - 1,
		0,
		newNode
	);
}

function resizeNode(mouseX, mouseY, delta) {
	let nodeIndex = -1;

	for (let i = 0; i < player_new.playerBody.nodes.length; i++) {
		if (
			player_new.playerBody.nodes[i].containsPoint(new Vector2(mouseX, mouseY))
		) {
			nodeIndex = i;
			break;
		}
	}

	if (nodeIndex !== -1) {
		const newSize = Math.min(
			Math.max(
				player_new.playerBody.nodes[nodeIndex].size + delta / 50,
				minNodeSize
			),
			maxNodeSize
		);

		player_new.playerBody.nodes[nodeIndex].size = newSize;

		// for (let i = 0; i < player_new.playerBody.nodes.length; i++) {
		// 	if (i !== nodeIndex) {
		// 		const distance =  (nodeIndex + 1) - spacing * (i + 1);
		// 		const totalRadius =
		// 			player_new.playerBody.nodes[nodeIndex].size +
		// 			player_new.playerBody.nodes[i].size;

		// 		if (distance < totalRadius) {
		// 			player_new.playerBody.nodes[nodeIndex].size = Math.max(
		// 				totalRadius - player_new.playerBody.nodes[i].size,
		// 				minNodeSize
		// 			);
		// 		}
		// 	}
		// }
	}
}

function changeNodeColor(mouseX, mouseY) {
	let nodeIndex = -1;

	for (let i = 0; i < player_new.playerBody.nodes.length; i++) {
		if (
			player_new.playerBody.nodes[i].containsPoint(new Vector2(mouseX, mouseY))
		) {
			nodeIndex = i;
			break;
		}
	}

	if (nodeIndex !== -1) {
		console.log("clicked on: " + player_new.playerBody.nodes[nodeIndex].color);
		const newColor = prompt(
			"Enter a color (name or hex code):",
			player_new.playerBody.nodes[nodeIndex].color
		);
		if (newColor) {
			player_new.playerBody.nodes[nodeIndex].color = newColor;
		}
		if (
			nodeIndex !== 0 &&
			nodeIndex !== player_new.playerBody.nodes.length - 1
		) {
			const typeChoice = prompt(
				"Choose between 'fins' or 'arms':",
				player_new.playerBody.nodes[nodeIndex].type
			);
			if (typeChoice === "fins" || typeChoice === "arms") {
				player_new.playerBody.nodes[nodeIndex].type = typeChoice;
				alert(`You have selected ${typeChoice} for node ${nodeIndex + 1}.`);
			}
		}
	}
}

function setupBuilder() {
	let counter = 0;
	player_new.playerBody.nodes.forEach((node) => {
		node.position = new Vector2(5 + 10 * counter, 20);
		counter++;
	});
}

setupBuilder();

function animate2() {
	builder_context.clearRect(0, 0, builder_canvas.width, builder_canvas.height);
	player_new.draw(builder_context);
	requestAnimationFrame(animate2);
}

animate2();
