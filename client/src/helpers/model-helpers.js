// Model Helper Functions

export function initializeModel(data) {
  // Reconfigure data properties and values
  const { user, regUsers, communities, linkFlairs, posts, comments } = data;

  if (user !== null) // If user is logged in
    user.startDate = new Date(user.startDate);

  if (regUsers !== undefined) { // If user is admin
    regUsers.forEach((user) => {
      user.startDate = new Date(user.startDate);
    });
  }

  communities.forEach((community) => {
    community.communityID = community._id;
    community.startDate = new Date(community.startDate);
    community.memberCount = community.members.length;
  });

  linkFlairs.forEach((linkFlair) => {
    linkFlair.linkFlairID = linkFlair._id;
  });
  
  posts.forEach((post) => {
    post.postID = post._id;
    post.postedDate = new Date(post.postedDate);
  });

  comments.forEach((comment) => {
    comment.commentID = comment._id;
    comment.commentedDate = new Date(comment.commentedDate);
  });
}