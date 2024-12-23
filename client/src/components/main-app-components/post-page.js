import { getCommentCount } from "../../helpers/comment-helpers.js";
import { generateTimestamp } from "../../helpers/date-helpers.js";
import { initializeModel } from "../../helpers/model-helpers.js";
import { Fragment } from "react";
import axios from "axios";

export default function PostPage({ postID, data, setData, setMainContent }) {
  const { user, communities, posts, comments, linkFlairs } = data;

  function handleReplyClick(replyType, replyID, postID) {
    setMainContent({
      view: "new-comment-page",
      replyType: replyType, // Post or comment reply
      replyID: replyID, // ID of post or comment to reply to
      redirectPostID: postID, // ID of post to redirect to after commenting
    });
  }

  async function handlePostUpvote(postID) {
    try {
      const res = await axios.post(
        "http://localhost:8000/posts/upvote",
        { postID },
        { withCredentials: true }
      );

      initializeModel(res.data);
      setData(res.data);
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

  async function handlePostDownvote(postID) {
    try {
      const res = await axios.post(
        "http://localhost:8000/posts/downvote",
        { postID },
        { withCredentials: true }
      );

      initializeModel(res.data);
      setData(res.data);
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

  async function handleCommentUpvote(commentID) {
    try {
      const res = await axios.post(
        "http://localhost:8000/comments/upvote",
        { commentID },
        { withCredentials: true }
      );

      initializeModel(res.data);
      setData(res.data);
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

  async function handleCommentDownvote(commentID) {
    try {
      const res = await axios.post(
        "http://localhost:8000/comments/downvote",
        { commentID },
        { withCredentials: true }
      );

      initializeModel(res.data);
      setData(res.data);
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

  // Find post associated with postID
  const post = posts.find((post) => post.postID === postID);

  // Find community associated with post
  let communityName;
  communities.forEach((community) => {
    if (community.postIDs.includes(post.postID)) communityName = community.name;
  });

  // Retrieve link flair corresponding to post
  let linkFlair = linkFlairs.find(
    (linkFlair) => linkFlair.linkFlairID === post.linkFlairID
  );
  linkFlair = linkFlair === undefined ? "" : linkFlair.content;

  return (
    <div id="post-page" className="main">
      <div id="post-page-header">
        <div>
          <div>{communityName}</div>
          <div>&#8226;</div>
          <div>{generateTimestamp(post.postedDate)}</div>
        </div>
        <div>{post.postedBy}</div>
        <h2>{post.title}</h2>
        <div>{linkFlair}</div>
        <div>{post.content}</div>
        <div>
          <div>{post.views} Views</div>
          <div>&#8226;</div>
          <div>{getCommentCount(post, comments)} Comments</div>
          <div>&#8226;</div>
          <div>{post.upvoters.length - post.downvoters.length} Upvotes</div>
          {user === null && (
            <div>
              <button className="vote-button-grayed-out">&#8679;</button>
              <button className="vote-button-grayed-out">&#8681;</button>
            </div>
          )}
          {user !== null && user.reputation < 50 && (
            <div>
              <button className="vote-button-grayed-out">&#8679;</button>
              <button className="vote-button-grayed-out">&#8681;</button>
            </div>
          )}
          {user !== null && user.reputation >= 50 && (
            <div>
              <button
                className={
                  post.upvoters.includes(user.displayName)
                    ? "highlight"
                    : undefined
                }
                onClick={() => handlePostUpvote(post.postID)}
              >
                &#8679;
              </button>
              <button
                className={
                  post.downvoters.includes(user.displayName)
                    ? "highlight"
                    : undefined
                }
                onClick={() => handlePostDownvote(post.postID)}
              >
                &#8681;
              </button>
            </div>
          )}
        </div>
        {user !== null && (
          <button
            id="add-comment-button"
            onClick={() => handleReplyClick("post", post.postID, post.postID)}
          >
            Add a comment
          </button>
        )}
        {user === null && (
          <button id="add-comment-button-grayed-out">Add a comment</button>
        )}
      </div>

      <hr />

      <div id="comment-section">{getCommentReplies(post)}</div>
    </div>
  );

  /* --------------------- End of PostPage() component --------------------- */

  function getCommentReplies(rootComment) {
    // Create shallow copy of commentIDs
    const copyCommentIDs = rootComment.commentIDs.slice();

    // Sort comment replies by newest to oldest
    copyCommentIDs.sort((commentID1, commentID2) => {
      const comment1 = comments.find(
        (comment) => comment.commentID === commentID1
      );
      const comment2 = comments.find(
        (comment) => comment.commentID === commentID2
      );

      return comment2.commentedDate - comment1.commentedDate;
    });

    const commentReplies = []; // All replies to rootComment

    copyCommentIDs.forEach((commentID) => {
      // Find comment associated with commentID
      const commentReply = comments.find(
        (comment) => comment.commentID === commentID
      );

      // Wrap commentReply in a comment thread
      const commentThread = (
        <Fragment key={commentID}>
          <div className="comment-thread">
            <div className="comment">
              <div className="comment-header">
                <div>{commentReply.commentedBy}</div>
                <div>&#8226;</div>
                <div>{generateTimestamp(commentReply.commentedDate)}</div>
              </div>
              <div className="comment-content">{commentReply.content}</div>
              <span>
                {commentReply.upvoters.length - commentReply.downvoters.length}{" "}
                Upvotes
              </span>
              {user === null && (
                <>
                  <button className="vote-button-grayed-out">&#8679;</button>
                  <button className="vote-button-grayed-out">&#8681;</button>
                </>
              )}

              {user !== null && user.reputation < 50 && (
                <>
                  <button className="vote-button-grayed-out">&#8679;</button>
                  <button className="vote-button-grayed-out">&#8681;</button>
                </>
              )}

              {user !== null && user.reputation >= 50 && (
                <>
                  <button
                    className={
                      commentReply.upvoters.includes(user.displayName)
                        ? "highlight"
                        : undefined
                    }
                    onClick={() => handleCommentUpvote(commentReply.commentID)}
                  >
                    &#8679;
                  </button>
                  <button
                    className={
                      commentReply.downvoters.includes(user.displayName)
                        ? "highlight"
                        : undefined
                    }
                    onClick={() =>
                      handleCommentDownvote(commentReply.commentID)
                    }
                  >
                    &#8681;
                  </button>
                </>
              )}
              {user !== null && (
                <button
                  className="reply-button"
                  onClick={() =>
                    handleReplyClick("comment", commentID, post.postID)
                  }
                >
                  Reply
                </button>
              )}
              {user === null && (
                <button className="reply-button-grayed-out">Reply</button>
              )}
            </div>
            {getCommentReplies(commentReply)}
          </div>
        </Fragment>
      );

      // Append commentThread to commentReplies
      commentReplies.push(commentThread);
    });

    return commentReplies;
  }
}
