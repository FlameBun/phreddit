import { useState } from "react";
import axios from "axios";
import { initializeModel } from "../../helpers/model-helpers.js";

export default function NewCommunityPage({
  communities,
  setData,
  mainContent,
  setMainContent,
}) {
  // Input state
  const [inputs, setInputs] = useState(initializeInputs());

  // Error state
  const [errors, setErrors] = useState({
    communityNameError: "",
    communityDescError: "",
  });

  /**
   * Return empty inputs if this is the new community page. Otherwise, return
   * the community name and description corresponding to mainContent.communityID
   * for the edit community page.
   */
  function initializeInputs() {
    if (mainContent.view === "new-community-page") {
      return {
        community: "",
        description: "",
      };
    }

    const community = communities.find((community) => {
      return community.communityID === mainContent.communityID;
    });
    return {
      community: community.name,
      description: community.description,
    };
  }

  // Community name input
  const handleCommunityName = (event) => {
    const copyInputs = {
      ...inputs,
      community: event.target.value,
    };
    setInputs(copyInputs);
  };

  // Community description input
  const handleCommunityDesc = (event) => {
    const copyInputs = {
      ...inputs,
      description: event.target.value,
    };
    setInputs(copyInputs);
  };

  // Engender community click
  function onEngenderCommunityClick() {
    const copyErrors = {
      ...errors,
    };

    axios
      .post("http://localhost:8000/communities/addCommunity", inputs, {
        withCredentials: true,
      })
      .then((res) => {
        const { data, communityID } = res.data;
        initializeModel(data);
        setData(data);
        setMainContent({
          view: "community-page",
          communityID: communityID,
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

        const { communityNameError, communityDescError } = err.response.data;

        if (communityNameError !== "") {
          copyErrors.communityNameError = (
            <>
              <i className="fa-solid fa-circle-exclamation"></i>{" "}
              {communityNameError}
            </>
          );
        } else {
          copyErrors.communityNameError = "";
        }

        if (communityDescError !== "") {
          copyErrors.communityDescError = (
            <>
              <i className="fa-solid fa-circle-exclamation"></i>{" "}
              {communityDescError}
            </>
          );
        } else {
          copyErrors.communityDescError = "";
        }

        setErrors(copyErrors);
      });
  }

  // Edit community
  async function handleEditCommunity() {
    const communityID = mainContent.communityID;
    try {
      const res = await axios.post(
        "http://localhost:8000/communities/update",
        { inputs, communityID },
        { withCredentials: true }
      );

      const { data } = res;
      initializeModel(data);
      setData(data);
      setMainContent({
        ...mainContent,
        view: mainContent.redirectBackTo,
        list: "communities",
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

      const { communityNameError, communityDescError } = err.response.data;
      const copyErrors = { ...errors };

      if (communityNameError !== "") {
        copyErrors.communityNameError = (
          <>
            <i className="fa-solid fa-circle-exclamation"></i>{" "}
            {communityNameError}
          </>
        );
      } else {
        copyErrors.communityNameError = "";
      }

      if (communityDescError !== "") {
        copyErrors.communityDescError = (
          <>
            <i className="fa-solid fa-circle-exclamation"></i>{" "}
            {communityDescError}
          </>
        );
      } else {
        copyErrors.communityDescError = "";
      }

      setErrors(copyErrors);
    }
  }

  return (
    <div id="new-community" className="main">
      <div className="input-container">
        <div className="label">
          <label htmlFor="community-name">Community Name: </label>
          <span>*</span>
        </div>
        <input
          type="text"
          className="input"
          id="community-name"
          value={inputs.community}
          onChange={handleCommunityName}
        />
        <div className="input-error" id="community-name-error">
          {errors.communityNameError}
        </div>
      </div>

      <div className="input-container">
        <div className="label">
          <label htmlFor="community-desc"> Description: </label>
          <span>*</span>
        </div>
        <textarea
          name="Community Description"
          className="input"
          id="community-desc"
          value={inputs.description}
          onChange={handleCommunityDesc}
        ></textarea>
        <div className="input-error" id="community-desc-error">
          {errors.communityDescError}
        </div>
      </div>
      {mainContent.view === "new-community-page" && (
        <input
          type="submit"
          value="Engender Community"
          id="engender-community"
          onClick={onEngenderCommunityClick}
        />
      )}
      {mainContent.view === "edit-community-page" && (
        <input
          type="submit"
          value="Edit Community"
          id="engender-community"
          onClick={handleEditCommunity}
        />
      )}
    </div>
  );
}
