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

		this.hungerValue = 0.75;
		this.hungerRate = 0.02;

		this.playerBody = new PlayerBody();
		this.mainNode = this.playerBody.nodes[0];
		this.headPosition = this.mainNode.position;

		this.tongueLength = 0.0;

		this.tongueReachedForward = false;
		this.tongueReachedBack = false;

		this.isDead = false;

		this.reviveTimer = 0;
		this.reviveTimeLimit = 3;
	}

	retractTongue() {
		this.tongueLength -= (1 / 60) * 4;
		if (this.tongueLength < 0.0) {
			this.tongueLength = 0;
			this.tongueReachedBack = true;
			this.tongueReachedForward = false;
		}
	}

	extendTongue() {
		this.tongueLength += (1 / 60) * 8;
		if (this.tongueLength > 0.0) {
			this.tongueLength = 1;
			this.tongueReachedForward = true;
			this.tongueReachedBack = false;
		}
	}

	update() {
		if (this.isDead) {
			this.revive();
			return;
		}

		if (isMouseDown) {
			this.mainNode.pushToPoint(
				mousePositionToWorldCoords(),
				this.controlForce,
				false
			);
		}

		if (isMouseRightDown) {
			if (!this.tongueReachedForward) {
				this.extendTongue();
			} else {
				this.retractTongue();
			}
		} else {
			this.retractTongue();
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

		if (this.coldValue > 0.4 && this.coldValue < 0.6) {
			this.coldResistance += (1 / 60) * 0.1;
			coldValueBar.color = "#46f065";
		} else {
			coldValueBar.color = "#81d4f0";
		}

		if (this.hotValue > 0.4 && this.hotValue < 0.6) {
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
			this.kill();
			this.coldValue = 1;
		}

		if (!this.isHotResistant && this.hotValue >= 1) {
			console.log("You burned up :c");
			this.kill();
			this.hotValue = 1;
		}

		hotValueBar.setValue(this.hotValue);
		coldValueBar.setValue(this.coldValue);

		hotResistanceBar.setValue(this.hotResistance);
		coldResistanceBar.setValue(this.coldResistance);

		if (!this.isDead) {
			this.getHungry(this.hungerRate);
		}
	}

	draw(context) {
		this.playerBody.draw(context);
		this.drawTongue(context);
	}

	drawTongue(context) {
		const headPixelPosition = worldToScreenCoords(this.headPosition);
		const delta = headPixelPosition.difference(mousePosition);

		const tongueTipPosition = delta.scale(this.tongueLength);
		const final = tongueTipPosition.add(headPixelPosition);

		context.beginPath();
		context.lineTo(headPixelPosition.x, headPixelPosition.y);
		context.lineTo(final.x, final.y);
		context.strokeStyle = "red";
		context.closePath();
		context.stroke();
	}

	setAlive() {
		this.isDead = true;
		this.hungerValue = 1.0;
	}

	damage(amount) {
		this.hungerValue -= amount;
	}

	getHungry(rate) {
		this.hungerValue -= (1 / 60) * rate;
		if (this.hungerValue < 0.3) {
			hungerBar.color = "red";
		}
		if (this.hungerValue > 0.4) {
			hungerBar.color = "#2dcf56";
		}

		if (this.hungerValue < 0) {
			this.kill();
		}

		hungerBar.setValue(this.hungerValue);
	}

	revive() {
		this.reviveTimer += 1 / 60;
		if (this.reviveTimer > this.reviveTimeLimit) {
			this.isDead = false;
			this.hungerValue = 1.0;
			this.position = new Vector2(0, 0);
			camera.position = new Vector2(0, 0);
			this.reviveTimer = 0;
			this.coldValue = 0;
			this.hotValue = 0;
			this.hotResistance = 0;
			this.coldResistance = 0;
		}
	}

	kill() {
		this.hungerValue = 0;
		this.isDead = true;
		deathCount++;
		console.log("Player died. death count: " + deathCount);

		// TODO Send game over trigger
	}

	giveFood() {
		data.foodAmount++;
		this.hungerValue += 0.05;
		if (this.hungerValue > 1.0) {
			this.hungerValue = 1.0;
		}
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
		this.previousPosition = new Vector2(position.x, position.y);
		this.direction = new Vector2(0, 0);
		this.type = null; // 'fins' or 'arms'
		this.parent = null;
		this.drag = 1.1;
		this.level = 1;
		this.maxLevel = 3;
	}

	update() {
		const currentPosition = new Vector2(this.position.x, this.position.y);

		if (this.parent) {
			const distanceToParent = this.parent.position
				.difference(this.position)
				.magnitude();

			if (distanceToParent > this.size * 1) {
				this.pushToPoint(
					this.parent.position,
					Math.sqrt(distanceToParent) * 0.001,
					true,
					false
				);
			}
			if (distanceToParent < this.size * 2) {
				this.pushToPoint(
					this.parent.position,
					Math.sqrt(distanceToParent) * 0.001,
					true,
					true
				);
			}
		}
		this.updatePhysics();

		this.calculateMovementDirection(currentPosition);
	}

	calculateMovementDirection(currentPosition) {
		const direction = currentPosition.difference(this.previousPosition);
		this.previousPosition = currentPosition;

		const magnitude = direction.magnitude();
		if (magnitude > 0) {
			this.direction = new Vector2(
				direction.x / magnitude,
				direction.y / magnitude
			);
		} else {
			this.direction = new Vector2(0, 0);
		}
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
		const pixelPos = worldToScreenCoords(this.position);
		const deltaPixels = checkPosition.difference(pixelPos);

		return deltaPixels.magnitude() <= this.size * pixelsPerUnit;
	}

	drawEyes(ctx) {
		const eyeSize = this.size * 0.1;

		const screenPosition = worldToScreenCoords(this.position);
		const eyeY = screenPosition.y - this.size * 0.1 * pixelsPerUnit;

		const leftEyeX = screenPosition.x - this.size * 0.15 * pixelsPerUnit;
		const rightEyeX = screenPosition.x + this.size * 0.15 * pixelsPerUnit;

		ctx.beginPath();
		ctx.arc(leftEyeX, eyeY, eyeSize * pixelsPerUnit, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(rightEyeX, eyeY, eyeSize * pixelsPerUnit, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();

		const pupilSize = eyeSize * 0.5;
		ctx.fillStyle = "black";

		ctx.beginPath();
		ctx.arc(leftEyeX, eyeY, pupilSize * pixelsPerUnit, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(rightEyeX, eyeY, pupilSize * pixelsPerUnit, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}

	drawFeature(ctx) {
		const screenPosition = worldToScreenCoords(this.position);

		if (this.type === "arms") {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = 2;

			const angle = Math.atan2(this.direction.y, this.direction.x);

			ctx.save();
			ctx.translate(screenPosition.x, screenPosition.y);
			ctx.rotate(angle);

			ctx.beginPath();
			ctx.moveTo(0, -this.size * 0.35 * pixelsPerUnit);
			ctx.lineTo(0, -this.size * (0.7 * this.level) * pixelsPerUnit);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, this.size * 0.35 * pixelsPerUnit);
			ctx.lineTo(0, this.size * (0.7 * this.level) * pixelsPerUnit);
			ctx.stroke();

			ctx.restore();
		} else if (this.type === "fins") {
			ctx.fillStyle = this.color;

			const angle = Math.atan2(this.direction.y, this.direction.x);

			ctx.save();
			ctx.translate(screenPosition.x, screenPosition.y);
			ctx.rotate(angle);

			ctx.beginPath();
			ctx.moveTo(0, -this.size * 0.35 * pixelsPerUnit);
			ctx.lineTo(
				-this.size * 0.25 * pixelsPerUnit,
				-this.size * (0.75 * this.level) * pixelsPerUnit
			);
			ctx.lineTo(
				this.size * 0.25 * pixelsPerUnit,
				-this.size * (0.75 * this.level) * pixelsPerUnit
			);
			ctx.closePath();
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(0, this.size * 0.35 * pixelsPerUnit);
			ctx.lineTo(
				-this.size * 0.25 * pixelsPerUnit,
				this.size * (0.75 * this.level) * pixelsPerUnit
			);
			ctx.lineTo(
				this.size * 0.25 * pixelsPerUnit,
				this.size * (0.75 * this.level) * pixelsPerUnit
			);
			ctx.closePath();
			ctx.fill();

			ctx.restore();
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

		this.nodes[0].drawEyes(context);
		this.drawTail(context, this.nodes[this.nodes.length - 1]);
		this.drawMouth(context, this.nodes[0]);
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
		const tailLength = 0.5;
		const tailWidth = 0.25;

		const screenPosition = worldToScreenCoords(node.position);

		const direction = new Vector2(
			node.position.x - node.parent.position.x,
			node.position.y - node.parent.position.y
		);

		const magnitude = direction.magnitude();
		if (magnitude > 0) {
			direction.x /= magnitude;
			direction.y /= magnitude;
		}

		const tailBaseX =
			screenPosition.x + direction.x * (node.size * 0.35 * pixelsPerUnit);
		const tailBaseY =
			screenPosition.y + direction.y * (node.size * 0.35 * pixelsPerUnit);

		const tailEndX = tailBaseX + direction.x * (tailLength * pixelsPerUnit);
		const tailEndY = tailBaseY + direction.y * (tailLength * pixelsPerUnit);

		const angle = Math.atan2(direction.y, direction.x);

		context.fillStyle = node.color;
		context.save();

		context.translate(tailBaseX, tailBaseY);
		context.rotate(angle);

		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(tailLength * pixelsPerUnit, -tailWidth * pixelsPerUnit);
		context.lineTo(tailLength * pixelsPerUnit, tailWidth * pixelsPerUnit);
		context.closePath();
		context.fill();

		context.restore();
	}

	drawMouth(context, node) {
		const mouthWidth = node.size * 0.2;

		const screenPosition = worldToScreenCoords(node.position);
		const screenMouthX = screenPosition.x;
		const screenMouthY = screenPosition.y + node.size * 0.1 * pixelsPerUnit;

		context.fillStyle = "black";

		context.beginPath();
		context.arc(
			screenMouthX,
			screenMouthY,
			mouthWidth * pixelsPerUnit,
			0,
			Math.PI,
			false
		);
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
				this.nodes[i].position.x > builder_canvas.width
			) {
				this.nodes[i].xVelocity *= -1;
			}
		}

		this.draw();

		// animationFrameId = requestAnimationFrame(() => this.animateNodes());
	}
}

let player_new = new PlayerController();
