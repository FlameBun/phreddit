// Import compiled models
const UserModel = require("./models/users");
const CommunityModel = require("./models/communities");
const PostModel = require("./models/posts");
const CommentModel = require("./models/comments");
const LinkFlairModel = require("./models/linkflairs");

async function getData(req) {
  let data = {};
  const { displayName, adminStatus } = req.session;

  // Get client's info if request has session cookie and cookie's sessionID is valid
  if (displayName !== undefined) {
    data.user = await UserModel.findOne(
      { displayName: displayName },
      { _id: 0, firstName: 0, lastName: 0, passwordHash: 0, __v: 0 }
    ).exec();
  } else {
    data.user = null;
  }

  // Get info on all regular users if request is from admin
  if (displayName !== undefined && adminStatus === true) {
    data.regUsers = await UserModel.find({ adminStatus: false }, {
      _id: 0,
      adminStatus: 0,
      firstName: 0,
      lastName: 0,
      passwordHash: 0,
      __v: 0
    }).exec();
  }

  data.communities = await CommunityModel.find({}, { __v: 0 }).exec();
  data.posts = await PostModel.find({}, { __v: 0 }).exec();
  data.comments = await CommentModel.find({}, { __v: 0 }).exec();
  data.linkFlairs = await LinkFlairModel.find({}, { __v: 0 }).exec();

  return data;
}

/**
 * Delete every comment in the comment tree beginning from the commentRoot
 * associated with commentRootID.
 */
async function deleteCommentTree(commentRootID) {
  // Retrieve comment associated with commentRootID
  const commentRoot = await CommentModel.findOne({ _id: commentRootID }).exec();

  // Return if comment has already been deleted by another user
  if (commentRoot === null)
    return;
  
  // Delete commentRoot's subtrees
  const { commentIDs } = commentRoot;
  for (let i = 0; i < commentIDs.length; i++)
    await deleteCommentTree(commentIDs[i]);

  // Delete commentRoot
  await CommentModel.deleteOne({ _id: commentRootID }).exec();
}

module.exports.getData = getData;
module.exports.deleteCommentTree = deleteCommentTree;
