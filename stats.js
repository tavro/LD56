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
		const temp = document.querySelector("#assignment-container");
		if(temp) {
			temp.style.display = "none";
		}
    awaitingMail = true;
		return true;
	}
}

var mouthAmount = 0;
var foodAmount = 0;
var warmAmount = 0;
var coldAmount = 0;
var virusAmount = 0;
var radioactivityAmount = 0;
var killAmount = 0;

let data = {
	mouthAmount: 0,
	foodAmount: 0,
	warmAmount: 0,
	coldAmount: 0,
	virusAmount: 0,
	radioactivityAmount: 0,
	killAmount: 0,
};

Object.defineProperty(data, "mouthAmount", {
	get() {
		return mouthAmount;
	},
	set(value) {
		mouthAmount = value;
		const elem = document.querySelector("#mouthAmount");
		if(elem) {
			elem.innerHTML = foodAmount;
		}
		checkAssignments(mouthAmount);
	},
});

Object.defineProperty(data, "foodAmount", {
	get() {
		return foodAmount;
	},
	set(value) {
		foodAmount = value;
		const elem = document.querySelector("#foodAmount");
		if(elem) {
			elem.innerHTML = foodAmount;
		}
		checkAssignments(foodAmount);
	},
});

Object.defineProperty(data, "warmAmount", {
	get() {
		return warmAmount;
	},
	set(value) {
		warmAmount = value;
		const elem = document.querySelector("#warmthAmount");
		if(elem) {
			elem.innerHTML = foodAmount;
		}
		checkAssignments(warmAmount);
	},
});

Object.defineProperty(data, "coldAmount", {
	get() {
		return coldAmount;
	},
	set(value) {
		coldAmount = value;
		const elem = document.querySelector("#coldAmount");
		if(elem) {
			elem.innerHTML = foodAmount;
		}
		checkAssignments(coldAmount);
	},
});

Object.defineProperty(data, "virusAmount", {
	get() {
		return virusAmount;
	},
	set(value) {
		virusAmount = value;
		const elem = document.querySelector("#virusAmount");
		if(elem) {
			elem.innerHTML = foodAmount;
		}
		checkAssignments(virusAmount);
	},
});

Object.defineProperty(data, "radioactivityAmount", {
	get() {
		return radioactivityAmount;
	},
	set(value) {
		radioactivityAmount = value;
		const elem = document.querySelector("#radioactivityAmount");
		if(elem) {
			elem.innerHTML = foodAmount;
		}
		checkAssignments(radioactivityAmount);
	},
});

Object.defineProperty(data, "killAmount", {
	get() {
		return killAmount;
	},
	set(value) {
		killAmount = value;
		const elem = document.querySelector("#killAmount");
		if(elem) {
			elem.innerHTML = foodAmount;
		}
		checkAssignments(killAmount);
	},
});