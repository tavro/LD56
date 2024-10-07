let inGame = false;
let inBuilder = false;
let modificationPoints = 0; // "Money"

let deathCount = 0;
let maxDeaths = 3;

const resouceUrl =
	"https://raw.githubusercontent.com/tavro/LD56/refs/heads/pages/Res/";

function truncateString(str, maxLength) {
	if (str.length <= maxLength) {
		return str;
	}
	return str.slice(0, maxLength) + "...";
}

function htmlToPlainString(html) {
	var tempElement = document.createElement("div");
	tempElement.innerHTML = html;
	return tempElement.textContent || tempElement.innerText || "";
}

function updateModificationPoints(amount) {
	modificationPoints += amount;
	document.getElementById("money-text").innerHTML = modificationPoints;
}
