// Comment Helper Functions

/**
 * Get the total number of comments in a post.
 */
export function getCommentCount(post, comments) {
  const totalNumComments = getCommentTreeCount(post); // post is a dummy comment
  return totalNumComments - 1; // Exclude post as part of comment count

  /* ---------------- End of getCommentPostCount() function ---------------- */

  // Get the total number of comments in the comment tree beginning from rootComment
  function getCommentTreeCount(rootComment) {
    // Sum rootComment and total number of comments in each comment subtree
    let totalNumComments = 1; // Count rootComment itself
    rootComment.commentIDs.forEach((commentID) => {
      const nextComment = comments.find(
        (comment) => comment.commentID === commentID
      );
      totalNumComments += getCommentTreeCount(nextComment);
    });

    return totalNumComments;
  }
}

/**
 * Return true if comment or one its descendants matches commentCandidate.
 * Otherwise, return false;
 */
export function matchingComment(comment, commentCandidate, commentList) {
  if (comment.commentID === commentCandidate.commentID)
    return true;

  const { commentIDs } = comment; // IDs of direct descendant comments
  for (let i = 0; i < commentIDs.length; i++) {
    // Get direct descendant
    const comment = commentList.find((comment) => {
      return comment.commentID === commentIDs[i];
    });

    // Return true if direct descendant comment tree has a comment which
    // matches commentCandidate
    if (matchingComment(comment, commentCandidate, commentList))
      return true;
  }

  return false;
}
