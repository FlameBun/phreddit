// Routers to handle user-related operations

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const getData = require("../helpers.js").getData;
const deleteCommentTree = require("../helpers.js").deleteCommentTree;

// Import compiled models
const CommunityModel = require("../models/communities.js");
const User = require("../models/users.js");
const PostModel = require("../models/posts.js");
const CommentModel = require("../models/comments.js");

// Register a user and store user info in database
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, displayName, password, confirmPassword } =
    req.body;

  const errors = {
    firstNameError: "",
    lastNameError: "",
    emailError: "",
    displayNameError: "",
    passwordError: "",
    confirmPasswordError: "",
  };

  // Error if first name field is empty
  if (firstName === "")
    errors.firstNameError = "This field is required.";

  // Error if last name field is empty
  if (lastName === "")
    errors.lastNameError = "This field is required.";

  // Error if email field is empty
  if (email === "") {
    errors.emailError = "This field is required.";
  } else if (/.+@.+/.test(email) === false) {
    // Error if email does not have valid form (username@domain)
    errors.emailError = "Invalid email format.";
  } else {
    // Error if email already exists
    const emailExists = await User.findOne({email: email}).exec();
    if (emailExists)
      errors.emailError = "A user with this email already exists.";
  }

  // Error if display name field is empty
  if (displayName === "") {
    errors.displayNameError = "This field is required.";
  } else {
    // Error if display name already exists
    const displayNameExists = await User.findOne({displayName: displayName}).exec();
    if (displayNameExists)
      errors.displayNameError = "A user with this display name already exists.";
  }

  // Error if password field is empty or contains personal info from fields
  if (password === "")
    errors.passwordError = "This field is required.";
  else if (firstName !== "" && password.includes(firstName))
    errors.passwordError = "Password cannot include first name.";
  else if (lastName !== "" && password.includes(lastName))
    errors.passwordError = "Password cannot include last name.";
  else if (displayName !== "" && password.includes(displayName))
    errors.passwordError = "Password cannot include display name.";
  else if (email !== "" && password.includes(email))
    errors.passwordError = "Password cannot include email.";

  // Error if password field does not match confirm password field
  if (password !== confirmPassword)
    errors.confirmPasswordError = "Passwords do not match."

  if (
    errors.firstNameError !== "" ||
    errors.lastNameError !== "" ||
    errors.emailError !== "" ||
    errors.displayNameError !== "" ||
    errors.passwordError !== "" ||
    errors.confirmPasswordError !== ""
  ) {
    res.status(400).send(errors);
    return;
  }

  // Hash and salt password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user document
  const newUser = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    displayName: displayName,
    passwordHash: passwordHash
  });

  // Register user in database
  await newUser.save();

  res.send(`${newUser.displayName} registered!`);
});

// Sign in a user and create a session for them
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Retrieve user document with specified email from database
  const user = await User.findOne({email: email}).exec();

  // Error if user with specified email does not exist in database
  if (user === null) {
    res.status(401).send("Invalid email or password.");
    return;
  }

  // Error if password sent from client does not match user's password
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    res.status(401).send("Invalid email or password.");
    return;
  }

  // Store user's session data and set session cookie
  req.session.displayName = user.displayName;
  req.session.adminStatus = user.adminStatus;

  res.send(`${user.displayName} has logged in!`);
});

// Verify the user is still logged in
router.get("/loginStatus", async (req, res) => {
  const { displayName } = req.session; // Display name of user 

  // False if request does not have session cookie or cookie's sessionID is invalid
  if (req.session.displayName === undefined) {
    res.send(false);
    return;
  }

  // Verify the user is a registered user (in case they have have been
  // recently deleted by an admin)
  const userDoc = await User.findOne({ displayName: displayName }).exec();
  if (userDoc !== null) {
    res.send(true);
    return;
  }

  // Destroy the user's session whose was previously valid but is now not
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error with session destroying");
    } else {
      res.send(false); // False; user is not logged in
    }
  });
});

// Log out a user by destroying their session
router.get("/logout", async (req, res) => {
  // Destroy session if request has session cookie and cookie's sessionID is valid
  if (req.session.displayName !== undefined) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error with session destroying");
      } else {
        res.send("Logged out!");
      }
    });
  } else { /* Should theoretically never reach here */
    res.status(403).send("Forbidden operation");
  }
});

// Delete user and all of the data it is associated with
router.post("/delete", async (req, res) => {
  const { displayName } = req.body; // Display name of user to delete
  const userDoc = User.findOne({ displayName: displayName });

  // Remove user if they still exist on database
  if (userDoc !== null) {
    // Retrieve community documents associated with user
    const communityDocs = await CommunityModel.find({
      creator: displayName
    }).exec();

    // Delete all user's communities
    for (let i = 0; i < communityDocs.length; i++) {
      const communityID = communityDocs[i]._id;
      const { postIDs } = communityDocs[i];

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

    // Remove user from all communities they have joined
    await CommunityModel.updateMany(
      { members: displayName },
      { $pull: { members: displayName } }
    ).exec();

    // Retrieve post documents associated with user
    const postDocs = await PostModel.find({
      postedBy: displayName
    }).exec();

    // Delete all user's posts
    for (let i = 0; i < postDocs.length; i++) {
      const postID = postDocs[i]._id;

      // Dissociate post from the community it is in
      await CommunityModel.updateOne(
        { postIDs: postID },
        { $pull: { postIDs: postID } }
      ).exec();

      // Delete every comment in the post
      const { commentIDs } = postDocs[i];
      for (let i = 0; i < commentIDs.length; i++)
        await deleteCommentTree(commentIDs[i]);

      // Delete post
      await PostModel.deleteOne({ _id: postID }).exec(); 
    }

    // Remove user from upvoters array of posts they upvoted
    await PostModel.updateMany(
      { upvoters: displayName },
      { $pull: { upvoters: displayName } } 
    ).exec();

    // Remove user from downvoters array of posts they downvoted
    await PostModel.updateMany(
      { downvoters: displayName },
      { $pull: { downvoters: displayName } } 
    ).exec();

    // Retrieve comment documents associated with user
    const commentDocs = await CommentModel.find({
      commentedBy: displayName
    }).exec();

    // Delete all user's comments and replies to user's comments
    for (let i = 0; i < commentDocs.length; i++) {
      const commentID = commentDocs[i]._id;

      // Dissociate comment from the post/comment it is replying to
      await PostModel.updateOne(
        { commentIDs: commentID },
        { $pull: { commentIDs: commentID } }
      ).exec();
      await CommentModel.updateOne(
        { commentIDs: commentID },
        { $pull: { commentIDs: commentID } }
      ).exec();

      // Delete comment and all of its replies
      await deleteCommentTree(commentID);
    }

    // Remove user from upvoters array of comments they upvoted
    await CommentModel.updateMany(
      { upvoters: displayName },
      { $pull: { upvoters: displayName } } 
    ).exec();

    // Remove user from downvoters array of comments they downvoted
    await CommentModel.updateMany(
      { downvoters: displayName },
      { $pull: { downvoters: displayName } } 
    ).exec();

    // Delete user
    await User.deleteOne({ displayName: displayName }).exec();
  }

  const data = await getData(req);
  res.send(data);
});

module.exports = router; // Export router
