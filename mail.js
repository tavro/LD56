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
        id: "kill",
				condition: function (killAmount) {
					return killAmount >= 5;
				},
				completed: false,
			},
		],
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
        id: "virus",
				condition: function (virusAmount) {
					return virusAmount >= 1;
				},
				completed: false,
			},
			{
				title: "Gain radioactivity immunity",
				amount: 1,
        id: "radioactivity",
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
        id: "warmth",
				condition: function (warmAmount) {
					return warmAmount >= 1;
				},
				completed: false,
			},
			{
				title: "Become cold resistant",
				amount: 1,
        id: "cold",
				condition: function (coldAmount) {
					return coldAmount >= 1;
				},
				completed: false,
			},
		],
	},
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
        id: "mouth",
        condition: function(mouthAmount) { return mouthAmount >= 1; },
        completed: false
      },*/
			{
				title: "Eat food",
				amount: 10,
        id: "food",
				condition: function (foodAmount) {
					return foodAmount >= 10;
				},
				completed: false,
			},
		],
	},
};

function handleMail() {
  const obj = mailQueue.pop();
	mailObj["mail" + currentKey] = obj;
	currentKey++;
	const overlay = document.getElementById("overlay");

  document.getElementById("overlay-sender").innerHTML = obj.sender + " (" + obj.email + ")"; 
  document.getElementById("overlay-subject").innerHTML = obj.topic;

	document.getElementById("primary-summary").innerHTML = truncateString(obj.sender, 16) + " - " + truncateString(obj.topic, 16);

	overlay.style.display = "block";
	overlay.style.opacity = "1";

	soundManager.playSound("email");

	setTimeout(function () {
		overlay.style.opacity = "0";
		setTimeout(function () {
			overlay.style.display = "none";
		}, 5000);
	}, 30000);
}

function checkAwaitingMail() {
	const interval = setInterval(() => {
		if (awaitingMail) {
			handleMail();
			awaitingMail = false;
			clearInterval(interval);
		}
	}, 1000);
}
checkAwaitingMail();

const campaignMails = [
	{
		email: "noreply@wackycampaigns.com",
		sender: "Wacky Campaigns Inc.",
		topic: "To War! (But Not Really)",
		content: `<div>
      <h2>Hey You!</h2>
      <p>Congratulations! You've been drafted into the world's silliest war! 🎉</p>
      <p>Get ready to battle it out with pillow fights and whipped cream catapults!</p>
      <p>We’ve sent you a box of rubber chickens for training! Let’s show them who’s boss!</p>
      <p>You are <i>crushing</i> it! (And probably a few tomatoes too!)</p>
      <p>High fives,</p>
      <p><strong>Chuckles McFun</strong><br>Chief Fun Officer at Wacky Campaigns</p>
      </div>`,
		timestamp: "13:37",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@sillysolutions.com",
		sender: "Silly Solutions Ltd.",
		topic: "Unleash Your Inner Unicorn!",
		content: `<div>
      <h2>Dear Rainbow Rider,</h2>
      <p>Ever wanted to be a unicorn? 🦄 Well, now you can! Join us in our glittery campaign!</p>
      <p>Get your sparkles ready and let’s parade through town in the most flamboyant way possible!</p>
      <p>Glitter bombs are on the way! Prepare for maximum sparkle!</p>
      <p>Stay fabulous,</p>
      <p><strong>Sparkle Puff</strong><br>Unicorn Ambassador at Silly Solutions</p>
      </div>`,
		timestamp: "14:20",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@wackycampaigns.com",
		sender: "Wacky Campaigns Inc.",
		topic: "Join the Sandwich Revolution!",
		content: `<div>
      <h2>Attention Foodie!</h2>
      <p>We’re launching a sandwich revolution! 🥪</p>
      <p>Grab your ingredients and make the weirdest sandwich you can think of!</p>
      <p>Mayonnaise and gummy bears? Why not! We’re judging the best one!</p>
      <p>Let’s spread some joy (and condiments) together!</p>
      <p>Eat your heart out,</p>
      <p><strong>Chef Goofy</strong><br>Head of Culinary Mischief at Wacky Campaigns</p>
      </div>`,
		timestamp: "09:15",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@sillysolutions.com",
		sender: "Silly Solutions Ltd.",
		topic: "Get Ready for World’s Silliest Dance-Off!",
		content: `<div>
      <h2>Hey Dance Machine!</h2>
      <p>It’s time to shake your groove thing! 💃🕺</p>
      <p>Join our campaign for the World’s Silliest Dance-Off!</p>
      <p>We’ve got funky music and inflatable alligators waiting for you!</p>
      <p>Show off those moves and let’s see who can do the best worm!</p>
      <p>Keep it groovy,</p>
      <p><strong>Boogie Bob</strong><br>Chief Dance Officer at Silly Solutions</p>
      </div>`,
		timestamp: "11:45",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@wackycampaigns.com",
		sender: "Wacky Campaigns Inc.",
		topic: "Whacky Hat Day is Here!",
		content: `<div>
      <h2>Dear Hat Enthusiast,</h2>
      <p>Put on your silliest hat! 🎩🤠🧢</p>
      <p>It’s Whacky Hat Day and we want to see your wildest creations!</p>
      <p>Extra points for hats made of food or things you found under the couch!</p>
      <p>Let’s make the world a sillier place, one hat at a time!</p>
      <p>Hat-tastically yours,</p>
      <p><strong>Wendy Wacky</strong><br>Hat Specialist at Wacky Campaigns</p>
      </div>`,
		timestamp: "10:05",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@sillysolutions.com",
		sender: "Silly Solutions Ltd.",
		topic: "World’s Funniest Joke Contest!",
		content: `<div>
      <h2>Hello Laugh Master!</h2>
      <p>Do you have what it takes to make the world laugh? 😂</p>
      <p>Enter our World’s Funniest Joke Contest!</p>
      <p>The winner gets a lifetime supply of whoopee cushions!</p>
      <p>Let’s hear your best jokes! Don’t hold back!</p>
      <p>With giggles,</p>
      <p><strong>Giggle Guru</strong><br>Chief Laugh Officer at Silly Solutions</p>
      </div>`,
		timestamp: "15:30",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@wackycampaigns.com",
		sender: "Wacky Campaigns Inc.",
		topic: "The Great Bubble Wrap Challenge!",
		content: `<div>
      <h2>Hey Bubble Popper!</h2>
      <p>It’s time to unleash your inner child! Pop some bubble wrap with us!</p>
      <p>Join our Great Bubble Wrap Challenge and let’s see who can pop the most bubbles!</p>
      <p>We’ll provide the bubble wrap; you just bring the enthusiasm!</p>
      <p>Let’s get popping!</p>
      <p>Cheers,</p>
      <p><strong>Popper Pete</strong><br>Chief Bubble Officer at Wacky Campaigns</p>
      </div>`,
		timestamp: "08:55",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@sillysolutions.com",
		sender: "Silly Solutions Ltd.",
		topic: "Pajama Party Extravaganza!",
		content: `<div>
      <h2>Dear Cozy Couch Potato,</h2>
      <p>Get your fluffiest pajamas ready! It’s time for a Pajama Party Extravaganza! 💤</p>
      <p>Join us for a night of movie marathons, popcorn fights, and pillow forts!</p>
      <p>Best pajama wins a giant stuffed animal!</p>
      <p>Snuggle up,</p>
      <p><strong>Sleepy Sam</strong><br>Pajama Party Planner at Silly Solutions</p>
      </div>`,
		timestamp: "12:30",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@wackycampaigns.com",
		sender: "Wacky Campaigns Inc.",
		topic: "Fun with Food: The Epic Food Sculpture Contest!",
		content: `<div>
      <h2>Hello Culinary Artist!</h2>
      <p>Do you have the vision to turn food into art? 🍕🍉</p>
      <p>Join our Epic Food Sculpture Contest! Create the wackiest food sculpture you can think of!</p>
      <p>Potato penguins? Cheese castles? Let your imagination run wild!</p>
      <p>May the best food win!</p>
      <p>Bon appétit,</p>
      <p><strong>Artistic Annie</strong><br>Head of Food Fun at Wacky Campaigns</p>
      </div>`,
		timestamp: "14:50",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@wackycampaigns.com",
		sender: "Wacky Campaigns Inc.",
		topic: "To War! (But Not Really)",
		content: `<div>
      <h2>Hey You!</h2>
      <p>Congratulations! You've been drafted into the world's silliest war! 🎉</p>
      <p>Get ready to battle it out with pillow fights and whipped cream catapults!</p>
      <p>We’ve sent you a box of rubber chickens for training! Let’s show them who’s boss!</p>
      <p>You are <i>crushing</i> it! (And probably a few tomatoes too!)</p>
      <p>High fives,</p>
      <p><strong>Chuckles McFun</strong><br>Chief Fun Officer at Wacky Campaigns</p>
      </div>`,
		timestamp: "13:37",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@sillysolutions.com",
		sender: "Silly Solutions Ltd.",
		topic: "Unleash Your Inner Unicorn!",
		content: `<div>
      <h2>Dear Rainbow Rider,</h2>
      <p>Ever wanted to be a unicorn? 🦄 Well, now you can! Join us in our glittery campaign!</p>
      <p>Get your sparkles ready and let’s parade through town in the most flamboyant way possible!</p>
      <p>Glitter bombs are on the way! Prepare for maximum sparkle!</p>
      <p>Stay fabulous,</p>
      <p><strong>Sparkle Puff</strong><br>Unicorn Ambassador at Silly Solutions</p>
      </div>`,
		timestamp: "14:20",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@foodiefun.com",
		sender: "Foodie Fun Factory",
		topic: "Mystical Muffin Bake-Off!",
		content: `<div>
      <h2>Hello, Baking Wizard!</h2>
      <p>Are you ready to conjure up some magical muffins? 🧙‍♂️🧁</p>
      <p>Join our Mystical Muffin Bake-Off and let your creativity soar!</p>
      <p>Cast your best baking spells and surprise us with enchanted flavors!</p>
      <p>May the best muffin win a lifetime supply of sprinkles!</p>
      <p>Happy baking,</p>
      <p><strong>Chef Enchantress</strong><br>Head Baker at Foodie Fun Factory</p>
      </div>`,
		timestamp: "10:30",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@zanyzoo.com",
		sender: "Zany Zoo Adventures",
		topic: "Wild Costume Party at the Zoo!",
		content: `<div>
      <h2>Dear Animal Lover!</h2>
      <p>Join us for the Wildest Costume Party at Zany Zoo! 🦁🎉</p>
      <p>Dress up as your favorite animal and join the fun!</p>
      <p>There will be animal-themed games, prizes, and a parade!</p>
      <p>Let’s roar with laughter together!</p>
      <p>See you there,</p>
      <p><strong>Wanda Wild</strong><br>Party Planner at Zany Zoo Adventures</p>
      </div>`,
		timestamp: "15:00",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@funkyfashion.com",
		sender: "Funky Fashion House",
		topic: "Tie-Dye Tuesday: Get Creative!",
		content: `<div>
      <h2>Hey Trendsetter!</h2>
      <p>It’s Tie-Dye Tuesday! 🌈✌️</p>
      <p>Join us for a colorful day of tie-dye madness!</p>
      <p>Bring your old clothes, and let’s make them fabulous!</p>
      <p>Best designs will win a trendy gift pack!</p>
      <p>Stay groovy,</p>
      <p><strong>Chic Charlie</strong><br>Style Director at Funky Fashion House</p>
      </div>`,
		timestamp: "11:20",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@adventurousart.com",
		sender: "Adventurous Art Studio",
		topic: "Adventure Art Quest: Create in the Great Outdoors!",
		content: `<div>
      <h2>Dear Creative Soul!</h2>
      <p>Get ready for our Adventure Art Quest! 🎨🌲</p>
      <p>Join us in nature for a day of painting and creativity!</p>
      <p>Bring your canvas and let the beautiful surroundings inspire you!</p>
      <p>Prizes for the most adventurous artwork!</p>
      <p>Artfully yours,</p>
      <p><strong>Artie Explorer</strong><br>Head Adventurer at Adventurous Art Studio</p>
      </div>`,
		timestamp: "12:45",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@quirkyquests.com",
		sender: "Quirky Quests Co.",
		topic: "Treasure Hunt Extravaganza!",
		content: `<div>
      <h2>Attention Treasure Seekers!</h2>
      <p>Join us for a Treasure Hunt Extravaganza! 🗺️💰</p>
      <p>Get ready to solve puzzles, find clues, and uncover treasures!</p>
      <p>The first team to find the hidden loot wins a fabulous prize!</p>
      <p>Bring your friends and let’s get hunting!</p>
      <p>Best of luck,</p>
      <p><strong>Captain Quirk</strong><br>Chief Treasure Officer at Quirky Quests Co.</p>
      </div>`,
		timestamp: "09:50",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@crazycooking.com",
		sender: "Crazy Cooking Club",
		topic: "Ultimate Spaghetti Slurp-Off!",
		content: `<div>
      <h2>Hello Pasta Lover!</h2>
      <p>Get ready for the Ultimate Spaghetti Slurp-Off! 🍝🍴</p>
      <p>Join us for a noodle-filled day of fun and laughter!</p>
      <p>Who can slurp the longest strand of spaghetti? Prizes await the champions!</p>
      <p>Let’s make a mess and enjoy every bite!</p>
      <p>Bon appétit,</p>
      <p><strong>Chef Loony</strong><br>Chief Noodle Officer at Crazy Cooking Club</p>
      </div>`,
		timestamp: "16:15",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
	{
		email: "noreply@glittergalaxy.com",
		sender: "Glitter Galaxy Inc.",
		topic: "Cosmic Dance Party Under the Stars!",
		content: `<div>
      <h2>Dear Star Dancer!</h2>
      <p>Get your dancing shoes on for a Cosmic Dance Party! ✨🪩</p>
      <p>Join us under the stars for a night of glitz, glamour, and grooving!</p>
      <p>Dress in your most glittery attire, and let’s light up the night!</p>
      <p>Fun surprises await all party-goers!</p>
      <p>With sparkles,</p>
      <p><strong>DJ Starburst</strong><br>Chief Party Planner at Glitter Galaxy Inc.</p>
      </div>`,
		timestamp: "20:00",
		category: "campaigns",
		read: false,
		favorite: false,
		important: false,
		assignments: undefined,
	},
];

function handleCampaignMail() {
	if (campaignMails.length === 0) {
		console.log("No more campaign mails to process.");
		return;
	}

	const randomIndex = Math.floor(Math.random() * campaignMails.length);
	const campaignEmail = campaignMails[randomIndex];
	mailObj["mail" + currentKey] = campaignEmail;

	const overlay = document.getElementById("overlay");

  	document.getElementById("overlay-sender").innerHTML = campaignEmail.sender + " (" + campaignEmail.email + ")"; 
  	document.getElementById("overlay-subject").innerHTML = campaignEmail.topic;
	
	document.getElementById("campaigns-summary").innerHTML = truncateString(campaignEmail.sender, 16) + " - " + truncateString(campaignEmail.topic, 16);

	overlay.style.display = "block";
	overlay.style.opacity = "1";

	soundManager.playSound("email");

	setTimeout(function () {
		overlay.style.opacity = "0";
		setTimeout(function () {
			overlay.style.display = "none";
		}, 5000);
	}, 30000);

	currentKey++;
	campaignMails.splice(randomIndex, 1);
}

function checkRandomCampaignMail() {
	setInterval(() => {
		handleCampaignMail();
	}, Math.floor(Math.random() * (150000 - 60000 + 1)) + 60000);
}
checkRandomCampaignMail();