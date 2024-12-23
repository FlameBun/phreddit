import { useState } from "react";
import axios from "axios";
import { initializeModel } from "../../helpers/model-helpers";

export default function NewCommentPage({
  comments,
  setData,
  mainContent,
  setMainContent,
}) {
  // Input states
  const [inputs, setInputs] = useState(initializeInputs());

  // Error states
  const [errors, setErrors] = useState({
    commentContentError: "",
  });

  /**
   * Return empty inputs if this is the new comment page. Otherwise, return
   * the comment content corresponding to mainContent.commentID for the edit
   * comment page.
   */
  function initializeInputs() {
    if (mainContent.view === "new-comment-page") return { content: "" };

    const comment = comments.find((comment) => {
      return comment.commentID === mainContent.commentID;
    });
    return { content: comment.content };
  }

  // Comment content input
  const handleCommentContent = (event) => {
    const copyInputs = {
      ...inputs,
      content: event.target.value,
    };
    setInputs(copyInputs);
  };

  // Handle click on Submit Comment button
  function onSubmitCommentClick() {
    const copyErrors = {
      ...errors,
    };

    axios
      .post(
        "http://localhost:8000/comments/addComment",
        {
          ...inputs,
          replyType: mainContent.replyType,
          replyID: mainContent.replyID,
        },
        { withCredentials: true }
      )
      .then((res) => {
        const { data } = res;
        initializeModel(data);
        setData(data);
        setMainContent({
          view: "post-page",
          postID: mainContent.redirectPostID,
        });
      })
      .catch((err) => {
        if (err.code === "ERR_NETWORK" || err.status === 403) {
          setMainContent({
            ...mainContent,
            popUp: true,
            type: "error",
            message: "A communication error has occurred."
          });
          return;
        }

        const { commentContentError } = err.response.data;

        // Comment content error
        if (commentContentError !== "") {
          copyErrors.commentContentError = (
            <>
              <i className="fa-solid fa-circle-exclamation"></i>{" "}
              {commentContentError}
            </>
          );
        } else {
          copyErrors.commentContentError = "";
        }

        setErrors(copyErrors);
      });
  }

  // Handle click on Edit Comment button
  async function handleEditComment() {
    const commentID = mainContent.commentID;
    try {
      const res = await axios.post(
        "http://localhost:8000/comments/update",
        { inputs, commentID },
        { withCredentials: true }
      );

      const { data } = res;
      initializeModel(data);
      setData(data);
      setMainContent({
        ...mainContent,
        view: mainContent.redirectBackTo,
        list: "comments",
      });
    } catch (err) {
      if (err.code === "ERR_NETWORK" || err.status === 403) {
        setMainContent({
          ...mainContent,
          popUp: true,
          type: "error",
          message: "A communication error has occurred."
        });
        return;
      }

      const copyErrors = {
        ...errors,
      };

      const { commentContentError } = err.response.data;

      // Comment content error
      if (commentContentError !== "") {
        copyErrors.commentContentError = (
          <>
            <i className="fa-solid fa-circle-exclamation"></i>{" "}
            {commentContentError}
          </>
        );
      } else {
        copyErrors.commentContentError = "";
      }

      setErrors(copyErrors);
    }
  }

  return (
    <div id="new-comment" className="main">
      <div className="input-container">
        <div className="label">
          <label htmlFor="comment-content">Content: </label>
          <span>*</span>
        </div>
        <textarea
          type="text"
          className="input"
          id="comment-content"
          value={inputs.content}
          onChange={handleCommentContent}
        ></textarea>
        <div className="input-error" id="comment-content-error">
          {errors.commentContentError}
        </div>
      </div>
      {mainContent.view === "new-comment-page" && (
        <input
          type="submit"
          value="Submit Comment"
          id="submit-comment"
          onClick={onSubmitCommentClick}
        />
      )}
      {mainContent.view === "edit-comment-page" && (
        <input
          type="submit"
          value="Edit Comment"
          id="submit-comment"
          onClick={handleEditComment}
        />
      )}
    </div>
  );
}
