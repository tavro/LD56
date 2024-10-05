// === GLOBALS ===

const mailAppId = "mail";
const telescopeAppId = "telescope";
const builderAppId = "builder";

const mailObj = {
  mail1: {
    sender: "Science4You",
    topic: "Become a member today",
    content: "Blah blah blah",
    timestamp: "11:00",
    read: false,
    favorite: false,
    important: false
  },
  mail2: {
    sender: "noreply@science.org",
    topic: "You're fired",
    content: "Blah blah blah",
    timestamp: "13:37",
    read: false,
    favorite: true,
    important: false
  },
  mail3: {
    sender: "TLDR Science",
    topic: "Sign up to our new letter",
    content: "Blah blah blah",
    timestamp: "14:50",
    read: false,
    favorite: false,
    important: true
  },
  mail4: {
    sender: "Science2Go",
    topic: "Get your research paper funded",
    content: "Blah blah blah",
    timestamp: "15:22",
    read: true,
    favorite: false,
    important: false
  },
}

// === FUNCTIONS ===

function changeScreen(curId, othId) {
  const cur = document.querySelector('#' + curId);
  const oth = document.querySelector('#' + othId);
  cur.style.display = "none";
  oth.style.display = "flex";
}

function clickApp(id) {
  changeScreen("os-wrapper", id + "-wrapper");
}

function generateMailPreviews(mailObj) {
  let mailHtml = '';
  
  for (const mailId in mailObj) {
    if (mailObj.hasOwnProperty(mailId)) {
      const mail = mailObj[mailId];
      mailHtml += `
        <div class="mail-preview">
          <div class="mp-icons-wrapper">
            <img src="https://picsum.photos/16/16" />
            <img src="https://picsum.photos/16/16" />
          </div>
          <div class="sender">${mail.sender}</div>
          <div class="mp-text-wrapper">
            <div class="topic"><p>${mail.topic || 'No Topic'}&nbsp;</p></div>
            <div class="content"><p>- ${mail.content || 'No Content'}</p></div>
          </div>
          <div class="timestamp">${mail.timestamp || 'No Time'}</div>
        </div>
      `;
    }
  }
  
  return mailHtml;
}

const htmlOutput = generateMailPreviews(mailObj);
document.querySelector('#mail-inbox').append(htmlOutput);

// === LISTENERS ===

document.querySelector('#' + mailAppId).addEventListener('click', function() {
  clickApp(mailAppId);
});

document.querySelector('#' + telescopeAppId).addEventListener('click', function() {
  clickApp(telescopeAppId);
});

document.querySelector('#' + builderAppId).addEventListener('click', function() {
  clickApp(builderAppId);
});

