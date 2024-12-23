// Router to handle post-related operations

const express = require("express");
const router = express.Router(); // Current express router
const mongoose = require("mongoose");
const getData = require("../helpers.js").getData;
const deleteCommentTree = require("../helpers.js").deleteCommentTree;

// Import compiled models
const CommunityModel = require("../models/communities.js");
const PostModel = require("../models/posts.js");
const LinkFlairModel = require("../models/linkflairs.js");
const UserModel = require("../models/users.js");

// Update view count and send back model data
router.post("/updateViewCount", async (req, res) => {
  const { postID } = req.body;

  // Retrieve view count of post with postID
  const post = await PostModel.findOne({
    _id: new mongoose.Types.ObjectId(`${postID}`),
  }).exec();

  // Increment view count of post with postID
  await PostModel.updateOne(
    { _id: new mongoose.Types.ObjectId(`${postID}`) },
    { $set: { views: post.views + 1 } }
  ).exec();

  // Send back data of model
  const data = await getData(req);
  res.send(data);
});

// Forbid non-logged-in users from executing post-related operations
router.use("/", (req, res, next) => {
  if (req.session.displayName === undefined) {
    res.status(403).send("Forbidden operation");
    return;
  }
  next();
});

// Store new post in database
router.post("/addPost", async (req, res) => {
  const { community, title, chooseFlair, enterFlair, body } = req.body;
  const { displayName } = req.session;

  const copyErrors = {
    selectCommunityError: "",
    postTitleError: "",
    linkFlairError: "",
    postContentError: "",
  };

  // Select community error
  if (community === "") {
    copyErrors.selectCommunityError = "This field is required.";
  } else {
    copyErrors.selectCommunityError = "";
  }

  // Post title error
  if (title === "") {
    copyErrors.postTitleError = "This field is required.";
  } else if (title.length > 100) {
    copyErrors.postTitleError = "Must be no more than 100 characters.";
  } else {
    copyErrors.postTitleError = "";
  }

  // Link flair error
  if (chooseFlair !== "" && enterFlair !== "") {
    copyErrors.linkFlairError = "Only one flair can be applied to a post.";
  } else if (enterFlair.length > 30) {
    copyErrors.linkFlairError = "Must be no more than 30 characters.";
  } else {
    const linkFlairCopy = await LinkFlairModel.findOne({
      content: enterFlair,
    }).exec();
    if (linkFlairCopy !== null) {
      copyErrors.linkFlairError = "Must be a unique link flair.";
    } else {
      copyErrors.linkFlairError = "";
    }
  }

  // Post content error
  if (body === "") {
    copyErrors.postContentError = "This field is required.";
  } else {
    copyErrors.postContentError = "";
  }

  if (
    copyErrors.selectCommunityError !== "" ||
    copyErrors.postTitleError !== "" ||
    copyErrors.linkFlairError !== "" ||
    copyErrors.postContentError !== ""
  ) {
    res.status(400).send(copyErrors);
    return;
  }

  let lfID;
  let linkFlairDocument;

  if (chooseFlair === "" && enterFlair === "") {
    lfID = null;
  } else {
    const linkFlairCopyTwo = await LinkFlairModel.findOne({
      content: chooseFlair,
    }).exec();
    if (linkFlairCopyTwo !== null) {
      lfID = linkFlairCopyTwo._id;
    } else {
      linkFlairDocument = new LinkFlairModel({
        content: enterFlair,
      });
      await linkFlairDocument.save();
      lfID = linkFlairDocument._id;
    }
  }

  const postDocument = new PostModel({
    title: title,
    content: body,
    linkFlairID: lfID,
    postedBy: displayName,
    commentIDs: [],
  });

  await postDocument.save();

  await CommunityModel.updateOne(
    { name: community },
    { $push: { postIDs: postDocument._id } }
  ).exec();

  const data = await getData(req);
  res.send(data);
});

// Update post
router.post("/update", async (req, res) => {
  const { inputs, postID } = req.body;

  const copyErrors = {
    postTitleError: "",
    linkFlairError: "",
    postContentError: "",
  };

  // Post title error
  if (inputs.title === "") {
    copyErrors.postTitleError = "This field is required.";
  } else if (inputs.title.length > 100) {
    copyErrors.postTitleError = "Must be no more than 100 characters.";
  } else {
    copyErrors.postTitleError = "";
  }

  // Link flair error
  if (inputs.chooseFlair !== "" && inputs.enterFlair !== "") {
    copyErrors.linkFlairError = "Only one flair can be applied to a post.";
  } else if (inputs.enterFlair.length > 30) {
    copyErrors.linkFlairError = "Must be no more than 30 characters.";
  } else {
    const linkFlairCopy = await LinkFlairModel.findOne({
      content: inputs.enterFlair,
    }).exec();
    if (linkFlairCopy !== null) {
      copyErrors.linkFlairError = "Must be a unique link flair.";
    } else {
      copyErrors.linkFlairError = "";
    }
  }

  // Post content error
  if (inputs.body === "") {
    copyErrors.postContentError = "This field is required.";
  } else {
    copyErrors.postContentError = "";
  }

  if (
    copyErrors.postTitleError !== "" ||
    copyErrors.linkFlairError !== "" ||
    copyErrors.postContentError !== ""
  ) {
    res.status(400).send(copyErrors);
    return;
  }

  let lfID;
  let linkFlairDocument;

  if (inputs.chooseFlair === "" && inputsenterFlair === "") {
    lfID = null;
  } else {
    const linkFlairCopyTwo = await LinkFlairModel.findOne({
      content: inputs.chooseFlair,
    }).exec();
    if (linkFlairCopyTwo !== null) {
      lfID = linkFlairCopyTwo._id;
    } else {
      linkFlairDocument = new LinkFlairModel({
        content: inputs.enterFlair,
      });
      await linkFlairDocument.save();
      lfID = linkFlairDocument._id;
    }
  }

  await PostModel.updateOne(
    { _id: new mongoose.Types.ObjectId(`${postID}`) },
    {
      title: inputs.title,
      linkFlairID: new mongoose.Types.ObjectId(`${lfID}`),
      content: inputs.body,
    }
  );

  const data = await getData(req);
  res.send(data);
});

// Delete post
router.post("/delete", async (req, res) => {
  const postID = new mongoose.Types.ObjectId(`${req.body.postID}`);
  const postDoc = await PostModel.findOne({ _id: postID }).exec();

  // Execute post deletion if post has not been deleted by another user
  if (postDoc !== null) {
    // Dissociate post from the community it is in
    await CommunityModel.updateOne(
      { postIDs: postID },
      { $pull: { postIDs: postID } }
    ).exec();

    // Delete every comment in the post
    const { commentIDs } = postDoc;
    for (let i = 0; i < commentIDs.length; i++)
      await deleteCommentTree(commentIDs[i]);

    // Delete post
    await PostModel.deleteOne({ _id: postID }).exec(); 
  }

  const data = await getData(req);
  res.send(data);
});

// Toggle user's upvote or change user's downvote to an upvote
router.post("/upvote", async (req, res) => {
  const { displayName } = req.session;
  const { postID } = req.body;

  const post = await PostModel.findOne({
    _id: new mongoose.Types.ObjectId(`${postID}`),
  }).exec();

  let change;

  if (
    !post.upvoters.includes(displayName) &&
    !post.downvoters.includes(displayName)
  ) {
    change = 5;
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${postID}`) },
      { $push: { upvoters: displayName } }
    ).exec();
  } else if (post.upvoters.includes(displayName)) {
    change = -5;
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${postID}`) },
      { $pull: { upvoters: displayName } }
    ).exec();
  } else if (post.downvoters.includes(displayName)) {
    change = 15;
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${postID}`) },
      { $pull: { downvoters: displayName } }
    ).exec();
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${postID}`) },
      { $push: { upvoters: displayName } }
    ).exec();
  }

  await UserModel.updateOne(
    { displayName: post.postedBy },
    { $inc: { reputation: change } }
  ).exec();

  const data = await getData(req);
  res.send(data);
});

// Toggle user's downvote or change user's upvote to a downvote
router.post("/downvote", async (req, res) => {
  const { displayName } = req.session;
  const { postID } = req.body;

  const post = await PostModel.findOne({
    _id: new mongoose.Types.ObjectId(`${postID}`),
  }).exec();

  let change;

  if (
    !post.upvoters.includes(displayName) &&
    !post.downvoters.includes(displayName)
  ) {
    change = -10;
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${postID}`) },
      { $push: { downvoters: displayName } }
    ).exec();
  } else if (post.downvoters.includes(displayName)) {
    change = 10;
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${postID}`) },
      { $pull: { downvoters: displayName } }
    ).exec();
  } else if (post.upvoters.includes(displayName)) {
    change = -15;
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${postID}`) },
      { $pull: { upvoters: displayName } }
    ).exec();
    await PostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(`${postID}`) },
      { $push: { downvoters: displayName } }
    ).exec();
  }

  await UserModel.updateOne(
    { displayName: post.postedBy },
    { $inc: { reputation: change } }
  ).exec();

  const data = await getData(req);
  res.send(data);
});

module.exports = router; // Export router
