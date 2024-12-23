// Sort Helper Functions (For Posts)

/**
 * Sort posts by newest to oldest in a page.
 */
export function sortByNewest(posts) {
  posts.sort((post1, post2) => post2.postedDate - post1.postedDate);
  return posts;
}

/**
 * Sort posts by oldest to newest in a page.
 */
export function sortByOldest(posts) {
  posts.sort((post1, post2) => post1.postedDate - post2.postedDate);
  return posts;
}

/**
 * Sort posts by the most recent to the least recent comment in a page.
 */
export function sortByActive(posts, comments) {
  const map = new Map(); // Map of posts to their latest comments

  // Find latest comments for each post
  posts.forEach((post) => {
    const leafComments = []; // Comments at end of each comment branch

    // Add comments at leaves of comment tree to leafComments array
    if (post.commentIDs.length > 0)
      addLeafComments(post, leafComments); /* post is a dummy comment */

    // Find latest comment in post
    let latestComment = leafComments.length > 0 ? leafComments[0] : undefined;
    for (let i = 1; i < leafComments.length; i++) {
      if (latestComment.commentedDate < leafComments[i].commentedDate)
        latestComment = leafComments[i];
    }

    // Map post to its latest comment
    map.set(post, latestComment);
  });

  // Sort posts by comparing dates of their latest comments
  posts.sort((post1, post2) => {
    // Determine difference between dates of both post's latest comments 
    const latestCommentPost1 = map.get(post1);
    const commentedDatePost1 =
      latestCommentPost1 !== undefined ? latestCommentPost1.commentedDate : 0;
    const latestCommentPost2 = map.get(post2);
    const commentedDatePost2 =
      latestCommentPost2 !== undefined ? latestCommentPost2.commentedDate : 0;
    const commentTimeDiff = commentedDatePost2 - commentedDatePost1;
    
    // In case of tie, use most recent to least recent post order
    if (commentTimeDiff === 0)
      return post2.postedDate - post1.postedDate;

    return commentTimeDiff;
  });

  return posts;

  /* ---------------------- End of sortByActive() function ---------------------- */

  // Add comments at the leaves of the comment tree to the leafComments array
  function addLeafComments(rootComment, leafComments) {
    // Append rootComment to leafComments array if leaf comment
    if (rootComment.commentIDs.length === 0) {
      leafComments.push(rootComment);
      return;
    }

    // Add leaf comments of the following comment subtrees to leafComments
    rootComment.commentIDs.forEach((commentID) => {
      const nextComment = comments.find(
        (comment) => commentID === comment.commentID
      );
      addLeafComments(nextComment, leafComments);
    });
  }
}
