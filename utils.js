let inGame = false;

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
