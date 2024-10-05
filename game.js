const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ______________ Global Functions
function mousePositionToWorldCoords() {
	result = new Vector2(0, 0);
	result.x = camera.position.x + mousePosition.x;
	result.y = camera.position.y + mousePosition.y;
	return result;
}

class KeyboardManager {
	keysPressed = {};

	keyDownCallbackList = {};
	keyUpCallbackList = {};

	IsKeyHeld(key) {
		return key in this.keysPressed;
	}

	// Use for subscribing when key press is down
	__AddKeyDownListener(key, func) {
		if (key in this.keyDownCallbackList) {
			let old_list = this.keyDownCallbackList[key];
			old_list += func;
			this.keyDownCallbackList[key] = old_list;
		} else {
			this.keyDownCallbackList[key] = [];
			this.keyDownCallbackList[key].push(func);
		}
	}

	// Use for subscribing when key press is up
	__AddKeyUpListener(key, func) {
		if (key in this.keyUpCallbackList) {
			let old_list = this.keyUpCallbackList[key];
			old_list += func;
			this.keyUpCallbackList[key] = old_list;
		} else {
			this.keyUpCallbackList[key] = [];
			this.keyUpCallbackList[key].push(func);
		}
	}

	// Called by events
	__LogKeyDown(key) {
		if (key in this.keysPressed === false) {
			this.keysPressed[key] = true;
			console.log("key down: " + key);
			if (key in this.keyDownCallbackList) {
				console.log("calling func");
				const funcs = this.keyDownCallbackList[key];
				console.log(funcs)
				funcs.forEach((func => 
				{
					console.log(func)
					func();
				}))
			}
		}
	}

	// Called by events
	__LogKeyUp(key) {
		if (key in this.keysPressed) {
			delete this.keysPressed[key];
			console.log("key up: " + key);
			if (key in this.keyUpCallbackList) {
				const funcs = this.keyUpCallbackList[key];
				console.log(funcs)
				funcs.forEach((func => 
				{
					console.log(func)
					func();
				}))
			}
		}
	}
}

// ______________ Classes
class Vector2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	add(other) {
		return new Vector2(this.x + other.x, this.y + other.y)
	}

	scale(value) {
		return new Vector2(this.x * value, this.y * value)
	}

	getMagnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	normalized() {
		const magnitude = this.getMagnitude()
		return new Vector2(this.scale(1/magnitude).x, this.scale(1/magnitude).y)
	}
}

class Camera {
	constructor() {
		this.position = new Vector2(0, 0);
		this.size = 10;
		console.log("Created Camera");
	}
}

class Player {
	constructor() {
		this.radius = 50;
		this.color = "blue";

		this.max_speed = 5;
		this.turn_speed = 0.5;
		
		this.force = 100
		this.velocity = new Vector2(0, 0);
		this.position = new Vector2(500, 200);
		this.acceleration = new Vector2(0, 0);
		this.drag = 0.9
	}

	Update() {
		if (isMouseDown) {
			this.MoveToPoint();
		}

		this.velocity = this.velocity.add(this.acceleration).scale(this.drag)
		this.position = this.position.add(this.velocity)

		this.acceleration = new Vector2(0, 0)
	}

	MoveToPoint() {
		if (isMouseDown) {
			const world_coords = mousePositionToWorldCoords();

			const delta_x = world_coords.x - this.position.x
			const delta_y = world_coords.y - this.position.y
			console.log("delta x: " + delta_x)
			const distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y)

			this.acceleration = new Vector2(delta_x, delta_y).normalized()
		}
	}

	Draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

		ctx.beginPath();
		ctx.arc(
			this.position.x - camera.position.x,
			this.position.y - camera.position.y,
			this.radius,
			0,
			Math.PI * 2,
			false
		);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}
}

// ____________ Game Logic
function GameInit() {
	console.log("Organism Game: Initialized");
}

function GameUpdate() {
	player.Update();

	// if (keyboard.IsKeyHeld("d")) {
	// 	camera.position.x += 20
	// }
	// if (keyboard.IsKeyHeld("a")) {
	// 	camera.position.x -= 20
	// }
	// if (keyboard.IsKeyHeld("w")) {
	// 	camera.position.y -= 20
	// }
	// if (keyboard.IsKeyHeld("s")) {
	// 	camera.position.y += 20
	// }

}

function GameDraw() {
	player.Draw();
}

// _____________ Globals
let mousePosition = new Vector2(0, 0);
let player = new Player();
let isMouseDown = false;
let camera = new Camera();
let keyboard = new KeyboardManager();

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
