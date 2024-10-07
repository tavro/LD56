// === GLOBALS ===

var filter = "inbox";
var category = "primary";

const mailAppId = "mail";
const telescopeAppId = "telescope";
const builderAppId = "builder";

// === FUNCTIONS ===

function changeScreen(curId, othId) {
	if (othId == "mail-wrapper") {
		clearMailInbox();

		category = "primary";
		document.querySelector("#category-primary").style.borderBottom =
			"2px solid black";
		document.querySelector("#category-campaigns").style.borderBottom = "none";
		document.querySelector("#category-social").style.borderBottom = "none";

		document.querySelector("#mm-inbox").style.fontWeight = "bold";
		document.querySelector("#mm-favorites").style.fontWeight = "100";
		document.querySelector("#mm-important").style.fontWeight = "100";

		generateMailPreviews(undefined, category);
	} else if (othId == "telescope-wrapper") {
		inBuilder = false;
		inGame = true;
		soundManager.stopMusic()
		soundManager.loadMusic(resouceUrl + "Music/music_microscope.mp3");
		soundManager.setMusicVolume(0.3);
		soundManager.playMusic();
	} else if (othId == "builder-wrapper") {
		inBuilder = true;
		inGame = false;
	}

	// Switches to main music if any other than microscope scene
	if (othId == "os-wrapper" && curId == "login-wrapper" || curId == "telescope-wrapper") {
		soundManager.stopMusic();
	
		soundManager.loadMusic(resouceUrl + "Music/music_main.mp3");
		soundManager.setMusicVolume(0.3);
		soundManager.playMusic();
	}

	if (curId == "telescope-wrapper") {
		inGame = false;
	}

	if (curId == "builder-wrapper") {
		inBuilder = false;
	}

	const cur = document.querySelector("#" + curId);
	const oth = document.querySelector("#" + othId);
	cur.style.display = "none";
	oth.style.display = "flex";
}

function increaseDeathCount() {
	deathCount++;
	if (deathCount >= maxDeaths) {
		deathCount = 0;
		changeScreen("telescope-wrapper", "gameover-wrapper");
	}
}

function clickApp(id) {
	changeScreen("os-wrapper", id + "-wrapper");
}

function generateHtml(mail, id) {
	return `
  <div class="mail-preview ${mail.read ? "read" : ""}" id="${id}">
  <div class="mp-icons-wrapper">
  <img src="${
		mail.favorite
			? "https://raw.githubusercontent.com/tavro/LD56/refs/heads/pages/Res/Icon_Favorites_2.svg"
			: "https://raw.githubusercontent.com/tavro/LD56/refs/heads/pages/Res/Icon_Favorites.svg"
	}" id="${id}-favorite-btn" />
  <img src="${
		mail.important
			? "https://raw.githubusercontent.com/tavro/LD56/refs/heads/pages/Res/Icon_StarYellow.svg"
			: "https://raw.githubusercontent.com/tavro/LD56/refs/heads/pages/Res/Icon_StarWhite.svg"
	}" id="${id}-important-btn" />
  </div>
  <div style="display:flex;flex-direction:row;align-items:center;width:90%;" id="${id}-info-wrapper">
  <div class="sender"><p>${mail.sender}</p></div>
  <div class="mp-text-wrapper">
  <div class="topic"><p>${
		truncateString(mail.topic, 32) || "No Topic"
	}&nbsp;</p></div>
  <div class="content"><p>- ${
		truncateString(htmlToPlainString(mail.content), 32) || "No Content"
	}</p></div>
  </div>
  <div class="timestamp">${mail.timestamp || "No Time"}</div>
  </div>
  </div>
  `;
}

function generateAssignmentHTML(tasks) {
	const container = document.createElement("div");
	const containerTitle = document.createElement("h2");
	containerTitle.textContent = "Assignments";
	container.appendChild(containerTitle);

	tasks[0].forEach((task) => {
		const taskContainer = document.createElement("div");
		taskContainer.classList.add("task-item");

		const title = document.createElement("h3");
		title.textContent = task.title;

		const amount = document.createElement("p");

		const zeroSpan = document.createElement("span");
		zeroSpan.id = task.id + "Amount";
		zeroSpan.textContent = "0";

		amount.appendChild(zeroSpan);
		amount.appendChild(document.createTextNode(` of ${task.amount}`));

		taskContainer.appendChild(title);
		taskContainer.appendChild(amount);

		container.appendChild(taskContainer);
	});

	return container.innerHTML;
}

function generateMailPreviews(key, category) {
	let mailHtml = "";

	for (const mailId in mailObj) {
		if (mailObj.hasOwnProperty(mailId)) {
			const mail = mailObj[mailId];
			if (key) {
				if (mail[key] && mail.category == category) {
					mailHtml += generateHtml(mail, mailId);
				}
			} else {
				if (mail.category == category) {
					mailHtml += generateHtml(mail, mailId);
				}
			}
		}
	}

	document
		.querySelector("#mail-inbox")
		.insertAdjacentHTML("beforeend", mailHtml);

	attachMailListeners(key, category);
}

function attachMailListeners(key, category) {
	for (const mailId in mailObj) {
		const elem = document.querySelector("#" + mailId + "-info-wrapper");
		if (elem) {
			elem.addEventListener("click", () => {
				document.querySelector("#om-topic").innerHTML = mailObj[mailId].topic;
				document.querySelector("#om-sender").innerHTML =
					mailObj[mailId].sender + " (" + mailObj[mailId].email + ")";
				document.querySelector("#om-timestamp").innerHTML =
					mailObj[mailId].timestamp;
				document.querySelector("#om-content").innerHTML =
					mailObj[mailId].content;
				changeScreen("mail-wrapper", "opened-mail");

				if (
					mailObj[mailId].important &&
					mailObj[mailId].assignments.length > 0 &&
					mailObj[mailId].email.includes("noreply")
				) {
					const button = document.querySelector("#" + mailObj[mailId].buttonId);
					if (button) {
						if (!button.listenerAttached) {
							button.addEventListener("click", function handleClick(event) {
								if (mailObj[mailId].buttonId == "task1") {
									data.foodAmount = 0; // Resets already eaten food if player has eaten before mission
								}
								if (mailObj[mailId].buttonId == "task2") {
									startedPhaseHeat = true;
								}
								if (mailObj[mailId].buttonId == "task3") {
									startedPhaseVirus = true;
								}
								activeAssignments.push(mailObj[mailId].assignments);
								document.querySelector("#assignment-container").style.display =
									"block";
								document.querySelector("#assignment-container").innerHTML =
									generateAssignmentHTML(activeAssignments);
								console.log(activeAssignments);
								event.target.removeEventListener("click", handleClick);
							});
							button.listenerAttached = true;
						}
					}
				}

				mailObj[mailId].read = true;
			});
		}

		const favoriteButton = document.querySelector(
			"#" + mailId + "-favorite-btn"
		);
		if (favoriteButton) {
			favoriteButton.addEventListener("click", () => {
				mailObj[mailId].favorite = !mailObj[mailId].favorite;
				clearMailInbox();
				generateMailPreviews(key, category);
			});
		}

		const importantButton = document.querySelector(
			"#" + mailId + "-important-btn"
		);
		if (importantButton) {
			importantButton.addEventListener("click", () => {
				mailObj[mailId].important = !mailObj[mailId].important;
				clearMailInbox();
				generateMailPreviews(key, category);
			});
		}
	}
}

function clearMailInbox() {
	document.querySelectorAll("div.mail-preview").forEach((div) => div.remove());
}

function filterInbox() {
	clearMailInbox();
	switch (filter) {
		case "important":
		case "favorite":
			generateMailPreviews(filter, category);
			break;
		case "inbox":
		default:
			generateMailPreviews(undefined, category);
			break;
	}
}

generateMailPreviews(undefined, category);

// === LISTENERS ===

document.querySelector("#" + mailAppId).addEventListener("click", function () {
	clickApp(mailAppId);
});

document
	.querySelector("#" + telescopeAppId)
	.addEventListener("click", function () {
		clickApp(telescopeAppId);
	});

document
	.querySelector("#" + builderAppId)
	.addEventListener("click", function () {
		clickApp(builderAppId);
	});

document.querySelector("#mm-inbox").addEventListener("click", function () {
	filter = "inbox";
	document.querySelector("#mm-inbox").style.fontWeight = "bold";
	document.querySelector("#mm-favorites").style.fontWeight = "100";
	document.querySelector("#mm-important").style.fontWeight = "100";
	filterInbox();
});

document.querySelector("#mm-favorites").addEventListener("click", function () {
	filter = "favorite";
	document.querySelector("#mm-favorites").style.fontWeight = "bold";
	document.querySelector("#mm-inbox").style.fontWeight = "100";
	document.querySelector("#mm-important").style.fontWeight = "100";
	filterInbox();
});

document.querySelector("#mm-important").addEventListener("click", function () {
	filter = "important";
	document.querySelector("#mm-important").style.fontWeight = "bold";
	document.querySelector("#mm-favorites").style.fontWeight = "100";
	document.querySelector("#mm-inbox").style.fontWeight = "100";
	filterInbox();
});

document
	.querySelector("#category-primary")
	.addEventListener("click", function () {
		category = "primary";
		document.querySelector("#category-primary").style.borderBottom =
			"2px solid black";
		document.querySelector("#category-campaigns").style.borderBottom = "none";
		document.querySelector("#category-social").style.borderBottom = "none";
		filterInbox();
	});

document
	.querySelector("#category-campaigns")
	.addEventListener("click", function () {
		category = "campaigns";
		document.querySelector("#category-campaigns").style.borderBottom =
			"2px solid black";
		document.querySelector("#category-primary").style.borderBottom = "none";
		document.querySelector("#category-social").style.borderBottom = "none";
		filterInbox();
	});

document
	.querySelector("#category-social")
	.addEventListener("click", function () {
		category = "social";
		document.querySelector("#category-campaigns").style.borderBottom = "none";
		document.querySelector("#category-primary").style.borderBottom = "none";
		document.querySelector("#category-social").style.borderBottom =
			"2px solid black";
		filterInbox();
	});

document.querySelector("#login-btn").addEventListener("click", function () {
	const u = document.getElementById("username").value;
	const p = document.getElementById("password").value;

	// Auto login for quicker dev. fix before deployment
	changeScreen("login-wrapper", "os-wrapper");

	//// ___ Original code
	// if (u == "username" && p == "password") {
	// 	changeScreen("login-wrapper", "os-wrapper");
	// }
});

document.querySelector("#restart").addEventListener("click", function () {
	// TODO: Reset everything
	changeScreen("gameover-wrapper", "os-wrapper");
});

document.querySelector("#back1").addEventListener("click", function () {
	changeScreen("opened-mail", "mail-wrapper");
});

document.querySelector("#back2").addEventListener("click", function () {
	changeScreen("mail-wrapper", "os-wrapper");
});

document.querySelector("#back3").addEventListener("click", function () {
	changeScreen("telescope-wrapper", "os-wrapper");
});

document.querySelector("#back4").addEventListener("click", function () {
	changeScreen("builder-wrapper", "os-wrapper");
});

// === APPS ===
const MIN_DISTANCE = 20;
let draggedApp = null;
document.querySelectorAll(".app").forEach((app) => {
	app.addEventListener("dragstart", function (event) {
		draggedApp = this;
	});
});

document
	.getElementById("desktop-wrapper")
	.addEventListener("dragover", function (event) {
		event.preventDefault();
	});

document
	.getElementById("desktop-wrapper")
	.addEventListener("drop", function (event) {
		event.preventDefault();
		const x = event.clientX;
		const y = event.clientY;

		if (draggedApp) {
			const rect = draggedApp.getBoundingClientRect();
			draggedApp.style.position = "absolute";
			draggedApp.style.left = `${x - rect.width / 2}px`;
			draggedApp.style.top = `${y - rect.height / 2}px`;
			adjustPosition(draggedApp);
		}
	});

function adjustPosition(app) {
	const rect1 = app.getBoundingClientRect();
	document.querySelectorAll(".app").forEach((otherApp) => {
		if (otherApp !== app) {
			const rect2 = otherApp.getBoundingClientRect();
			if (isColliding(rect1, rect2)) {
				let newTop = parseFloat(app.style.top) + MIN_DISTANCE + rect1.height;
				app.style.top = `${newTop}px`;
				adjustPosition(app);
			}
		}
	});
}

function isColliding(rect1, rect2) {
	return !(
		rect1.right < rect2.left ||
		rect1.left > rect2.right ||
		rect1.bottom < rect2.top ||
		rect1.top > rect2.bottom
	);
}

function initializePositions() {
	document.querySelectorAll(".app").forEach((app, index) => {
		app.style.position = "absolute";
		app.style.left = `${index * 150}px`;
		app.style.top = "20px";
	});
}

initializePositions();

function closeOverlay() {
	document.getElementById("overlay").style.display = "none";
}
