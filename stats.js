const activeAssignments = []
function checkAssignments() {
  console.log("test");
}

var mouthAmount = 0;
var foodAmount = 0;

let data = {
  mouthAmount: 0,
  foodAmount: 0
};

Object.defineProperty(data, "mouthAmount", {
  get() {
      return mouthAmount;
  },
  set(value) {
      mouthAmount = value;
      checkAssignments();
  }
});

Object.defineProperty(data, "foodAmount", {
  get() {
      return foodAmount;
  },
  set(value) {
      foodAmount = value;
      checkAssignments();
  }
});