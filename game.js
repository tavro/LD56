const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ______________ Global Functions
function mousePositionToWorldCoords() {
	result = new Vector2(0, 0);
	result.x =
		camera.position.x + (mousePosition.x * camera.size) / worldToPixelFactor;
	result.y =
		camera.position.y + (mousePosition.y * camera.size) / worldToPixelFactor;
	return result;
	d;
}

function drawCircle(context, position, radius, color) {
	context.beginPath();
	context.arc(
		((position.x - camera.position.x) / camera.size) * worldToPixelFactor,
		((position.y - camera.position.y) / camera.size) * worldToPixelFactor,
		(radius / camera.size) * worldToPixelFactor,
		0,
		Math.PI * 2
	);
	context.fillStyle = color;
	context.fill();
	context.closePath();
}

let worldToPixelFactor = window.innerHeight;

// ______________ Classes
class Camera {
	constructor() {
		this.position = new Vector2(0, 0);
		this.aspectRatio = canvas.width / canvas.height;
		this.size = 20;
		console.log("Created Camera");
	}

	setCameraPosition(value) {
		this.position = this.position.add(value);
	}

	addCameraPosition(value) {
		this.position = this.position.add(new Vector2(value.x, value.y));
	}

	followTarget(targetCoords) {
		const offsetX = (this.size / 2) * this.aspectRatio;
		const offsetY = (this.size / 2);
		const newDelta = this.position.difference(targetCoords.add(new Vector2(-offsetX, -offsetY))).scale(0.1)
		this.position = this.position.add(newDelta)
	}
}

class MassObject {
	velocity = new Vector2(0, 0);
	position = new Vector2(0, 0);
	acceleration = new Vector2(0, 0);
	drag = 0.9;

	updatePhysics() {
		this.velocity = this.velocity.add(this.acceleration).scale(this.drag);
		this.position = this.position.add(this.velocity);

		this.acceleration = new Vector2(0, 0);
	}

	accelerateToPoint(targetCoords, force, isSpringy) {
		const delta = this.position.difference(targetCoords);
		if (isSpringy) {
			this.acceleration = new Vector2(delta.x, delta.y).scale(force);
		} else {
			this.acceleration = new Vector2(delta.x, delta.y)
				.normalized()
				.scale(force);
		}
	}
}

class Food extends MassObject {
	constructor(position) {
		super();
		this.position = position;
		this.size = 0.5;
		this.color = "green";
		this.isEaten = false;
	}

	update(player) {
		if (this.isEaten) {
			return;
		}

		this.updatePhysics();
		this.checkDistanceToPlayer(player);

		// this.accelerateToPoint(
		// 	this.position.add(new Vector2(Math.random() - 0.5, Math.random() - 0.5)),
		// 	0.2,
		// 	true
		// );
	}

	draw(context) {
		if (this.isEaten) {
			return;
		}
		drawCircle(context, this.position, this.size, this.color);
	}

	checkDistanceToPlayer(player) {
		const distance = this.position.distance(player.headPosition);
		if (distance < 1) {
			this.eat();
			player.giveFood();
		}
	}

	eat() {
		this.isEaten = true;
	}
}

class Node extends MassObject {
	constructor(size, color, position) {
		super();
		this.position = position;

		this.size = size;
		this.color = color;
		this.parent = null;
	}

	draw(context) {
		drawCircle(context, this.position, this.size, this.color);
	}

	containsPoint(x, y) {
		const distance = Math.sqrt(
			(x - this.position.x) ** 2 + (y - this.position.y) ** 2
		);
		return distance <= this.size;
	}

	update() {
		if (this.parent) {
			const distanceToParent = this.parent.position
				.difference(this.position)
				.magnitude();

			if (distanceToParent > this.size) {
				this.accelerateToPoint(this.parent.position, 0.01, true);
			}
		}
		this.updatePhysics();
	}
}

class Player {
	constructor() {
		this.headPosition;
		this.color = "blue";

		this.max_speed = 5;

		this.controlForce = 1 / 100;

		this.nodes = [
			new Node(1, "red", new Vector2(5, 5)),
			new Node(1, "green", new Vector2(7, 5)),
			new Node(1, "blue", new Vector2(9, 5)),
		];

		this.mainNode = this.nodes[0];

		for (let i = this.nodes.length - 1; i > 0; i--) {
			this.nodes[i].parent = this.nodes[i - 1];
		}
	}

	update() {
		if (isMouseDown) {
			this.mainNode.accelerateToPoint(
				mousePositionToWorldCoords(),
				this.controlForce,
				false
			);
		}

		this.nodes.forEach((node) => {
			node.update();
		});

		this.headPosition = this.mainNode.position;
	}

	giveFood() {
		data.foodAmount++;
	}

	draw(context) {
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(context);

			// if (i > 0) {
			// 	this.drawConnectingShape(
			// 		this.nodes[i - 1].position.x,
			// 		this.nodes[i - 1].position.y,
			// 		this.nodes[i].position.x,
			// 		this.nodes[i].position.y,
			// 		this.nodes[i - 1].size,
			// 		this.nodes[i].size,
			// 		this.nodes[i - 1].color,
			// 		this.nodes[i].color
			// 	);
			// }
		}
	}

	drawConnectingShape(x1, y1, x2, y2, size1, size2, color1, color2) {
		const controlHeight = 20;

		const x1w = x1 - camera.position.x;
		const y1w = y1 - camera.position.y;

		const x2w = x2 - camera.position.x;
		const y2w = y2 - camera.position.y;

		const gradient = ctx.createLinearGradient(x1w, y1w, x2w, y2w);
		gradient.addColorStop(0, color1);
		gradient.addColorStop(1, color2);

		ctx.beginPath();
		ctx.moveTo(x1w, y1w - size1);
		ctx.lineTo(x1w + (x2w - x1w) / 2, y1w - size1 - controlHeight);
		ctx.lineTo(x2w, y2w - size2);
		ctx.lineTo(x2w, y2w + size2);
		ctx.lineTo(x1w + (x2w - x1w) / 2, y1w + size1 + controlHeight);
		ctx.lineTo(x1w, y1w + size1);
		ctx.closePath();

		ctx.fillStyle = gradient;
		ctx.fill();
	}
}

// ____________ Game Logic
function GameInit() {
	console.log("Organism Game: Initialized");
}

function GameUpdate() {
	player.update();
	camera.followTarget(player.headPosition);

	if (keyboard.IsKeyHeld("d")) {
		camera.addCameraPosition(new Vector2(5 / 60.0, 0.0));
	}
	if (keyboard.IsKeyHeld("a")) {
		camera.addCameraPosition(new Vector2(-5 / 60.0, 0.0));
	}
	if (keyboard.IsKeyHeld("s")) {
		camera.addCameraPosition(new Vector2(0.0, 5 / 60.0));
	}
	if (keyboard.IsKeyHeld("w")) {
		camera.addCameraPosition(new Vector2(0.0, -5 / 60.0));
	}

	foods.forEach((food) => {
		food.update(player);
	});
}

function GameDraw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	player.draw(ctx);

	foods.forEach((food) => {
		food.draw(ctx);
	});
}

// _____________ Globals
let mousePosition = new Vector2(0, 0);
let player = new Player();
let isMouseDown = false;
let camera = new Camera();
let keyboard = new KeyboardManager();

let foods = [];

for (let i = 0; i < 20; i++) {
	let newFood = new Food(new Vector2(i * 1.2, 3));
	foods.push(newFood);
}

// ____________ Events
canvas.addEventListener("mousemove", (event) => {
	mousePosition.x = event.clientX;
	mousePosition.y = event.clientY;
});

canvas.addEventListener("mousedown", () => {
	isMouseDown = true;
});

canvas.addEventListener("mouseup", () => {
	isMouseDown = false;
});

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	worldToPixelFactor = window.innerHeight / 100;
});

document.addEventListener("keydown", (event) => {
	keyboard.__LogKeyDown(event.key);
});

document.addEventListener("keyup", (event) => {
	keyboard.__LogKeyUp(event.key);
});

// __________ Main function

function animate() {
	GameUpdate();
	GameDraw();
	requestAnimationFrame(animate);
}

GameInit();
animate();

// __________________ Character builder

const x = 5;
