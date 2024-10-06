const minNodeSize = 1;
const maxNodeSize = 5;

const builder_canvas = document.getElementById("canvas2");
const builder_context = builder_canvas.getContext("2d");

let animationFrameId;

function resizecanvas2() {
	builder_canvas.width = window.innerWidth;
	builder_canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizecanvas2);
resizecanvas2();

document.addEventListener("keydown", (event) => {
	if (event.key === "n" || event.key === "N") {
		addNode();
	}
});

builder_canvas.addEventListener("wheel", (event) => {
	const delta = event.deltaY > 0 ? -5 : 5;
	resizeNode(event.clientX, event.clientY, delta);
});

builder_canvas.addEventListener("click", (event) => {
	const mouseX = event.clientX;
	const mouseY = event.clientY;

	changeNodeColor(mouseX, mouseY);
});

function addNode() {
	if (player_new.playerBody.nodes.length < 2) return;

	const lastNode =
		player_new.playerBody.nodes[player_new.playerBody.nodes.length - 1];
	const secondLastNode =
		player_new.playerBody.nodes[player_new.playerBody.nodes.length - 2];

	const newX = (secondLastNode.position.x + lastNode.position.x) / 2;
	const newY = (secondLastNode.position.y + lastNode.position.y) / 2;

	const newNode = new Node_New(
		(secondLastNode.size + lastNode.size) / 2,
		"#000000",
		{ x: newX, y: newY }
	);

	player_new.playerBody.nodes.splice(
		player_new.playerBody.nodes.length - 1,
		0,
		newNode
	);
}

function resizeNode(mouseX, mouseY, delta) {
	let closestNode = null;
	let minDistance = Infinity;

	for (let i = 0; i < player_new.playerBody.nodes.length; i++) {
		const nodePosition = worldToScreenCoords(
			player_new.playerBody.nodes[i].position
		);
		const distance = new Vector2(mouseX, mouseY)
			.difference(nodePosition)
			.magnitude();

		if (distance < minDistance) {
			minDistance = distance;
			closestNode = player_new.playerBody.nodes[i];
		}
	}

	if (closestNode) {
		const newSize = Math.min(
			Math.max(closestNode.size + delta / 50, minNodeSize),
			maxNodeSize
		);
		closestNode.size = newSize;
	}
}

let currentNode;

function showNodeInfo(node) {
    currentNode = node;

    const nodeInfoContainer = document.getElementById("nodeInfoContainer");
    const bodyPartDropdown = document.getElementById("bodyPartDropdown");
    const colorPicker = document.getElementById("colorPicker");

    bodyPartDropdown.value = node.type || "";
    colorPicker.value = node.color;

    nodeInfoContainer.style.display = "block";
}

document.getElementById("submitNodeButton").onclick = function () {
    if (currentNode) {
        currentNode.type = document.getElementById("bodyPartDropdown").value;
        currentNode.color = document.getElementById("colorPicker").value;
    }
};

document.getElementById("closeNodeInfoButton").onclick = function () {
    document.getElementById("nodeInfoContainer").style.display = "none";
		document.getElementById("builder-overlay").style.display = "none";
};

document.getElementById("builder-overlay").addEventListener("click", function () {
    document.getElementById("nodeInfoContainer").style.display = "none";
    document.getElementById("builder-overlay").style.display = "none";
});

function changeNodeColor(mouseX, mouseY) {
	let closestNode = null;
	let minDistance = Infinity;

	for (let i = 0; i < player_new.playerBody.nodes.length; i++) {
		const nodePosition = worldToScreenCoords(
			player_new.playerBody.nodes[i].position
		);
		const distance = new Vector2(mouseX, mouseY)
			.difference(nodePosition)
			.magnitude();

		if (distance < minDistance) {
			minDistance = distance;
			closestNode = player_new.playerBody.nodes[i];
		}
	}

	const hitMargin = 50;
	if (closestNode && minDistance <= closestNode.size / 2 + hitMargin) {
		const overlay = document.getElementById("builder-overlay");
		overlay.style.display = "block";

		showNodeInfo(closestNode);
	}
}

function setupBuilder() {
	let counter = 0;
	player_new.playerBody.nodes.forEach((node) => {
		node.position = new Vector2(5 + 10 * counter, 20);
		counter++;
	});
}

document
	.getElementById("builder-overlay")
	.addEventListener("click", function () {
		document.getElementById("nodeInfoContainer").style.display = "none";
	});

// === BACKGROUND ===

builder_canvas.width = window.innerWidth;
builder_canvas.height = window.innerHeight;

const particleCount = 50;
const particles = [];

const colors = ["#BBBBBB", "#CCCCCC", "#DDDDDD", "#EEEEEE"];

function drawBackgroundLight() {
	const gradient = builder_context.createRadialGradient(
		builder_canvas.width / 2,
		builder_canvas.height / 2,
		50,
		builder_canvas.width / 2,
		builder_canvas.height / 2,
		builder_canvas.width / 2
	);

	gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
	gradient.addColorStop(0.3, "rgba(255, 255, 128, 0.8)");
	gradient.addColorStop(0.6, "rgba(255, 255, 0, 0.0125)");
	gradient.addColorStop(1, "rgba(255, 255, 0, 0)");

	builder_context.save();
	builder_context.fillStyle = gradient;
	builder_context.fillRect(0, 0, builder_canvas.width, builder_canvas.height);
	builder_context.restore();
}

class Particle {
	constructor() {
		this.reset();
	}

	getRandomColor() {
		return colors[Math.floor(Math.random() * colors.length)];
	}

	generateShape() {
		const segments = Math.floor(Math.random() * 5) + 5;
		const amplitude = Math.random() * 20 + 10;
		const waveLength = 15;
		const controlPoints = [];

		for (let i = 0; i <= segments; i++) {
			const x = i * waveLength;
			const y = Math.sin(i + Math.random() * Math.PI) * amplitude;
			controlPoints.push({ x, y });
		}

		return controlPoints;
	}

	draw() {
		builder_context.save();
		builder_context.translate(this.x, this.y);
		builder_context.rotate(this.angle);

		builder_context.lineWidth = this.thickness;
		builder_context.strokeStyle = this.color;
		builder_context.globalAlpha = this.alpha;
		builder_context.lineJoin = "round";

		builder_context.beginPath();
		builder_context.moveTo(this.shape[0].x, this.shape[0].y);
		for (let i = 1; i < this.shape.length; i++) {
			builder_context.lineTo(this.shape[i].x, this.shape[i].y);
		}
		builder_context.stroke();

		builder_context.shadowColor = this.color;
		builder_context.restore();
	}

	update() {
		this.elapsedTime += 33.33;

		if (this.elapsedTime < this.lifetime / 4) {
			this.alpha = this.elapsedTime / (this.lifetime / 4);
		} else if (this.elapsedTime < this.lifetime) {
			this.alpha =
				1 - (this.elapsedTime - this.lifetime / 4) / (this.lifetime * 0.75);
		} else {
			this.reset();
		}

		this.x += this.velocity.x;
		this.y += this.velocity.y;

		this.velocity.x += (Math.random() - 0.5) * 0.1;
		this.velocity.y += (Math.random() - 0.5) * 0.1;

		if (this.x > builder_canvas.width || this.x < 0) {
			this.velocity.x *= -1;
		}
		if (this.y > builder_canvas.height || this.y < 0) {
			this.velocity.y *= -1;
		}

		this.angle += this.angleSpeed * 0.5 + (Math.random() - 0.5) * 0.01;

		this.draw();
	}

	reset() {
		this.x = Math.random() * builder_canvas.width;
		this.y = Math.random() * builder_canvas.height;
		this.color = this.getRandomColor();
		this.alpha = 0;
		this.elapsedTime = 0;
		this.angle = Math.random() * Math.PI * 2;
		this.angleSpeed = Math.random() * 0.02 + 0.01;

		this.velocity = {
			x: (Math.random() * 0.2 - 0.1) * 0.2,
			y: (Math.random() * 0.2 - 0.1) * 0.2,
		};

		this.lifetime = Math.random() * 5000 + 5000;
		this.shape = this.generateShape();
		this.thickness = Math.random() * 5 + 5;
	}
}

function generateParticles() {
	for (let i = 0; i < particleCount; i++) {
		if (particles.length < particleCount) {
			particles.push(new Particle());
		}
	}
}

setupBuilder();

function animate2() {
	builder_context.clearRect(0, 0, builder_canvas.width, builder_canvas.height);

	drawBackgroundLight();

	particles.forEach((particle) => {
		particle.update();
	});

	player_new.draw(builder_context);
	requestAnimationFrame(animate2);
}

animate2();
generateParticles();
