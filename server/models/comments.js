// Comment Document Schema

const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
  content: {type: String, required: true, maxLength: 500},
  commentIDs: [{type: Schema.Types.ObjectId, ref: "Comment"}],
  commentedBy: {type: String, required: true},
  commentedDate: {type: Date, required: true, default: Date.now},
  upvoters: [{type: String}],
  downvoters: [{type: String}]
});

module.exports = mongoose.model("Comment", CommentSchema);