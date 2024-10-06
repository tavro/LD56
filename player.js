class PlayerController {
	constructor() {
		this.headPosition;
		this.controlForce = 5 * 0.01;

		this.hotValue = 0.0;
		this.coldValue = 0.0;

		this.hotResistance = 0.0;
		this.coldResistance = 0.0;

		this.isHotResistant = false;
		this.isColdResistant = false;

		this.playerBody = new PlayerBody();
		this.mainNode = this.playerBody.nodes[0];
	}

	update() {
		if (isMouseDown) {
			this.mainNode.pushToPoint(
				mousePositionToWorldCoords(),
				this.controlForce,
				false
			);
		}

		this.playerBody.nodes.forEach((node) => {
			node.update();
		});

		this.headPosition = this.mainNode.position;

		if (this.hotValue > 0) {
			if (!this.isHotResistant) {
				this.hotValue -= (1 / 60) * 0.1;
			} else {
				this.hotValue = 1;
				hotValueBar.color = "green";
			}
		} else {
			this.hotValue = 0;
		}

		if (this.coldValue > 0) {
			if (!this.isColdResistant) {
				this.coldValue -= (1 / 60) * 0.1;
			} else {
				this.coldValue = 1;
				coldValueBar.color = "#46f065";
			}
		} else {
			this.coldValue = 0;
		}

		if (this.coldValue > 0.42 && this.coldValue < 0.58) {
			this.coldResistance += (1 / 60) * 0.1;
			coldValueBar.color = "#46f065";
		} else {
			coldValueBar.color = "#81d4f0";
		}

		if (this.hotValue > 0.42 && this.hotValue < 0.58) {
			this.hotResistance += (1 / 60) * 0.1;
			hotValueBar.color = "#46f065";
		} else {
			hotValueBar.color = "#f0533e";
		}

		if (!this.isColdResistant && this.coldResistance > 1) {
			this.coldResistance = 1;
			this.isColdResistant = true;
			data.coldAmount = 1;
		}

		if (!this.isHotResistant && this.hotResistance > 1) {
			this.hotResistance = 1;
			this.isHotResistant = true;
			data.warmAmount = 1;
		}

		if (!this.isColdResistant && this.coldValue > 1) {
			console.log("You froze to death :c");
			this.coldValue = 1;
		}

		if (!this.isHotResistant && this.hotValue >= 1) {
			console.log("You burned up :c");
			this.hotValue = 1;
		}

		hotValueBar.setValue(this.hotValue);
		coldValueBar.setValue(this.coldValue);

		hotResistanceBar.setValue(this.hotResistance);
		coldResistanceBar.setValue(this.coldResistance);
	}

	draw(context) {
		this.playerBody.draw(context);
	}

	giveFood() {
		data.foodAmount++;
	}

	addHotResistance(value) {
		if (!this.isHotResistant && this.hotValue <= 1.0) {
			this.hotValue += value;
		}
	}

	addColdResistance(value) {
		if (!this.isColdResistant && this.coldValue <= 1.0) {
			this.coldValue += value;
		}
	}
}

class Node_New extends MassObject {
	constructor(size, color, position) {
		super();
		this.size = size;
		this.color = color;
		this.position = position; // { x: number, y: number }
		this.type = null; // 'fins' or 'arms'
		this.parent = null;
		this.drag = 1.1;
	}

	update() {
		if (this.parent) {
			const distanceToParent = this.parent.position
				.difference(this.position)
				.magnitude();

			if (distanceToParent > this.size * 4) {
				this.pushToPoint(
					this.parent.position,
					Math.sqrt(distanceToParent) * 0.001,
					true
				);
			}
		}
		this.updatePhysics();
	}

	draw(context) {
		drawCircle(
			context,
			new Vector2(this.position.x, this.position.y),
			this.size,
			this.color
		);
		this.drawFeature(context);
	}

	containsPoint(checkPosition) {
		const pixelPos = worldToScreenCoords(this.position)
		const deltaPixels = checkPosition.difference(pixelPos);

		return deltaPixels.magnitude() <= this.size * pixelsPerUnit;
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

class PlayerBody {
	constructor() {
		this.headNode = new Node_New(2, "#FF0000", new Vector2(0, 0));
		this.nodes = [this.headNode];

		for (let i = 0; i < 3; i++) {
			this.nodes.push(new Node_New(2, "#00FF00", new Vector2(4 + i * 4, 0)));
		}

		for (let i = this.nodes.length - 1; i > 0; i--) {
			this.nodes[i].parent = this.nodes[i - 1];
		}
	}

	draw(context) {
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(context);
			if (i > 0) {
				this.drawInterpolatedCircles(context, this.nodes[i - 1], this.nodes[i]);
			}
		}

		// this.nodes[0].drawEyes(context);
		// this.drawTail(context, this.nodes[this.nodes.length - 1]);
		// this.drawMouth(context, this.nodes[0]);
	}

	drawInterpolatedCircles(context, node1, node2) {
		const numberOfCircles = 50;
		const dx = (node2.position.x - node1.position.x) / numberOfCircles;
		const dy = (node2.position.y - node1.position.y) / numberOfCircles;

		for (let i = 0; i <= numberOfCircles; i++) {
			const x = node1.position.x + i * dx;
			const y = node1.position.y + i * dy;

			const factor = i / numberOfCircles;

			const size = this.interpolateSize(node1.size, node2.size, factor);
			const color = this.interpolateColors(node1.color, node2.color, factor);

			drawCircle(context, new Vector2(x, y), size, color);
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

	drawTail(context, node) {
		const tailLength = 20;
		const tailWidth = 10;
		const tailX = node.position.x + node.size;
		const tailY = node.position.y;

		context.fillStyle = node.color;
		context.beginPath();
		context.moveTo(tailX, tailY);
		context.lineTo(tailX + tailLength, tailY - tailWidth);
		context.lineTo(tailX + tailLength, tailY + tailWidth);
		context.closePath();
		context.fill();
	}

	drawMouth(context, node) {
		const mouthWidth = node.size * 0.5;
		const mouthX = node.position.x;
		const mouthY = node.position.y + node.size * 0.2;

		context.fillStyle = "black";
		context.beginPath();
		context.arc(mouthX, mouthY, mouthWidth, 0, Math.PI, false);
		context.fill();
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
				this.nodes[i].position.x > canvas.width
			) {
				this.nodes[i].xVelocity *= -1;
			}
		}

		this.draw();

		// animationFrameId = requestAnimationFrame(() => this.animateNodes());
	}
}

let player_new = new PlayerController();
