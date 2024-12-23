// Router to handle community-related operations

const express = require("express");
const router = express.Router(); // Current express router
const mongoose = require("mongoose");
const getData = require("../helpers.js").getData;
const deleteCommentTree = require("../helpers.js").deleteCommentTree;

// Import compiled models
const CommunityModel = require("../models/communities.js");
const PostModel = require("../models/posts.js");

// Forbid non-logged-in users from executing community-related operations
router.use("/", (req, res, next) => {
  if (req.session.displayName === undefined) {
    res.status(403).send("Forbidden operation");
    return;
  }
  next();
});

// Store new community into database
router.post("/addCommunity", async (req, res) => {
  // Retrieve data from request
  const { community, description } = req.body;

  const copyErrors = {
    communityNameError: "",
    communityDescError: "",
  };

  // Community description error
  if (description === "") {
    copyErrors.communityDescError = "This field is required.";
  } else if (description.length > 500) {
    copyErrors.communityDescError = "Must be no more than 500 characters.";
  } else {
    copyErrors.communityDescError = "";
  }

  // Community name error
  if (community === "") {
    copyErrors.communityNameError = "This field is required.";
  } else if (community.length > 100) {
    copyErrors.communityNameError = "Must be no more than 100 characters.";
  } else {
    const communityCopy = await CommunityModel.findOne({
      name: community,
    }).exec();
    if (communityCopy !== null) {
      copyErrors.communityNameError = "Must be a unique community name.";
    } else {
      copyErrors.communityNameError = "";
    }
  }

  if (
    copyErrors.communityNameError !== "" ||
    copyErrors.communityDescError !== ""
  ) {
    res.status(400).send(copyErrors);
    return;
  }

  const communityDocument = new CommunityModel({
    name: community,
    description: description,
    postIDs: [],
    creator: req.session.displayName,
    members: [req.session.displayName],
  });

  await communityDocument.save();
  const data = await getData(req);
  res.send({ data, communityID: communityDocument._id });
});

// Update community
router.post("/update", async (req, res) => {
  const { inputs, communityID } = req.body;

  const community = await CommunityModel.findOne({
    _id: new mongoose.Types.ObjectId(`${communityID}`),
  }).exec();

  const copyErrors = {
    communityNameError: "",
    communityDescError: "",
  };

  // Community description error
  if (inputs.description === "") {
    copyErrors.communityDescError = "This field is required.";
  } else if (inputs.description.length > 500) {
    copyErrors.communityDescError = "Must be no more than 500 characters.";
  } else {
    copyErrors.communityDescError = "";
  }

  // Community name error
  if (inputs.community === "") {
    copyErrors.communityNameError = "This field is required.";
  } else if (inputs.community.length > 100) {
    copyErrors.communityNameError = "Must be no more than 100 characters.";
  } else if (community.name === inputs.community) {
    copyErrors.communityNameError = "";
  } else {
    const communityCopy = await CommunityModel.findOne({
      name: inputs.community,
    }).exec();
    if (communityCopy !== null) {
      copyErrors.communityNameError = "Must be a unique community name.";
    } else {
      copyErrors.communityNameError = "";
    }
  }

  if (
    copyErrors.communityNameError !== "" ||
    copyErrors.communityDescError !== ""
  ) {
    res.status(400).send(copyErrors);
    return;
  }

  await CommunityModel.updateOne(
    { _id: new mongoose.Types.ObjectId(`${communityID}`) },
    { name: inputs.community, description: inputs.description }
  );

  const data = await getData(req);
  res.send(data);
});

// Delete the community
router.post("/delete", async (req, res) => {
  const communityID = new mongoose.Types.ObjectId(`${req.body.communityID}`);
  const communityDoc = await CommunityModel.findOne({ _id: communityID }).exec();

  // Execute community deletion if community has not been deleted yet
  if (communityDoc !== null) {
    const { postIDs } = communityDoc;
    for (let i = 0; i < postIDs.length; i++) {
      // Delete every comment in post associated with postIDs[i]
      const postDoc = await PostModel.findOne({ _id: postIDs[i] }).exec();
      const { commentIDs } = postDoc;
      for (let j = 0; j < commentIDs.length; j++)
        await deleteCommentTree(commentIDs[j]);
      
      // Delete the post associated with postIDs[i]
      await PostModel.deleteOne({ _id: postIDs[i] }).exec();
    }

    // Delete the community associated with communityID
    await CommunityModel.deleteOne({ _id: communityID }).exec();
  }

  const data = await getData(req);
  res.send(data);
});

// Add the user to the community
router.post("/join", async (req, res) => {
  // Add user to community specified in body of request
  const communityDoc = await CommunityModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(`${req.body.communityID}`) },
    { $push: { members: req.session.displayName } }
  );

  // Send error response if community no longer exists
  if (communityDoc === null) {
    res.status(404).send("Community does not exist.");
    return;
  }

  // Send updated data to client
  const data = await getData(req);
  res.send(data);
});

// Remove the user from the community
router.post("/leave", async (req, res) => {
  // Remove user from community specified in body of request
  const communityDoc = await CommunityModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(`${req.body.communityID}`) },
    { $pull: { members: req.session.displayName } }
  );

  // Send error response if community no longer exists
  if (communityDoc === null) {
    res.status(404).send("Community does not exist.");
    return;
  }

  // Send updated data to client
  const data = await getData(req);
  res.send(data);
});

module.exports = router; // Export router
