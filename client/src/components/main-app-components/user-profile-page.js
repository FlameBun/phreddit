import { matchingComment } from "../../helpers/comment-helpers";
import { initializeModel } from "../../helpers/model-helpers";
import axios from "axios";

export default function UserProfilePage({
  data,
  setData,
  mainContent,
  setMainContent,
  updateModelAndSetMainContent
}) {
  const { communities, posts, comments } = data;
  let { user } = data;

  // Set user to mainContent.regUser if admin is viewing another user's profile
  if (mainContent.adminView === true)
    user = mainContent.regUser;

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

  function handleCommunityLink(communityID) {
    updateModelAndSetMainContent({
      ...mainContent,
      view: "edit-community-page",
      redirectBackTo: "user-profile-page",
      communityID: communityID
    });
  }

  function handlePostLink(postID) {
    updateModelAndSetMainContent({
      ...mainContent,
      view: "edit-post-page",
      redirectBackTo: "user-profile-page",
      postID: postID
    });
  }

  function handleCommentLink(commentID) {
    updateModelAndSetMainContent({
      ...mainContent,
      view: "edit-comment-page",
      redirectBackTo: "user-profile-page",
      commentID: commentID
    });
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
      setMainContent((mainContent) => {
        return {
          ...mainContent,
          popUp: true,
          type: "error",
          message: "A network error has occurred."
        };
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
      setMainContent((mainContent) => {
        return {
          ...mainContent,
          popUp: true,
          type: "error",
          message: "A network error has occurred."
        };
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
      setMainContent((mainContent) => {
        return {
          ...mainContent,
          popUp: true,
          type: "error",
          message: "A network error has occurred."
        };
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
  } else {
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
  }

  // Display appropriate feedback if no results are found
  if (listElements.length === 0)
    listElements = <div id="profile-listing-empty">No results found</div>;

  return (
    <div id="user-profile-page" className="main">
      <div id="user-profile-page-header">
        <div>
          <div id="user-profile-display-name">{user.displayName}</div>
          {mainContent.adminView === true && (
            <button
              id="return-admin-profile"
              onClick={() => updateModelAndSetMainContent({ view: "admin-profile-page", list: "users" })}
            >
              Return to Your Profile
            </button>
          )}
        </div>
        <div>{user.email}</div>
        <div>Member since {user.startDate.toLocaleDateString()}</div>
        <div>Reputation: {user.reputation}</div>
      </div>
      <hr />
      <div id="user-profile-body">
        <div id="user-profile-listing-buttons">
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