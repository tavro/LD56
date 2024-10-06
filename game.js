const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Buffer context for tinting
buffer = document.createElement("canvas");
if (typeof window.G_vmlCanvasManager != "undefined") {
	G_vmlCanvasManager.initElement(buffer);
}
const buffer_ctx = buffer.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ______________ Resources
zone_img = new Image();
zone_img.src = "Res/Organism/Organism_Zone.png";

// ______________ Global Constants
const pixelsPerUnit = 32;

// ______________ Global Functions
function mousePositionToWorldCoords() {
	result = new Vector2(0, 0);
	result.x =
		camera.position.x + (mousePosition.x * camera.size) / worldToPixelFactor;
	result.y =
		camera.position.y + (mousePosition.y * camera.size) / worldToPixelFactor;
	return result;
}

function drawImg(context, img, worldPosition, worldSize, color, opacity = 1.0) {
	context.globalAlpha = opacity;

	const pixelSize = (worldToPixelFactor / camera.size) * worldSize;

	const centerOffset = -pixelSize / 2;

	buffer.width = pixelSize;
	buffer.height = pixelSize;

	const screenPosition = new Vector2(
		((worldPosition.x - camera.position.x) / camera.size) * worldToPixelFactor,
		((worldPosition.y - camera.position.y) / camera.size) * worldToPixelFactor
	).add(new Vector2(centerOffset, centerOffset));

	buffer_ctx.fillStyle = color;
	buffer_ctx.fillRect(0, 0, canvas.width, canvas.height);

	buffer_ctx.globalCompositeOperation = "destination-atop";
	buffer_ctx.drawImage(img, 0, 0, pixelSize, pixelSize);

	context.drawImage(
		img,
		screenPosition.x,
		screenPosition.y,
		pixelSize,
		pixelSize
	);
	context.drawImage(
		buffer,
		screenPosition.x,
		screenPosition.y,
		pixelSize,
		pixelSize
	);
	context.globalAlpha = 1.0;
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
		this.size = 40;
	}

	setCameraPosition(value) {
		this.position = this.position.add(value);
	}

	addCameraPosition(value) {
		this.position = this.position.add(new Vector2(value.x, value.y));
	}

	followTarget(targetCoords) {
		const offsetX = (this.size * this.aspectRatio) / 2;
		const offsetY = this.size / 2;
		const newDelta = this.position
			.difference(targetCoords.add(new Vector2(-offsetX, -offsetY)))
			.scale(0.1);
		this.position = this.position.add(newDelta);
	}
}

class MassObject {
	constructor(position = null, drag = 1.2) {
		this.position = position;
		if (position === null) this.position = new Vector2(0, 0);

		this.drag = drag;

		this.mass = 1;

		this.force = new Vector2(0, 0);
		this.velocity = new Vector2(0, 0);
		this.acceleration = new Vector2(0, 0);
	}

	getDirectionAngle() {
		return Math.atan2(this.velocity.y, this.velocity.x);
	}

	updatePhysics() {
		this.acceleration = this.force.scale(1 / this.mass);
		this.velocity = this.velocity.add(this.acceleration).scale(1 / this.drag);
		this.position = this.position.add(this.velocity);
		this.force = new Vector2(0, 0);
	}

	pushToPoint(targetCoords, force, isSpringy, threshold = 0) {
		const delta = this.position.difference(targetCoords);
		if (delta.magnitude() > threshold) {
			if (isSpringy) {
				this.force = new Vector2(delta.x, delta.y).scale(force);
			} else {
				this.force = new Vector2(delta.x, delta.y).normalized().scale(force);
			}
		}
	}

	pushToDirection(directionAngle, force) {
		const direction = new Vector2(
			Math.cos(directionAngle),
			Math.sin(directionAngle)
		);

		this.force = new Vector2(direction.x, direction.y).scale(force);
	}

	pushForward(force, angleSpan) {
		this.pushToDirection(
			this.getDirectionAngle() + (Math.random() - 0.5) * angleSpan,
			force
		);
	}
}

class Zone extends MassObject {
	constructor(position, size, isHot) {
		super();
		this.position = position;
		this.size = size;
		this.isHot = isHot;
		this.color = "pink";
		this.mass = 3;
		this.drag = 1.012;

		if (this.isHot) {
			this.color = "red";
		} else {
			this.color = "#8adeff";
		}
	}

	draw(context) {
		drawImg(context, zone_img, this.position, this.size, this.color, 0.5);
	}

	update(player) {
		const distanceToPlayer = this.position
			.difference(player.headPosition)
			.magnitude();
		if (distanceToPlayer < this.size / 2) {
			const distanceToCenter = 1 - (distanceToPlayer / this.size) * 2;

			if (this.isHot) {
				player.addHotResistance(((distanceToCenter + 1) ** 2 / 20) * (1 / 60));
			} else {
				player.addColdResistance(((distanceToCenter + 1) ** 2 / 20) * (1 / 60));
			}
		}
		if (Math.random() < 0.2) {
			this.pushForward(Math.random() * 0.04, Math.PI);
		}
		this.updatePhysics();
	}
}

class Food extends MassObject {
	constructor(position) {
		super();
		this.position = position;
		this.size = Math.random() * 0.5 + 0.5;
		this.color = "green";
		this.isEaten = false;
	}

	update(player) {
		if (this.isEaten) {
			return;
		}

		this.checkDistanceToPlayer(player);

		this.pushToPoint(
			this.position.add(new Vector2(Math.random() - 0.5, Math.random() - 0.5)),
			0.008,
			true
		);
		this.updatePhysics();
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

class UIBar {
	constructor(screenPosition, value, pixelLength, pixelHeight, color) {
		this.screenPosition = screenPosition;
		this.value = value;
		this.pixelLength = pixelLength;
		this.color = color;
		this.pixelHeight = pixelHeight;
	}

	update(player) {}

	addValue(offset) {
		this.setValue(this.value + offset);
	}

	setValue(val) {
		this.value = val;
		if (this.value > 1) {
			this.value = 1;
		}
		if (this.value < 0) {
			this.value = 0;
		}
	}

	draw(context) {
		context.fillStyle = "black";
		context.fillRect(
			this.screenPosition.x - 2,
			this.screenPosition.y - 2,
			this.pixelLength + 4,
			this.pixelHeight + 4
		);

		context.fillStyle = "white";
		context.fillRect(
			this.screenPosition.x,
			this.screenPosition.y,
			this.pixelLength,
			this.pixelHeight
		);

		context.fillStyle = this.color;
		context.fillRect(
			this.screenPosition.x,
			this.screenPosition.y,
			this.pixelLength * this.value,
			this.pixelHeight
		);
	}
}

class OrganismNode extends MassObject {
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

	update() {
		if (this.parent) {
			const distanceToParent = this.parent.position
				.difference(this.position)
				.magnitude();

			if (distanceToParent > this.size * 4) {
				this.pushToPoint(this.parent.position, 0.01, true);
			}
		}
		this.updatePhysics();
	}
}

class Player {
	constructor() {
		this.headPosition;
		this.controlForce = 5 * 0.01;

		this.hotValue = 0.0;
		this.coldValue = 0.0;

		this.hotResistance = 0.0;
		this.coldResistance = 0.0;

		this.isHotResistant = false;
		this.isColdResistant = false;

		this.nodes = [
			new OrganismNode(1, "red", new Vector2(0, 0)),
			new OrganismNode(1, "green", new Vector2(2, 0)),
			new OrganismNode(1, "blue", new Vector2(4, 0)),
		];

		this.mainNode = this.nodes[0];

		for (let i = this.nodes.length - 1; i > 0; i--) {
			this.nodes[i].parent = this.nodes[i - 1];
		}
	}

	update() {
		if (isMouseDown) {
			this.mainNode.pushToPoint(
				mousePositionToWorldCoords(),
				this.controlForce,
				false
			);
		}

		this.nodes.forEach((node) => {
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
				coldValueBar.color = "green";
			}
		} else {
			this.coldValue = 0;
		}

		if (this.coldValue > 0.42 && this.coldValue < 0.58) {
			this.coldResistance += (1 / 60) * 0.1;
			coldValueBar.color = "green";
		} else {
			coldValueBar.color = "red";
		}

		if (this.hotValue > 0.42 && this.hotValue < 0.58) {
			this.hotResistance += (1 / 60) * 0.1;
			hotValueBar.color = "green";
		} else {
			hotValueBar.color = "red";
		}

		if (!this.isColdResistant && this.coldResistance > 1) {
			this.coldResistance = 1;
			this.isColdResistant = true;
			data.coldAmount = 1;
		}

		if (!this.isHotResistant && this.hotResistance > 1) {
			this.hotResistance = 1;
			this.isHotResistant = true;
			data.hotAmount = 1;
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
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(context);
		}
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

function spawnFood(
	exploredRect,
	east = false,
	west = false,
	north = false,
	south = false
) {
	if (east) {
		for (let i = 0; i < exploredRect.getDimensions().y / 8; i++) {
			const lineStart = exploredRect.right;
			const lineEnd = exploredRect.right + camera.size * camera.aspectRatio;
			const randomY =
				exploredRect.top + Math.random() * exploredRect.getDimensions().y;
			const randomX =
				exploredRect.right + Math.random() * (lineEnd - lineStart);
			let newFood = new Food(new Vector2(randomX, randomY));
			foods.push(newFood);
		}
	}
	if (west) {
		for (let i = 0; i < exploredRect.getDimensions().y / 8; i++) {
			const lineStart = exploredRect.left;
			const lineEnd = exploredRect.left - camera.size * camera.aspectRatio;
			const randomY =
				exploredRect.top + Math.random() * exploredRect.getDimensions().y;
			const randomX = exploredRect.left + Math.random() * (lineEnd - lineStart);
			let newFood = new Food(new Vector2(randomX, randomY));
			foods.push(newFood);
		}
	}

	if (south) {
		for (let i = 0; i < exploredRect.getDimensions().x / 8; i++) {
			const lineStart = exploredRect.bottom;
			const lineEnd = exploredRect.bottom + camera.size * camera.aspectRatio;
			const randomX =
				exploredRect.left + Math.random() * exploredRect.getDimensions().x;
			const randomY =
				exploredRect.bottom + Math.random() * (lineEnd - lineStart);
			let newFood = new Food(new Vector2(randomX, randomY));
			foods.push(newFood);
		}
	}

	if (north) {
		for (let i = 0; i < exploredRect.getDimensions().x / 8; i++) {
			const lineStart = exploredRect.top;
			const lineEnd = exploredRect.top - camera.size * camera.aspectRatio;
			const randomX =
				exploredRect.left + Math.random() * exploredRect.getDimensions().x;
			const randomY = exploredRect.top + Math.random() * (lineEnd - lineStart);
			let newFood = new Food(new Vector2(randomX, randomY));
			foods.push(newFood);
		}
	}
}

// ____________ Game Logic
function GameUpdate() {
	player.update();
	camera.followTarget(player.headPosition);

	if (player.headPosition.x > areaExpoloredRect.right) {
		areaExpoloredRect.right =
			player.headPosition.x + (camera.size * camera.aspectRatio) / 2;
		spawnFood(areaExpoloredRect, true, false, false, false);
	}
	if (player.headPosition.x < areaExpoloredRect.left) {
		areaExpoloredRect.left =
			player.headPosition.x - (camera.size * camera.aspectRatio) / 2;
		spawnFood(areaExpoloredRect, false, true, false, false);
	}
	if (player.headPosition.y > areaExpoloredRect.bottom) {
		areaExpoloredRect.bottom = player.headPosition.y + camera.size / 2;
		spawnFood(areaExpoloredRect, false, false, false, true);
	}
	if (player.headPosition.y < areaExpoloredRect.top) {
		areaExpoloredRect.top = player.headPosition.y - camera.size / 2;
		spawnFood(areaExpoloredRect, false, false, true, false);
	}

	foods.forEach((food) => {
		food.update(player);
	});

	zones.forEach((zone) => {
		zone.update(player);
	});
}

function GameDraw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	player.draw(ctx);

	foods.forEach((food) => {
		food.draw(ctx);
	});

	zones.forEach((zone) => {
		zone.draw(ctx);
	});

	hotValueBar.draw(ctx);
	coldValueBar.draw(ctx);
	hotResistanceBar.draw(ctx);
	coldResistanceBar.draw(ctx);
}

// _____________ Globals
let mousePosition = new Vector2(0, 0);
let player = new Player();
let isMouseDown = false;
let camera = new Camera();
let keyboard = new KeyboardManager();

let foods = [];

let areaExpoloredRect = new Rect();

let hotValueBar = new UIBar(
	new Vector2(canvas.width / 2 - 100, 10),
	0,
	200,
	20,
	"red"
);

let hotResistanceBar = new UIBar(
	new Vector2(canvas.width / 2 - 100, 30),
	0,
	200,
	10,
	"green"
);

let coldValueBar = new UIBar(
	new Vector2(canvas.width / 2 - 100, 50),
	0,
	200,
	20,
	"blue"
);

let coldResistanceBar = new UIBar(
	new Vector2(canvas.width / 2 - 100, 70),
	0,
	200,
	10,
	"green"
);

for (let i = 0; i < 20; i++) {
	let newFood = new Food(new Vector2(i * 1.2, 0));
	foods.push(newFood);
}

let zones = [];

for (let i = 0; i < 30; i++) {
	const randomX = Math.random() - 0.5 * 50;
	const randomY = Math.random() - 0.5 * 50;
	let newZone = new Zone(new Vector2(randomX, randomY), (Math.random() + 10) * 10)
	if (Math.random() > 0.5) {
		let hotZone = new Zone(new Vector2(20, 0), 20, true);
	}
}

let hotZone = new Zone(new Vector2(20, 0), 20, true);
let coldZone = new Zone(new Vector2(-20, 0), 20, false);
zones.push(hotZone);
zones.push(coldZone);

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
	worldToPixelFactor = window.innerHeight;
	camera.aspectRatio = canvas.width / canvas.height;
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

animate();

// __________________ Character builder

const x = 5;
