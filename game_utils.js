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
		return this.difference(other).magnitude()
	}

	normalized() {
		const magnitude = this.magnitude();
		return new Vector2(
			this.scale(1 / magnitude).x,
			this.scale(1 / magnitude).y
		);
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
			console.log("key down: " + key);
			if (key in this.keyDownCallbackList) {
				console.log("calling func");
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
			console.log("key up: " + key);
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