const activeAssignments = [];
function checkAssignments(amount) {
	for (const assignmentList of activeAssignments) {
		for (const assignment of assignmentList) {
			if (!assignment.condition(amount)) {
				return false; // Not Finished with assignments
			}
		}
	}

  // Finished with assignments
  console.log("Finished assignments");
	return true;
}

var mouthAmount = 0;
var foodAmount = 0;

let data = {
	mouthAmount: 0,
	foodAmount: 0,
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
    document.querySelector("#taskAmount").innerHTML = foodAmount;
		checkAssignments(foodAmount);
	},
});
