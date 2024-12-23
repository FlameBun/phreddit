// Router to handle community-related operations

const express = require("express");
const router = express.Router(); // Current express router
const mongoose = require("mongoose");
const getData = require("../helpers.js").getData;
const deleteCommentTree = require("../helpers.js").deleteCommentTree;

// Import compiled models
const PostModel = require("../models/posts.js");
const CommentModel = require("../models/comments.js");
const UserModel = require("../models/users.js");

// Forbid non-logged-in users from executing comment-related operations
router.use("/", (req, res, next) => {
  if (req.session.displayName === undefined) {
    res.status(403).send("Forbidden operation");
    return;
  }
  next();
});

// Store new comment into database
router.post("/addComment", async (req, res) => {
  const { content, replyType, replyID } = req.body;
  const { displayName } = req.session;

  const copyErrors = {
    commentContentError: "",
  };

  // Comment content error
  if (content === "") {
    copyErrors.commentContentError = "This field is required.";
  } else if (content.length > 500) {
    copyErrors.commentContentError = "Must be no more than 500 characters.";
  } else {
    copyErrors.commentContentError = "";
  }

  if (copyErrors.commentContentError !== "") {
    res.status(400).send(copyErrors);
    return;
  }

  const commentDocument = new CommentModel({
    content: content,
    commentIDs: [],
    commentedBy: displayName,
  });

  await commentDocument.save();

  if (replyType === "post") {
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${replyID}`) },
      { $push: { commentIDs: commentDocument._id } }
    ).exec();
  } else {
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${replyID}`) },
      { $push: { commentIDs: commentDocument._id } }
    ).exec();
  }

  const data = await getData(req);
  res.send(data);
});

// Update comment
router.post("/update", async (req, res) => {
  const { inputs, commentID } = req.body;

  const copyErrors = {
    commentContentError: "",
  };

  // Comment content error
  if (inputs.content === "") {
    copyErrors.commentContentError = "This field is required.";
  } else if (inputs.content.length > 500) {
    copyErrors.commentContentError = "Must be no more than 500 characters.";
  } else {
    copyErrors.commentContentError = "";
  }

  if (copyErrors.commentContentError !== "") {
    res.status(400).send(copyErrors);
    return;
  }

  await CommentModel.updateOne(
    { _id: new mongoose.Types.ObjectId(`${commentID}`) },
    { content: inputs.content }
  );

  const data = await getData(req);
  res.send(data);
});

// Delete comment and all of its replies/descendants
router.post("/delete", async (req, res) => {
  const commentID = new mongoose.Types.ObjectId(`${req.body.commentID}`);

  // Dissociate comment from the post/comment it is replying to
  await PostModel.updateOne(
    { commentIDs: commentID },
    { $pull: { commentIDs: commentID } }
  ).exec();
  await CommentModel.updateOne(
    { commentIDs: commentID },
    { $pull: { commentIDs: commentID } }
  ).exec();

  // Delete comment and all of its replies/descendants
  await deleteCommentTree(commentID);

  const data = await getData(req);
  res.send(data);
});

// Upvote comment
router.post("/upvote", async (req, res) => {
  const { displayName } = req.session;
  const { commentID } = req.body;

  const comment = await CommentModel.findOne({
    _id: new mongoose.Types.ObjectId(`${commentID}`),
  }).exec();

  let change;

  if (
    !comment.upvoters.includes(displayName) &&
    !comment.downvoters.includes(displayName)
  ) {
    change = 5;
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${commentID}`) },
      { $push: { upvoters: displayName } }
    ).exec();
  } else if (comment.upvoters.includes(displayName)) {
    change = -5;
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${commentID}`) },
      { $pull: { upvoters: displayName } }
    ).exec();
  } else if (comment.downvoters.includes(displayName)) {
    change = 15;
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${commentID}`) },
      { $pull: { downvoters: displayName } }
    ).exec();
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${commentID}`) },
      { $push: { upvoters: displayName } }
    ).exec();
  }

  await UserModel.updateOne(
    { displayName: comment.commentedBy },
    { $inc: { reputation: change } }
  ).exec();

  const data = await getData(req);
  res.send(data);
});

// Downvote comment
router.post("/downvote", async (req, res) => {
  const { displayName } = req.session;
  const { commentID } = req.body;

  const comment = await CommentModel.findOne({
    _id: new mongoose.Types.ObjectId(`${commentID}`),
  }).exec();

  let change;

  if (
    !comment.upvoters.includes(displayName) &&
    !comment.downvoters.includes(displayName)
  ) {
    change = -10;
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${commentID}`) },
      { $push: { downvoters: displayName } }
    ).exec();
  } else if (comment.downvoters.includes(displayName)) {
    change = 10;
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${commentID}`) },
      { $pull: { downvoters: displayName } }
    ).exec();
  } else if (comment.upvoters.includes(displayName)) {
    change = -15;
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${commentID}`) },
      { $pull: { upvoters: displayName } }
    ).exec();
    await CommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${commentID}`) },
      { $push: { downvoters: displayName } }
    ).exec();
  }

  await UserModel.updateOne(
    { displayName: comment.commentedBy },
    { $inc: { reputation: change } }
  ).exec();

  const data = await getData(req);
  res.send(data);
});

module.exports = router; // Export router
