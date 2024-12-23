// Community Document Schema

const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommunitySchema = new Schema({
  name: {type: String, required: true, maxLength: 100},
  description: {type: String, required: true, maxLength: 500},
  postIDs: [{type: Schema.Types.ObjectId, ref: "Post"}],
  creator: {type: String, required: true},
  startDate: {type: Date, required: true, default: Date.now},
  members: {type: [String], required: true}
});

module.exports = mongoose.model("Community", CommunitySchema);