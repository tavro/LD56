const game_canvas = document.getElementById("canvas");
const ctx = game_canvas.getContext("2d");

game_canvas.width = window.innerWidth;
game_canvas.height = window.innerHeight;

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
	opacity = opacity < 0 ? 0 : opacity;

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
		this.aspectRatio = game_canvas.width / game_canvas.height;
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
			.scale(0.2);
		this.position = this.position.add(newDelta);
	}
}

class Zone extends MassObject {
	constructor(position) {
		super();
		this.position = position;
		this.size = Math.random() * 30 + 30;
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

	checkMouseClick() {}
}

class Virus extends MassObject {
	constructor(position) {
		super();
		this.position = position;
		this.img = null;
		this.opacity = 1.0;
		this.size = 10;
		this.health = 200;
		this.isDead = false;
		this.offset = new Vector2(0, 0);

		// Select a random image from res
		const randNum = Math.floor(Math.random() * 2);
		if (randNum == 0) {
			this.img = virus1_img;
		} else if (randNum == 1) {
			this.img = virus2_img;
		}
	}

	draw(context) {
		if (this.isDead) {
			return;
		}
		drawImg(context, this.img, this.position.add(this.offset), this.size);
	}

	update(player) {
		const delta = player.headPosition.difference(this.position);
		const distanceToPlayer = delta.magnitude();

		if (distanceToPlayer < (camera.size * camera.aspectRatio) / 2) {
			this.pushToPoint(player.headPosition, 0.03, false);
			this.updatePhysics();
		}

		if (distanceToPlayer < player.playerBody.headNode.size + 2) {
			this.damagePlayer(player);
		}

		if (this.health < 150) {
			this.shake(0.25);
		}
		if (this.health < 100) {
			this.shake(0.5);
		}

		if (this.health < 50) {
			this.shake(1.0);
		}

		if (isMouseRightDown) {
			if (this.containsPoint(mousePosition)) {
				this.damageSelf();
			}
		}
	}

	shake(amount) {
		this.offset = new Vector2(
			(Math.random() - 0.5) * amount,
			(Math.random() - 0.5) * amount
		);
	}

	damagePlayer(player) {
		this.knockBack(2);
		player.damage(0.075);
	}

	damageSelf() {
		if (this.isDead) {
			return;
		}
		this.health--;
		if (this.health % 20 == 0) {
			this.knockBack(0.4);
		}
		if (this.health <= 0) {
			this.kill();
		}
	}

	knockBack(force) {
		const deltaToPlayer = player_new.headPosition.difference(this.position);
		this.pushToDirection(Math.atan2(deltaToPlayer.y, deltaToPlayer.x), force);
		this.updatePhysics();
	}

	kill() {
		data.killAmount++;
		this.isDead = true;
	}

	checkMouseClick() {}

	containsPoint(checkPosition) {
		const pixelPos = worldToScreenCoords(this.position);
		const deltaPixels = checkPosition.difference(pixelPos);

		return deltaPixels.magnitude() <= (this.size * pixelsPerUnit) / 4;
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
		this.opacity = 1.0;

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
		} else {
			this.opacity -= (1 / 60) * 10;
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
			this.pushToPoint(player.headPosition, 0.18, false);
		}

		if (distance < player.playerBody.headNode.size) {
			this.eat(player);
			this.isEaten = true;
		}
	}

	eat(player) {
		if (this.isEaten) {
			return;
		}
		player.giveFood();
		this.isEaten = true;
		soundManager.playSound("eat");
	}

	checkMouseClick() {}
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

const getVirus = (position) => {
	virusList.push(new Virus(position));
};

const getZone = (position) => {
	let newZone = new Zone(position);
	if (Math.random() > 0.5) {
		newZone.setIsHot(true);
	} else {
		newZone.setIsHot(false);
	}
	zoneList.push(newZone);
};

const getFood = (position) => {
	foodList.push(new Food(position));
};

function spawnAround(position, radius, spawnFunc, amount, chance) {
	const delta = lastSpawnPoint.difference(position);

	if (delta.magnitude() > radius) {
		if (Math.random() > chance) {
			return true;
		}
		const dirAngle = Math.atan2(delta.y, delta.x);

		for (let a = 0; a < Math.PI; a += 3 / amount) {
			const distance = new Vector2(
				Math.cos(dirAngle + a - Math.PI / 2),
				Math.sin(dirAngle + a - Math.PI / 2)
			).scale(radius + 5 + (Math.random() * radius) / 2);
			const spawnPoint = position.add(distance);
			spawnFunc(spawnPoint);
		}
		return true;
	}
	return false;
}

// ____________ Game Logic
function GameInit() {
	// spawns food
	for (let i = 0; i < 40; i++) {
		const randomX =
			(Math.random() - 0.5) * camera.size * camera.aspectRatio * 2;
		const randomY = (Math.random() - 0.5) * camera.size * 2 + camera.size / 4;
		let newFood = new Food(new Vector2(randomX, randomY));
		foodList.push(newFood);
	}
}

function GameUpdate() {
	player_new.update();
	camera.followTarget(player_new.headPosition);

	let didSpawn = false;

	didSpawn = spawnAround(
		player_new.headPosition,
		camera.getDiagonalLength() / 2,
		getFood,
		20,
		1.0
	);

	if (startedPhaseHeat) {
		didSpawn = spawnAround(
			player_new.headPosition,
			camera.getDiagonalLength() / 2,
			getZone,
			2,
			0.4
		);
	}

	if (startedPhaseVirus) {
		didSpawn = spawnAround(
			player_new.headPosition,
			camera.getDiagonalLength() / 2,
			getVirus,
			4,
			0.9
		);
	}

	if (didSpawn) {
		lastSpawnPoint = player_new.headPosition;
	}

	foodList.forEach((food) => {
		food.update(player_new);
	});

	if (startedPhaseHeat) {
		zoneList.forEach((zone) => {
			zone.update(player_new);
		});
	}

	if (startedPhaseVirus) {
		virusList.forEach((virus) => {
			virus.update(player_new);
		});
	}

	// if (!startedPhaseHeat) {
	// 	console.log("STARTED PHASE Heat");
	// 	startedPhaseHeat = true;
	// 	startPhaseHot();
	// }

	// if (!startedPhaseVirus) {
	// 	console.log("STARTED PHASE Virus");
	// 	startedPhaseVirus = true;
	// 	startPhaseVirus();
	// }
}

function startPhaseHot() {
	// spawns zones

	for (let i = 0; i < 2; i++) {
		const randomXoffset =
			(Math.random() - 0.5) * camera.size * camera.aspectRatio * 2;
		const randomYoffset =
			(Math.random() - 0.5) * camera.size * 2 + camera.size / 4;

		const final = player_new.headPosition.add(
			new Vector2(randomXoffset, randomYoffset)
		);

		let newZone = new Zone(final);
		if (i == 0) {
			newZone.setIsHot(true);
		} else {
			newZone.setIsHot(false);
		}
		foodList.push(newZone);
	}
}

function startPhaseVirus() {
	// spawn virus
}

function GameDraw() {
	player_new.draw(ctx);

	foodList.forEach((food) => {
		food.draw(ctx);
	});

	if (startedPhaseHeat && !startedPhaseVirus) {
		zoneList.forEach((zone) => {
			zone.draw(ctx);
		});
	}

	if (startedPhaseVirus) {
		virusList.forEach((virus) => {
			virus.draw(ctx);
		});
	}

	if (startedPhaseHeat) {
		if (!player_new.isHotResistant) {
			hotResistanceBar.draw(ctx);
			hotValueBar.draw(ctx);
		}

		if (!player_new.isColdResistant) {
			coldResistanceBar.draw(ctx);
			coldValueBar.draw(ctx);
		}
	}
	bars.forEach((bar) => {
		bar.draw(ctx);
	});
}

// _____________ Globals
let mousePosition = new Vector2(0, 0);
let isMouseDown = false;
let isMouseRightDown = false;
let camera = new Camera();
let keyboard = new KeyboardManager();

let bars = [];

let foodList = [];
let zoneList = [];
let virusList = [];

let areaExpoloredRect = new Rect();

let lastSpawnPoint = new Vector2(0, 0);

let hotValueBar = new UIBar(
	new Vector2(game_canvas.width / 2 - 100, 10),
	0,
	200,
	20,
	"red"
);

let hotResistanceBar = new UIBar(
	new Vector2(game_canvas.width / 2 - 100, 30),
	0,
	200,
	10,
	"#46f065"
);

let coldValueBar = new UIBar(
	new Vector2(game_canvas.width / 2 - 100, 50),
	0,
	200,
	20,
	"blue"
);

let coldResistanceBar = new UIBar(
	new Vector2(game_canvas.width / 2 - 100, 70),
	0,
	200,
	10,
	"#46f065"
);

let hungerBar = new UIBar(
	new Vector2(20, game_canvas.height - 20),
	0,
	40,
	400,
	"#2dcf56",
	true
);
bars.push(hungerBar);

// ____________ Events

function game_mouseButtonDown(button) {}

function game_mouseButtonUp(button) {}

game_canvas.addEventListener("mousemove", (event) => {
	mousePosition.x = event.clientX;
	mousePosition.y = event.clientY;
});

game_canvas.addEventListener("mousedown", (event) => {
	game_mouseButtonDown(event.button);
	if (event.button == 0) {
		isMouseDown = true;
	} else if (event.button == 2) {
		isMouseRightDown = true;
	}
});

game_canvas.addEventListener("mouseup", (event) => {
	game_mouseButtonUp(event.button);
	if (event.button == 0) {
		isMouseDown = false;
	} else if (event.button == 2) {
		isMouseRightDown = false;
	}
});

window.addEventListener("resize", () => {
	game_canvas.width = window.innerWidth;
	game_canvas.height = window.innerHeight;
	worldToPixelFactor = window.innerHeight;
	camera.aspectRatio = game_canvas.width / game_canvas.height;
});

document.addEventListener("keydown", (event) => {
	keyboard.__LogKeyDown(event.key);
});

document.addEventListener("keyup", (event) => {
	keyboard.__LogKeyUp(event.key);
});

// __________ Main function

function animate() {
	if (inGame) {
		const playerVel = player_new.playerBody.headNode.velocity.scale(-10); // change scale value for paralax effect
		ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);
		drawBackgroundLight(game_canvas, ctx)
		particles.forEach((particle) => {
			particle.update(
				ctx,
				game_canvas,
				playerVel
			);
		});
		GameUpdate();
		GameDraw();
	}
	requestAnimationFrame(animate);
}

GameInit();
animate();

// __________________ BACKGROUND
