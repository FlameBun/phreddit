// LinkFlair Document Schema

const mongoose = require("mongoose");
const { Schema } = mongoose;

const LinkFlairSchema = new Schema({
  content: {type: String, required: true, maxLength: 30}
});

module.exports = mongoose.model("LinkFlair", LinkFlairSchema);