// === GLOBALS ===

var filter = "inbox";
var category = "primary";

const mailAppId = "mail";
const telescopeAppId = "telescope";
const builderAppId = "builder";

const mailObj = {
	mail1: {
		sender: "Science4You",
		topic: "Become a member today Become a member today Become a member today Become a member today",
		content: "This is some very long content for testing the mail preview functionality, lets collapse this. Or truncate or whatever...",
		timestamp: "11:00",
    category: "social",
		read: false,
		favorite: false,
		important: false,
	},
	mail2: {
		sender: "noreply@science.org",
		topic: "You're fired",
		content: "Blah blah blah",
		timestamp: "13:37",
    category: "primary",
		read: false,
		favorite: true,
		important: false,
	},
	mail3: {
		sender: "TLDR Science",
		topic: "Sign up to our new letter",
		content: "Blah blah blah",
		timestamp: "14:50",
    category: "primary",
		read: false,
		favorite: false,
		important: true,
	},
	mail4: {
		sender: "Science2Go",
		topic: "Get your research paper funded",
		content: "Blah blah blah",
		timestamp: "15:22",
    category: "campaigns",
		read: true,
		favorite: false,
		important: false,
	},
};

// === FUNCTIONS ===

function changeScreen(curId, othId) {
	const cur = document.querySelector("#" + curId);
	const oth = document.querySelector("#" + othId);
	cur.style.display = "none";
	oth.style.display = "flex";
}

function clickApp(id) {
	changeScreen("os-wrapper", id + "-wrapper");
}

function truncateString(str, maxLength) {
  if (str.length <= maxLength) {
      return str;
  }
  return str.slice(0, maxLength) + '...';
}

function generateHtml(mail, id) {
  return `
  <div class="mail-preview" id="${id}">
  <div class="mp-icons-wrapper">
  <img src="${mail.favorite ? 'res/Icon_Favorites_2.svg' : 'res/Icon_Favorites.svg'}" />
  <img src="${mail.important ? 'res/Icon_StarYellow.svg' : 'res/Icon_StarWhite.svg'}" />
  </div>
  <div class="sender">${mail.sender}</div>
  <div class="mp-text-wrapper">
  <div class="topic"><p>${truncateString(mail.topic, 32) || "No Topic"}&nbsp;</p></div>
  <div class="content"><p>- ${truncateString(mail.content, 32) || "No Content"}</p></div>
  </div>
  <div class="timestamp">${mail.timestamp || "No Time"}</div>
  </div>
  `;
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
        if(mail.category == category) {
          mailHtml += generateHtml(mail, mailId);
        }
			}
		}
	}

	document
	.querySelector("#mail-inbox")
	.insertAdjacentHTML("beforeend", mailHtml);

  for (const mailId in mailObj) {
    const elem = document.querySelector('#' + mailId);
    if(elem) {
      elem.addEventListener('click', () => {
        document.querySelector('#om-topic').innerHTML = mailObj[mailId].topic;
        document.querySelector('#om-sender').innerHTML = mailObj[mailId].sender;
        document.querySelector('#om-timestamp').innerHTML = mailObj[mailId].timestamp;
        document.querySelector('#om-content').innerHTML = mailObj[mailId].content;
        changeScreen('mail-wrapper', 'opened-mail');
      });
    }
  }
}

function clearMailInbox() {
  document.querySelectorAll('div.mail-preview').forEach(div => div.remove());
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

document.querySelector("#category-primary").addEventListener("click", function () {
	category = "primary"
  document.querySelector("#category-primary").style.borderBottom = "2px solid black";
  document.querySelector("#category-campaigns").style.borderBottom = "none";
  document.querySelector("#category-social").style.borderBottom = "none";
  filterInbox();
});

document.querySelector("#category-campaigns").addEventListener("click", function () {
	category = "campaigns"
  document.querySelector("#category-campaigns").style.borderBottom = "2px solid black";
  document.querySelector("#category-primary").style.borderBottom = "none";
  document.querySelector("#category-social").style.borderBottom = "none";
	filterInbox();
});

document.querySelector("#category-social").addEventListener("click", function () {
	category = "social"
  document.querySelector("#category-campaigns").style.borderBottom = "none";
  document.querySelector("#category-primary").style.borderBottom = "none";
  document.querySelector("#category-social").style.borderBottom = "2px solid black";
	filterInbox();
});

document.querySelector("#back1").addEventListener("click", function () {
	changeScreen("opened-mail", "mail-wrapper");
});

document.querySelector("#back2").addEventListener("click", function () {
	changeScreen("mail-wrapper", "os-wrapper");
});