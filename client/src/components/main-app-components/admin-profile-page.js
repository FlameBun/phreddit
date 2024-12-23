import { matchingComment } from "../../helpers/comment-helpers";
import { initializeModel } from "../../helpers/model-helpers";
import axios from "axios";

export default function AdminProfilePage({
  data,
  setData,
  mainContent,
  setMainContent,
  updateModelAndSetMainContent
}) {
  const { user, regUsers, communities, posts, comments } = data;

  function handleUsersButton() {
    updateModelAndSetMainContent({
      ...mainContent,
      list: "users"
    });
  }

  function handleCommunitiesButton() {
    updateModelAndSetMainContent({
      ...mainContent,
      list: "communities"
    });
  }

  function handlePostsButton() {
    updateModelAndSetMainContent({
      ...mainContent,
      list: "posts"
    });
  }

  function handleCommentsButton() {
    updateModelAndSetMainContent({
      ...mainContent,
      list: "comments"
    });
  }

  function handleUserLink(regUser) {
    updateModelAndSetMainContent({
      view: "user-profile-page",
      list: "posts",
      adminView: true,
      regUser: regUser
    });
  }

  function handleCommunityLink(communityID) {
    updateModelAndSetMainContent({
      view: "edit-community-page",
      redirectBackTo: "admin-profile-page",
      communityID: communityID
    });
  }

  function handlePostLink(postID) {
    updateModelAndSetMainContent({
      view: "edit-post-page",
      redirectBackTo: "admin-profile-page",
      postID: postID
    });
  }

  function handleCommentLink(commentID) {
    updateModelAndSetMainContent({
      view: "edit-comment-page",
      redirectBackTo: "admin-profile-page",
      commentID: commentID
    });
  }

  // Show the confirmation pop-up if admin wants to delete regular user
  function handleDeleteUserButton(displayName) {
    setMainContent({
      ...mainContent,
      popUp: true,
      type: "confirmation",
      confirmationHandler: () => deleteUser(displayName)
    });
  }

  // Actual delete user operation
  async function deleteUser(displayName) {
    try {
      const res = await axios.post("http://localhost:8000/users/delete",
        { displayName: displayName }, { withCredentials: true });

      const { data } = res;
      initializeModel(data);
      setData(data);
      setMainContent({ ...mainContent, list: "users" });
    } catch (err) {
      setMainContent({
        ...mainContent,
        popUp: true,
        type: "error",
        message: "A network error has occurred."
      });
    }
  }

  // Show the confirmation pop-up if user wants to delete community
  function handleDeleteCommunityButton(communityID) {
    setMainContent({
      ...mainContent,
      popUp: true,
      type: "confirmation",
      confirmationHandler: () => deleteCommunity(communityID)
    });
  }

  // Actual delete community operation
  async function deleteCommunity(communityID) {
    try {
      const res = await axios.post("http://localhost:8000/communities/delete",
        { communityID: communityID }, { withCredentials: true });
      
      const { data } = res;
      initializeModel(data);
      setData(data);
      setMainContent({ ...mainContent, list: "communities" });
    } catch (err) {
      setMainContent({
        ...mainContent,
        popUp: true,
        type: "error",
        message: "A network error has occurred."
      });
    }
  }

  async function handleDeletePost(postID) {
    try {
      const res = await axios.post("http://localhost:8000/posts/delete",
        { postID: postID }, { withCredentials: true });

      const { data } = res;
      initializeModel(data);
      setData(data);
    } catch (err) {
      setMainContent({
        ...mainContent,
        popUp: true,
        type: "error",
        message: "A network error has occurred."
      });
    }
  }

  async function handleDeleteComment(commentID) {
    try {
      const res = await axios.post("http://localhost:8000/comments/delete",
        { commentID: commentID }, { withCredentials: true });

      const { data } = res;
      initializeModel(data);
      setData(data);
    } catch (err) {
      setMainContent({
        ...mainContent,
        popUp: true,
        type: "error",
        message: "A network error has occurred."
      });
    }
  }

  let listElements;
  if (mainContent.list === "communities") {
    // Filter communities down to communities user has created
    const userCommunities = communities.filter((community) => {
      return community.creator === user.displayName;
    });

    // Map user's communities to elements with community name
    listElements = userCommunities.map((community) => {
      return (
        <div key={community.communityID} className="community-listing-block">
          <div
            className="community-listing-element"
            onClick={() => handleCommunityLink(community.communityID)}
          >
            {community.name}
          </div>
          <button
            className="listing-delete"
            onClick={() => handleDeleteCommunityButton(community.communityID)}
          >
            Delete
          </button>
        </div>
      );
    });
  } else if (mainContent.list === "posts") {
    // Filter posts down to posts user has created
    const userPosts = posts.filter((post) => {
      return post.postedBy === user.displayName;
    });

    // Map user's posts to elements with post title
    listElements = userPosts.map((post) => {
      return (
        <div key={post.postID} className="post-listing-block">
          <div
            className="post-listing-element"
            onClick={() => handlePostLink(post.postID)}
          >
            {post.title}
          </div>
          <button
            className="listing-delete"
            onClick={() => handleDeletePost(post.postID)}
          >
            Delete
          </button>
        </div>
      );
    });
  } else if (mainContent.list === "comments") {
    // Filter comments down to comments user has created
    const userComments = comments.filter((comment) => {
      return comment.commentedBy === user.displayName;
    });

    // Map user's comments to elements with post title and comment content
    listElements = userComments.map((comment) => {
      // Get post that has user's comment
      const post = posts.find((post) => {
        return matchingComment(post, comment, comments);
      });

      return (
        <div key={comment.commentID} className="comment-listing-block">
          <div
            className="comment-listing-element"
            onClick={() => handleCommentLink(comment.commentID)}
          >
            <div>{post.title}</div>
            <div>{comment.content.slice(0, 20)}</div>
          </div>
          <button
            className="listing-delete"
            onClick={() => handleDeleteComment(comment.commentID)}
          >
            Delete
          </button>
        </div>
      );
    });
  } else { // mainContent.list === "users"
    listElements = regUsers.map((regUser) => {
      return (
        <div key={regUser.displayName} className="user-listing-block">
          <div
            className="user-listing-element"
            onClick={() => handleUserLink(regUser)}
          >
            <div>{regUser.displayName}</div>
            <div>{regUser.email}</div>
            <div>Reputation: {regUser.reputation}</div>
          </div>
          <button
            className="listing-delete"
            onClick={() => handleDeleteUserButton(regUser.displayName)}
          >
            Delete
          </button>
        </div>
      );
    });
  }

  // Display appropriate feedback if no results are found
  if (listElements.length === 0)
    listElements = <div id="profile-listing-empty">No results found</div>;

  return (
    <div id="user-profile-page" className="main">
      <div id="user-profile-page-header">
        <div>{user.displayName}</div>
        <div>{user.email}</div>
        <div>Member since {user.startDate.toLocaleDateString()}</div>
        <div>Reputation: {user.reputation}</div>
      </div>
      <hr />
      <div id="user-profile-body">
        <div id="user-profile-listing-buttons">
          <button
            className={mainContent.list === "users" ? "lightergray" : "clear"}
            onClick={handleUsersButton}
          >
            Users
          </button>
          <button
            className={mainContent.list === "communities" ? "lightergray" : "clear"}
            onClick={handleCommunitiesButton}
          >
            Communities
          </button>
          <button
            className={mainContent.list === "posts" ? "lightergray" : "clear"}
            onClick={handlePostsButton}
          >
            Posts
          </button>
          <button
            className={mainContent.list === "comments" ? "lightergray" : "clear"}
            onClick={handleCommentsButton}
          >
            Comments
          </button>
        </div>
        <div id="user-profile-listing">
          {listElements}
        </div>
      </div>
    </div>
  );
}