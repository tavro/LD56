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

class Vector2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	difference(other) {
		return new Vector2(other.x - this.x, other.y - this.y);
	}

	add(other) {
		return new Vector2(this.x + other.x, this.y + other.y);
	}

	scale(value) {
		return new Vector2(this.x * value, this.y * value);
	}

	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	distance(other) {
		return this.difference(other).magnitude();
	}

	normalized() {
		const magnitude = this.magnitude();
		return new Vector2(
			this.scale(1 / magnitude).x,
			this.scale(1 / magnitude).y
		);
	}
}

class Rect {
	constructor(top = 0, left = 0, bottom = 0, right = 0) {
		this.right = right;
		this.left = left;
		this.top = top;
		this.bottom = bottom;
	}

	getDimensions() {
		return new Vector2(this.right - this.left, this.bottom - this.top);
	}
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
			if (key in this.keyDownCallbackList) {
				const funcs = this.keyDownCallbackList[key];
				console.log(funcs);
				funcs.forEach((func) => {
					console.log(func);
					func();
				});
			}
		}
	}

	// Called by events
	__LogKeyUp(key) {
		if (key in this.keysPressed) {
			delete this.keysPressed[key];
			if (key in this.keyUpCallbackList) {
				const funcs = this.keyUpCallbackList[key];
				console.log(funcs);
				funcs.forEach((func) => {
					console.log(func);
					func();
				});
			}
		}
	}
}
