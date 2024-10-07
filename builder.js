const minNodeSize = 1;
const maxNodeSize = 5;
const levelCost = 50;

const builder_canvas = document.getElementById("canvas2");
const builder_context = builder_canvas.getContext("2d");

let animationFrameId;

function resizecanvas2() {
	builder_canvas.width = window.innerWidth;
	builder_canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizecanvas2);
resizecanvas2();

/*
document.addEventListener("keydown", (event) => {
	if (event.key === "n" || event.key === "N") {
		addNode();
	}
});
*/

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
		new Vector2(newX, newY)
	);

	player_new.playerBody.nodes.splice(
		player_new.playerBody.nodes.length - 1,
		0,
		newNode
	);

	newNode.parent = secondLastNode;
	lastNode.parent = newNode;
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

		if (newSize > closestNode.size) {
			if (modificationPoints > 0) {
				closestNode.size = newSize;
				updateModificationPoints(-1);
			}
		} else if (newSize < closestNode.size) {
			closestNode.size = newSize;
			updateModificationPoints(1);
		}
	}
}

let currentNode;

function showNodeInfo(node) {
	currentNode = node;

	const nodeLevelInput = document.getElementById("nodeLevelInput");
	const nodeInfoContainer = document.getElementById("nodeInfoContainer");
	const bodyPartDropdown = document.getElementById("bodyPartDropdown");
	const colorPicker = document.getElementById("colorPicker");

	nodeLevelInput.max = node.maxLevel;
	nodeLevelInput.value = node.level || 1;
	bodyPartDropdown.value = node.type || "";
	colorPicker.value = node.color;

	nodeInfoContainer.style.display = "block";
}

document.getElementById("closeNodeInfoButton").onclick = function () {
	document.getElementById("nodeInfoContainer").style.display = "none";
	document.getElementById("builder-overlay").style.display = "none";
};

document
	.getElementById("builder-overlay")
	.addEventListener("click", function () {
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

const particleCount = 100;
const particleSizeMultiplier = 0.5;
const particles = [];

const colors = ["#BBBBBB", "#CCCCCC", "#DDDDDD", "#EEEEEE"];

function drawBackgroundLight(canvas, context) {
	const gradient = context.createRadialGradient(
		canvas.width / 2,
		canvas.height / 2,
		50,
		canvas.width / 2,
		canvas.height / 2,
		canvas.width / 2
	);

	gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
	gradient.addColorStop(0.3, "rgba(255, 255, 128, 0.8)");
	gradient.addColorStop(0.6, "rgba(255, 255, 0, 0.0125)");
	gradient.addColorStop(1, "rgba(255, 255, 0, 0)");

	context.save();
	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.restore();
}

class Particle {
	constructor(canvas) {
		this.reset(canvas);
	}

	getRandomColor() {
		return colors[Math.floor(Math.random() * colors.length)];
	}

	generateShape() {
		const segments = (Math.floor(Math.random() * 5) + 5) * particleSizeMultiplier;
		const amplitude = (Math.random() * 20 + 10) * particleSizeMultiplier;
		const waveLength = 15 * particleSizeMultiplier;
		const controlPoints = [];

		for (let i = 0; i <= segments; i++) {
			const x = i * waveLength;
			const y = Math.sin(i + Math.random() * Math.PI) * amplitude;
			controlPoints.push({ x, y });
		}

		return controlPoints;
	}

	draw(context) {
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.angle);

		context.lineWidth = this.thickness;
		context.strokeStyle = this.color;
		context.globalAlpha = this.alpha;
		context.lineJoin = "round";

		context.beginPath();
		context.moveTo(this.shape[0].x, this.shape[0].y);
		for (let i = 1; i < this.shape.length; i++) {
			context.lineTo(this.shape[i].x, this.shape[i].y);
		}
		context.stroke();

		context.shadowColor = this.color;
		context.restore();
	}

	update(context, canvas, windVelocity) {
		this.elapsedTime += 33.33;

		if (this.elapsedTime < this.lifetime / 4) {
			this.alpha = this.elapsedTime / (this.lifetime / 4);
		} else if (this.elapsedTime < this.lifetime) {
			this.alpha =
				1 - (this.elapsedTime - this.lifetime / 4) / (this.lifetime * 0.75);
		} else {
			this.reset(canvas);
		}

		this.x += this.velocity.x;
		this.y += this.velocity.y;
		
		this.velocity.x = windVelocity.x;
		this.velocity.y = windVelocity.y;

		this.velocity.x += (Math.random() - 0.5) * 0.1;
		this.velocity.y += (Math.random() - 0.5) * 0.1;

		const margin = 30

		// Glaze code, for wrapping
		if (this.x > canvas.width + margin) {
			this.x = -margin;
		}
		else if (this.x < -margin) {
			this.x = canvas.width + margin
		}
		
		if (this.y > canvas.height + margin) {
			this.y = -margin;
		}
		else if (this.y < -margin) {
			this.y = canvas.height + margin
		}

		this.angle += this.angleSpeed * 0.5 + (Math.random() - 0.5) * 0.01;

		this.draw(context);
	}

	reset(canvas) {
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
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
		this.thickness = (Math.random() * 5 + 5) * particleSizeMultiplier;
	}
}

function generateParticles() {
	for (let i = 0; i < particleCount; i++) {
		if (particles.length < particleCount) {
			particles.push(new Particle(builder_canvas));
		}
	}
}

setupBuilder();

function animate2() {
	if (inBuilder) {
		builder_context.clearRect(0, 0, builder_canvas.width, builder_canvas.height);

		drawBackgroundLight(builder_canvas, builder_context);

		particles.forEach((particle) => {
			particle.update(builder_context, builder_canvas, new Vector2(0, 0));
		});

		player_new.draw(builder_context);
		player_new.updateBodyNodes();
		camera.followTarget(player_new.headPosition);

		updatePlusButtonPosition();
	}
	requestAnimationFrame(animate2);
}

animate2();
generateParticles();

document.getElementById("submitNodeButton").onclick = function () {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    if (currentNode) {
        const nodeLevelInput = document.getElementById("nodeLevelInput");
        const newLevel = Math.min(
            Math.max(parseInt(nodeLevelInput.value), 1),
            currentNode.maxLevel
        );

        const currentLevel = currentNode.level || 1;
        const levelDifference = newLevel - currentLevel;
        const cost = Math.abs(levelDifference) * levelCost;

        if (levelDifference > 0) {
            if (modificationPoints >= cost) {
                currentNode.level = newLevel;
                updateModificationPoints(-cost);
            } else {
                errorMessage.textContent = "Not enough modification points to increase level.";
                errorMessage.style.display = "block";
                return;
            }
        } else if (levelDifference < 0) {
            currentNode.level = newLevel;
            updateModificationPoints(cost);
        } else {
            currentNode.level = newLevel;
        }

        const newType = document.getElementById("bodyPartDropdown").value;
        if (!currentNode.type && newType) {
            if (modificationPoints >= 50) {
                currentNode.type = newType;
								player_new.reCountAttachments() // Gives info to player over how many fins and arms there is
                updateModificationPoints(-50);
            } else {
                errorMessage.textContent = "Not enough modification points to select a node type.";
                errorMessage.style.display = "block";
                return;
            }
        } else if (currentNode.type !== newType) {
            currentNode.type = newType;
        }

        currentNode.color = document.getElementById("colorPicker").value;
		document.getElementById("nodeInfoContainer").style.display = "none";
		document.getElementById("builder-overlay").style.display = "none";
    }
};

function updatePlusButtonPosition() {
    const nodes = player_new.playerBody.nodes;
    if (nodes.length < 2) {
        document.getElementById("plus-button-container").style.display = "none";
        return;
    }

    const lastNode = nodes[nodes.length - 1];
    const secondLastNode = nodes[nodes.length - 2];

    const middleX = (lastNode.position.x + secondLastNode.position.x) / 2;
    const middleY = (lastNode.position.y + secondLastNode.position.y) / 2;

    const screenPos = worldToScreenCoords(new Vector2(middleX, middleY));

    const plusButtonContainer = document.getElementById("plus-button-container");

    plusButtonContainer.style.left = `${screenPos.x - 15}px`;
    plusButtonContainer.style.top = `${screenPos.y - 100}px`;
    plusButtonContainer.style.display = "block";

    plusButtonContainer.style.pointerEvents = 'none';

    plusButton.style.pointerEvents = 'auto';
}

const plusButton = document.getElementById("plus-button");
const plusButtonContainer = document.getElementById("plus-button-container");

plusButton.addEventListener("click", () => {
    addNode();
});
