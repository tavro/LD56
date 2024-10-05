var awaitingMail = false;

var activeAssignments = [];
function checkAssignments(amount) {
	if (activeAssignments.length > 0) {
		for (const assignmentList of activeAssignments) {
			for (const assignment of assignmentList) {
				if (!assignment.condition(amount)) {
					return false; // Not Finished with assignments
				}
			}
		}

		// Finished with assignments
		console.log("Finished assignments");
    activeAssignments = [];
    awaitingMail = true;
		return true;
	}
}

var mouthAmount = 0;
var foodAmount = 0;
var warmAmount = 0;
var coldAmount = 0;

let data = {
	mouthAmount: 0,
	foodAmount: 0,
	warmAmount: 0,
	coldAmount: 0,
};

Object.defineProperty(data, "mouthAmount", {
	get() {
		return mouthAmount;
	},
	set(value) {
		mouthAmount = value;
		checkAssignments(mouthAmount);
	},
});

Object.defineProperty(data, "foodAmount", {
	get() {
		return foodAmount;
	},
	set(value) {
		foodAmount = value;
		// document.querySelector("#taskAmount").innerHTML = foodAmount;
		checkAssignments(foodAmount);
	},
});

Object.defineProperty(data, "warmAmount", {
	get() {
		return warmAmount;
	},
	set(value) {
		warmAmount = value;
		checkAssignments(warmAmount);
	},
});

Object.defineProperty(data, "coldAmount", {
	get() {
		return coldAmount;
	},
	set(value) {
		coldAmount = value;
		checkAssignments(coldAmount);
	},
});