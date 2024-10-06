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
			const nodePosition = worldToScreenCoords(player_new.playerBody.nodes[i].position);
			const distance = new Vector2(mouseX, mouseY).difference(nodePosition).magnitude();

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

function changeNodeColor(mouseX, mouseY) {
	let closestNode = null;
	let minDistance = Infinity;

	for (let i = 0; i < player_new.playerBody.nodes.length; i++) {
			const nodePosition = worldToScreenCoords(player_new.playerBody.nodes[i].position);
			const distance = new Vector2(mouseX, mouseY).difference(nodePosition).magnitude();

			if (distance < minDistance) {
					minDistance = distance;
					closestNode = player_new.playerBody.nodes[i];
			}
	}

	if (closestNode) {
			console.log("clicked on: " + closestNode.color);
			const newColor = prompt("Enter a color (name or hex code):", closestNode.color);
			if (newColor) {
					closestNode.color = newColor;
			}
			if (player_new.playerBody.nodes.indexOf(closestNode) !== 0 &&
					player_new.playerBody.nodes.indexOf(closestNode) !== player_new.playerBody.nodes.length - 1) {
					const typeChoice = prompt("Choose between 'fins' or 'arms':", closestNode.type);
					if (typeChoice === "fins" || typeChoice === "arms") {
							closestNode.type = typeChoice;
							alert(`You have selected ${typeChoice} for the node.`);
					}
			}
	}
}

function setupBuilder() {
	let counter = 0;
	player_new.playerBody.nodes.forEach((node) => {
		node.position = new Vector2(5 + 10 * counter, 20);
		counter++;
	});
}

setupBuilder();

function animate2() {
	builder_context.clearRect(0, 0, builder_canvas.width, builder_canvas.height);
	player_new.draw(builder_context);
	requestAnimationFrame(animate2);
}

animate2();