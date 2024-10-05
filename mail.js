var currentKey = 2;
const mailQueue = [
	{
		email: "noreply@tinylabs.org",
		sender: "Tiny Labs",
		topic: "To war!",
		content: `<div>
    <h2>Hello Mr. Doctor,</h2>
    <p>GREAT JOB! We at Tiny Labs are super impressed by your work!</p>
    <p>Now, in the real world, this organism might encounter other organisms and it'll need to defend itself.</p>
    <p>To prove it's strength, we have sent you some other organisms for it to train against.</p>
		<p>You are <i>killing</i> it! (no pun intended hehe)</p>
    <p>Best regards,</p>
    <p><strong>Milo</strong><br>CEO of Tiny Labs</p>
    </div>`,
		timestamp: "13:37",
		category: "primary",
		read: false,
		favorite: false,
		important: true,
    assignments: [
      {
        title: "Kill 5 other organisms",
        amount: 5,
        condition: function(killAmount) { return killAmount >= 5; },
        completed: false
      },
    ]
	},
	{
		email: "noreply@tinylabs.org",
		sender: "Tiny Labs",
		topic: "Immunity",
		content: `<div>
    <h2>Hello Mr. Doctor,</h2>
    <p>Great job on the previous assignment!</p>
    <p>Now, the organism might encounter dangers such as <strong>viruses</strong> and <strong>radioactivity</strong>. We simply want it to build up an immunity to them.</p>
    <p>Go infect it, but be careful as not to kill it!</p>
		<p>Awesome work so far!</p>
    <p>Best regards,</p>
    <p><strong>Milo</strong><br>CEO of Tiny Labs</p>
    </div>`,
		timestamp: "13:37",
		category: "primary",
		read: false,
		favorite: false,
		important: true,
		assignments: [
			{
				title: "Gain virus immunity",
				amount: 1,
				condition: function (virusAmount) {
					return virusAmount >= 1;
				},
				completed: false,
			},
			{
				title: "Gain radioactivity immunity",
				amount: 1,
				condition: function (radioactivityAmount) {
					return radioactivityAmount >= 1;
				},
				completed: false,
			},
		],
	},
  {
		email: "noreply@tinylabs.org",
		sender: "Tiny Labs",
		topic: "Next steps for planting your organism",
		content: `<div>
    <h2>Hello Mr. Doctor,</h2>
    <p>Great job on completing your first assignments!</p>
    <p>As we move forward, we will be planting the organism in both very warm and cold locations. It is essential for the organism to be resistant to both temperature extremes. Please place your organism in both warm and cold environments until it becomes fully resistant.</p>
    <p>Thank you for your continued efforts!</p>
    <p>Best regards,</p>
    <p><strong>Milo</strong><br>CEO of Tiny Labs</p>
    </div>`,
		timestamp: "13:37",
		category: "primary",
		read: false,
		favorite: false,
		important: true,
    assignments: [
      {
        title: "Become warmth resistant",
        amount: 1,
        condition: function(warmAmount) { return warmAmount >= 1; },
        completed: false
      },
      {
        title: "Become cold resistant",
        amount: 1,
        condition: function(coldAmount) { return coldAmount >= 1; },
        completed: false
      },
    ]
	}
];

const mailObj = {
	mail1: {
		email: "noreply@tinylabs.org",
		sender: "Tiny Labs",
		topic: "An exiting new start!",
		content: `<div>
    <h2>Hello Mr. Doctor,</h2>
    <p>Thank you for participating in this exciting new venture into the future of <strong>bio-chemistry</strong>!</p>
    <p>As we have already discussed over the phone, you can now begin feeding the organism. The required materials for developing the organism have been sent and should have already arrived. Here are the next steps:</p>
    <ol>
        <li><strong>Use the DNA Modificator:</strong> Place the given part onto the organism using your DNA Modificator device.</li>
        <li><strong>Test the organism’s functionality:</strong> To confirm the process works, the organism should now be able to consume food. Test the organism’s ability to consume food using the microscope.</li>
    </ol>
    <p>Best regards,</p>
    <p><strong>Milo</strong><br>CEO of Tiny Labs</p>
    </div>
    `,
		timestamp: "13:37",
		category: "primary",
		read: false,
		favorite: false,
		important: true,
		assignments: [
			/*{
        title: "Attach Mouth",
        amount: 1,
        condition: function(mouthAmount) { return mouthAmount >= 1; },
        completed: false
      },*/
			{
				title: "Eat food",
				amount: 10,
				condition: function (foodAmount) {
					return foodAmount >= 10;
				},
				completed: false,
			},
		],
	},
};

function handleMail() {
	mailObj["mail" + currentKey] = mailQueue.pop();
	currentKey++;
}

function checkAwaitingMail() {
	const interval = setInterval(() => {
		if (awaitingMail) {
			handleMail();
			const overlay = document.getElementById("overlay");

			overlay.style.display = "block";
			overlay.style.opacity = "1";

			setTimeout(function () {
				overlay.style.opacity = "0";
				setTimeout(function () {
					overlay.style.display = "none";
				}, 500);
			}, 3000);
			awaitingMail = false;
			clearInterval(interval);
		}
	}, 1000);
}
checkAwaitingMail();
