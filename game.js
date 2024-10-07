const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ______________ Resources

zoneHot_img = new Image();
zoneHot_img.src = resouceUrl + "Organism/Organism_ZoneHot.png";

zoneCold_img = new Image();
zoneCold_img.src = resouceUrl + "Organism/Organism_ZoneCold.png";

food1_img = new Image();
food1_img.src = resouceUrl + "Organism/Organism_Food1.png";

food2_img = new Image();
food2_img.src = resouceUrl + "Organism/Organism_Food2.png";

food3_img = new Image();
food3_img.src = resouceUrl + "Organism/Organism_Food3.png";

virus1_img = new Image();
virus1_img.src = resouceUrl + "Organism/Organism_Virus1.png";

virus2_img = new Image();
virus2_img.src = resouceUrl + "Organism/Organism_Virus2.png";

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
	opacity = opacity < 0 ? 0 : opacity

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

	getDiagonalLength() {
		const diagnoal = Math.sqrt(
			this.size ** 2 + (this.size * this.aspectRatio) ** 2
		);
		return diagnoal;
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

class Virus extends MassObject {
	constructor(position) {
		super();
		this.position = position;
	}
}

class Food extends MassObject {
	constructor(position) {
		super();
		this.position = position;
		this.size = Math.random() * 2 + 2;
		this.color = "green";
		this.isEaten = false;
		this.img = null;
		this.opacity = 1.0

		// Select a random image from res
		const randNum = Math.floor(Math.random() * 3);
		if (randNum == 0) {
			this.img = food1_img;
		} else if (randNum == 1) {
			this.img = food2_img;
		} else if (randNum == 2) {
			this.img = food3_img;
		}
	}

	update(player) {
		
		if (!this.isEaten) {
			this.pushToPoint(
				this.position.add(
					new Vector2(Math.random() - 0.5, Math.random() - 0.5)
				),
				0.01,
				false
			);
		}
		else {
			this.opacity -= (1/60) * 10
		}

		this.checkDistanceToPlayer(player);
		this.updatePhysics();
	}

	draw(context) {
		drawImg(context, this.img, this.position, this.size, this.opacity);
	}

	checkDistanceToPlayer(player) {
		const distance = this.position.distance(player.headPosition);

		if (distance < player.playerBody.headNode.size + 6) {
			this.pushToPoint(player.headPosition, 0.15, false);
		}

		if (distance < player.playerBody.headNode.size) {
			this.eat(player);
			player.giveFood();
			this.isEaten = true;
		}
	}

	eat(player) {
		if (this.isEaten) {
			return;
		}
		this.isEaten = true;
		soundManager.playSound("eat");
	}
}

class UIBar {
	constructor(
		screenPosition,
		value,
		pixelLength,
		pixelHeight,
		color,
		isVertical
	) {
		this.screenPosition = screenPosition;
		this.value = value;
		this.pixelLength = pixelLength;
		this.color = color;
		this.pixelHeight = pixelHeight;
		this.isVertical = isVertical;
	}

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
		if (this.isVertical) {
			context.fillStyle = "black";
			context.fillRect(
				this.screenPosition.x - 2,
				this.screenPosition.y + 2,
				this.pixelLength + 4,
				-this.pixelHeight - 4
			);

			context.fillStyle = "white";
			context.fillRect(
				this.screenPosition.x,
				this.screenPosition.y,
				this.pixelLength,
				-this.pixelHeight
			);

			context.fillStyle = this.color;
			context.fillRect(
				this.screenPosition.x,
				this.screenPosition.y,
				this.pixelLength,
				-this.pixelHeight * this.value
			);
		} else {
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
function spawnAround(position, radius, isFood, isZone, isVirus) {
	const delta = lastSpawnPoint.difference(position);

	if (delta.magnitude() > radius) {
		const dirAngle = Math.atan2(delta.y, delta.x);

		for (let a = 0; a < Math.PI; a += 0.3) {
			const distance = new Vector2(
				Math.cos(dirAngle + a - Math.PI / 2),
				Math.sin(dirAngle + a - Math.PI / 2)
			).scale(radius + (Math.random() * radius) / 2);
			const spawnPoint = position.add(distance);

			if (isFood) {
				let newFood = new Food(spawnPoint);
				foods.push(newFood);
			}
			if (isZone) {
				if (Math.random() < 0.15) {
					let newZone = new Zone(spawnPoint, Math.random() * 30 + 30);
					if (Math.random() > 0.5) {
						newZone.setIsHot(true);
					} else {
						newZone.setIsHot(false);
					}
					zones.push(newZone);
				}
			}
			if (isVirus) {
				if (Math.random() < 0.05) {
					let newVirus = new Virus(spawnPoint);
					viruses.push(newVirus);
				}
			}
		}
		lastSpawnPoint = position;
	}
}

// ____________ Game Logic
function GameInit() {
	// spawns food
	for (let i = 0; i < 40; i++) {
		const randomX =
			(Math.random() - 0.5) * camera.size * camera.aspectRatio * 2;
		const randomY = (Math.random() - 0.5) * camera.size * 2 + camera.size / 4;
		let newFood = new Food(new Vector2(randomX, randomY));
		foods.push(newFood);
	}
}

function GameUpdate() {
	if (inGame) {
		player_new.update();
		camera.followTarget(player_new.headPosition);

		spawnAround(
			player_new.headPosition,
			camera.getDiagonalLength() / 2,
			true,
			startedPhaseHeat,
			startedPhaseVirus
		);

		foods.forEach((food) => {
			food.update(player_new);
		});

		zones.forEach((zone) => {
			zone.update(player_new);
		});

		if (!startedPhaseHeat && phaseNumber == 1) {
			console.log("STARTED PHASE Heat");
			startedPhaseHeat = true;
			startPhaseHot();
		}

		if (!startedPhaseVirus && phaseNumber == 2) {
			console.log("STARTED PHASE Virus");
			startedPhaseVirus = true;
			startPhaseVirus();
		}
	}
}

let startedPhaseHeat = false;
let startedPhaseVirus = false;

phaseNumber = 2;

function startPhaseHot() {
	// Spwan hot spots
}

function startPhaseVirus() {
	// spawn virus
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

	if (startedPhaseHeat) {
		hotResistanceBar.draw(ctx);
		hotValueBar.draw(ctx);
		coldResistanceBar.draw(ctx);
		coldValueBar.draw(ctx);
	}
	bars.forEach((bar) => {
		bar.draw(ctx);
	});
}

// _____________ Globals
let mousePosition = new Vector2(0, 0);
let isMouseDown = false;
let camera = new Camera();
let keyboard = new KeyboardManager();

let foods = [];
let viruses = [];
let bars = [];

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

let hungerBar = new UIBar(
	new Vector2(20, canvas.height - 20),
	0,
	40,
	400,
	"#2dcf56",
	true
);
bars.push(hungerBar);

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

GameInit();
animate();

// __________________ Character builder

const x = 5;
