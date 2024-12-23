import { useState } from "react";
import axios from "axios";
import { initializeModel } from "../../helpers/model-helpers.js";
import sortCommunities from "../../helpers/community-helpers.js";

export default function NewPostPage({
  data,
  setData,
  mainContent,
  setMainContent,
}) {
  // Input state
  const [inputs, setInputs] = useState(initializeInputs());

  // Error states
  const [errors, setErrors] = useState({
    selectCommunityError: "",
    postTitleError: "",
    linkFlairError: "",
    postContentError: "",
  });

  // Extract arrays from data
  const { user, communities, linkFlairs } = data;

  /**
   * Return empty inputs if this is the new post page. Otherwise, return
   * the post title, link flair, and content corresponding to mainContent.postID
   * for the edit post page.
   */
  function initializeInputs() {
    if (mainContent.view === "new-post-page") {
      return {
        community: "",
        title: "",
        chooseFlair: "",
        enterFlair: "",
        body: "",
      };
    }

    const post = data.posts.find((post) => {
      return post.postID === mainContent.postID;
    });
    const linkFlair = data.linkFlairs.find((linkFlair) => {
      return linkFlair.linkFlairID === post.linkFlairID;
    });
    return {
      title: post.title,
      chooseFlair: linkFlair !== undefined ? linkFlair.content : "",
      enterFlair: "",
      body: post.content,
    };
  }

  // Select community input
  const handleSelectCommunity = (event) => {
    const copyInputs = {
      ...inputs,
      community: event.target.value,
    };
    setInputs(copyInputs);
  };

  // Title input
  const handleCommunityTitle = (event) => {
    const copyInputs = {
      ...inputs,
      title: event.target.value,
    };
    setInputs(copyInputs);
  };

  // Select linkflalir input
  const handleSelectLinkFlair = (event) => {
    const copyInputs = {
      ...inputs,
      chooseFlair: event.target.value,
    };
    setInputs(copyInputs);
  };

  // Enter linkflair input
  const handleEnterLinkFlair = (event) => {
    const copyInputs = {
      ...inputs,
      enterFlair: event.target.value,
    };
    setInputs(copyInputs);
  };

  // Body input
  const handleBody = (event) => {
    const copyInputs = {
      ...inputs,
      body: event.target.value,
    };
    setInputs(copyInputs);
  };

  // Submit Post Click
  function onSubmitPostClick() {
    const copyErrors = {
      ...errors,
    };

    axios
      .post("http://localhost:8000/posts/addPost", inputs, {
        withCredentials: true,
      })
      .then((res) => {
        const { data } = res;
        initializeModel(data);
        setData(data);
        setMainContent({
          view: "home-page",
          sort: "newest",
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

        const {
          selectCommunityError,
          postTitleError,
          linkFlairError,
          postContentError,
        } = err.response.data;

        // Select community error
        if (selectCommunityError !== "") {
          copyErrors.selectCommunityError = (
            <>
              <i className="fa-solid fa-circle-exclamation"></i>{" "}
              {selectCommunityError}
            </>
          );
        } else {
          copyErrors.selectCommunityError = "";
        }

        // Post title error
        if (postTitleError !== "") {
          copyErrors.postTitleError = (
            <>
              <i className="fa-solid fa-circle-exclamation"></i>{" "}
              {postTitleError}
            </>
          );
        } else {
          copyErrors.postTitleError = "";
        }

        // Link flair error
        if (linkFlairError !== "") {
          copyErrors.linkFlairError = (
            <>
              <i className="fa-solid fa-circle-exclamation"></i>{" "}
              {linkFlairError}
            </>
          );
        } else {
          copyErrors.linkFlairError = "";
        }

        // Post content error
        if (postContentError !== "") {
          copyErrors.postContentError = (
            <>
              <i className="fa-solid fa-circle-exclamation"></i>{" "}
              {postContentError}
            </>
          );
        } else {
          copyErrors.postContentError = "";
        }

        setErrors(copyErrors);
      });
  }

  // Edit Post Click
  async function handleEditPost() {
    const postID = mainContent.postID;
    try {
      const res = await axios.post(
        "http://localhost:8000/posts/update",
        { inputs, postID },
        { withCredentials: true }
      );

      const { data } = res;
      initializeModel(data);
      setData(data);
      setMainContent({ ...mainContent, view: mainContent.redirectBackTo, list: "posts" });
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

      const { postTitleError, linkFlairError, postContentError } =
        err.response.data;

      // Post title error
      if (postTitleError !== "") {
        copyErrors.postTitleError = (
          <>
            <i className="fa-solid fa-circle-exclamation"></i> {postTitleError}
          </>
        );
      } else {
        copyErrors.postTitleError = "";
      }

      // Link flair error
      if (linkFlairError !== "") {
        copyErrors.linkFlairError = (
          <>
            <i className="fa-solid fa-circle-exclamation"></i> {linkFlairError}
          </>
        );
      } else {
        copyErrors.linkFlairError = "";
      }

      // Post content error
      if (postContentError !== "") {
        copyErrors.postContentError = (
          <>
            <i className="fa-solid fa-circle-exclamation"></i>{" "}
            {postContentError}
          </>
        );
      } else {
        copyErrors.postContentError = "";
      }

      setErrors(copyErrors);
    }
  }

  // Sort by communities user has joined first and by alphabetical order
  const communitiesCopy = sortCommunities(user, communities);

  // Sort link flairs by alphabetical order
  const linkFlairsCopy = linkFlairs.slice().sort((lf1, lf2) => {
    const str1 = lf1.content.toLowerCase();
    const str2 = lf2.content.toLowerCase();

    if (str1 < str2) return -1; // str1 comes first
    else if (str1 > str2) return 1; // str2 comes first
    else return 0; // Identical strings
  });

  return (
    <div id="new-post" className="main">
      <div>
        {mainContent.view === "new-post-page" ? "Create Post" : "Edit Post"}
      </div>

      {mainContent.view === "new-post-page" && (
        <div className="input-container">
          <select
            name="community"
            id="select-community"
            onChange={handleSelectCommunity}
          >
            <option value="">Select a Community</option>
            {communitiesCopy.map((community) => (
              <option key={community.communityID}>{community.name}</option>
            ))}
          </select>
          <div className="input-error" id="select-community-error">
            {errors.selectCommunityError}
          </div>
        </div>
      )}

      <div className="input-container">
        <div className="label">
          <label htmlFor="post-title">Title: </label>
          <span>*</span>
        </div>
        <input
          type="text"
          className="input"
          id="post-title"
          value={inputs.title}
          onChange={handleCommunityTitle}
        />
        <div className="input-error" id="post-title-error">
          {errors.postTitleError}
        </div>
      </div>

      <div className="input-container">
        <label htmlFor="select-link-flair">Add flair: </label>
        <select
          name="linkflairs"
          id="select-link-flair"
          value={inputs.chooseFlair}
          onChange={handleSelectLinkFlair}
        >
          <option value="">Add a Flair</option>
          {linkFlairsCopy.map((linkFlair) => (
            <option key={linkFlair.linkFlairID}>{linkFlair.content}</option>
          ))}
        </select>
        <input
          type="text"
          className="input"
          id="enter-link-flair"
          onChange={handleEnterLinkFlair}
        />
        <div className="input-error" id="link-flair-error">
          {errors.linkFlairError}
        </div>
      </div>

      <div className="input-container">
        <div className="label">
          <label htmlFor="post-content">Body: </label>
          <span>*</span>
        </div>
        <textarea
          name="body"
          className="input"
          id="post-content"
          value={inputs.body}
          onChange={handleBody}
        ></textarea>
        <div className="input-error" id="post-content-error">
          {errors.postContentError}
        </div>
      </div>

      {mainContent.view === "new-post-page" && (
        <input
          type="submit"
          value="Submit Post"
          id="submit-post"
          onClick={onSubmitPostClick}
        />
      )}
      {mainContent.view === "edit-post-page" && (
        <input
          type="submit"
          value="Edit Post"
          id="submit-post"
          onClick={handleEditPost}
        />
      )}
    </div>
  );
}
