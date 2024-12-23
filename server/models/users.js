// User Document Schema

const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  adminStatus: {type: Boolean, required: true, default: false},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true},
  displayName: {type: String, required: true},
  passwordHash: {type: String, required: true},
  startDate: {type: Date, required: true, default: Date.now},
  reputation: {type: Number, required: true, default: 100}
});

module.exports = mongoose.model("User", UserSchema);
