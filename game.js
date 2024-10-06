const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ______________ Resources
zoneHot_img = new Image();
zoneCold_img = new Image();
zoneHot_img.src = "Res/Organism/Organism_ZoneHot.png";
zoneCold_img.src = "Res/Organism/Organism_ZoneCold.png";

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

function worldToScreenCoords(worldCoords) {
	result = new Vector2(0, 0);
	result.x =
		((worldCoords.x - camera.position.x) / camera.size) * worldToPixelFactor;

	result.y =
		((worldCoords.y - camera.position.y) / camera.size) * worldToPixelFactor;

	return result;
}

function drawImg(context, img, worldPosition, worldSize, opacity = 1.0) {
	context.globalAlpha = opacity;

	const pixelSize = (worldToPixelFactor / camera.size) * worldSize;

	const centerOffset = -pixelSize / 2;

	const screenPosition = new Vector2(
		((worldPosition.x - camera.position.x) / camera.size) * worldToPixelFactor,
		((worldPosition.y - camera.position.y) / camera.size) * worldToPixelFactor
	).add(new Vector2(centerOffset, centerOffset));

	context.drawImage(
		img,
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
		this.size = 100;
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

class Zone extends MassObject {
	constructor(position, size) {
		super();
		this.position = position;
		this.size = size;
		this.isHot = true;
		this.mass = 3;
		this.drag = 1.012;
	}

	setIsHot(value) {
		this.isHot = value;
	}

	draw(context) {
		if (this.isHot) {
			drawImg(context, zoneHot_img, this.position, this.size, 0.5);
		} else {
			drawImg(context, zoneCold_img, this.position, this.size, 0.5);
		}
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
			0.01,
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
		if (distance < player.playerBody.headNode.size) {
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

let lastSpawnPoint = new Vector2(0, 0);
function spawnAround(position, radius, isZone, isFood) {
	const delta = lastSpawnPoint.difference(position);

	if (delta.magnitude() > radius) {
		const dirAngle = Math.atan2(delta.y, delta.x);

		for (let a = 0; a < Math.PI; a += 0.3) {
			const distance = new Vector2(
				Math.cos(dirAngle + a - Math.PI / 2),
				Math.sin(dirAngle + a - Math.PI / 2)
			).scale(Math.random() * radius + radius);
			const spawnPoint = position.add(distance);

			if (isFood) {
				let newFood = new Food(spawnPoint);
				foods.push(newFood);
			}
			if (isZone) {
				let newZone = new Zone(spawnPoint, Math.random() * 10 + 10);
				if (Math.random() > 0.5) {
					newZone.setIsHot(true);
				} else {
					newZone.setIsHot(false);
				}
				zones.push(newZone);
			}
		}
		lastSpawnPoint = position;
	}
}

// ____________ Game Logic
function GameUpdate() {
	if(inGame) {
		player_new.update();
		camera.followTarget(player_new.headPosition);
		
		spawnAround(player_new.headPosition, camera.size / 2, false, true);
		if (startedPhaseOne) {
			spawnAround(player_new.headPosition, camera.size / 2, true, false);
		}
		
		foods.forEach((food) => {
			food.update(player_new);
		});
		
		zones.forEach((zone) => {
			zone.update(player_new);
		});
		
		if (!startedPhaseOne && phaseNumber == 1) {
			console.log("STARTED PHASE 1");
			startedPhaseOne = true;
		}
	}
}

let startedPhaseOne = false;

function startHotPhase() {
	// Spwan hot spots
}

function GameDraw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	player_new.draw(ctx);

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
	"#46f065"
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
	"#46f065"
);

for (let i = 0; i < 20; i++) {
	let newFood = new Food(new Vector2(i * 1.2, 0));
	foods.push(newFood);
}

let zones = [];

// for (let i = 0; i < 20; i++) {
// 	const randomX = (Math.random() - 0.5) * 50;
// 	const randomY = (Math.random() - 0.5) * 50;
// 	let newZone = new Zone(
// 		new Vector2(randomX, randomY),
// 		Math.random() * 10 + 10
// 	);
// 	if (Math.random() > 0.5) {
// 		newZone.setIsHot(true);
// 	} else {
// 		newZone.setIsHot(false);
// 	}
// 	zones.push(newZone);
// }
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
