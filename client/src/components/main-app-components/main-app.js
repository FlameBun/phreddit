import Banner from "./banner.js";
import Navbar from "./navbar.js";
import UserProfilePage from "./user-profile-page.js";
import AdminProfilePage from "./admin-profile-page.js"
import HomeCommunitySearchPage from "./home-community-search-page.js";
import PostPage from "./post-page.js";
import NewPostPage from "./new-post-page.js";
import NewCommunityPage from "./new-community-page.js";
import NewCommentPage from "./new-comment-page.js";
import PopUp from "./pop-up.js";
import { initializeModel } from "../../helpers/model-helpers.js";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MainApp({ setView }) {
  const [data, setData] = useState({
    communities: [],
    linkFlairs: [],
    posts: [],
    comments: [],
  });
  const [mainContent, setMainContent] = useState({ view: "empty-page" });
  const [counter, setCounter] = useState(0); // Counter to reset component state

  /**
   * Update the current model with the updated model from the server and set
   * the main content view according to nextContent.
   */
  async function updateModelAndSetMainContent(nextContent) {
    try {
      const res = await axios.get("http://localhost:8000/data", {
        withCredentials: true,
      });
      initializeModel(res.data); // Reconfigure updated model
      setData(res.data); // Update current model with updated model
      setMainContent(nextContent);
      setCounter((counter) => counter + 1);

      console.log(res.data);
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

  // Send initial request to server for model data
  useEffect(() => {
    updateModelAndSetMainContent({ view: "home-page", sort: "newest" });
  }, []);

  // Show an empty page until phreddit data is received and loaded in
  if (mainContent.view === "empty-page") return null;

  // Determine the main content view
  let mainContentComponent;
  if (mainContent.view === "user-profile-page")
    mainContentComponent = (
      <UserProfilePage
        data={data}
        setData={setData}
        mainContent={mainContent}
        setMainContent={setMainContent}
        updateModelAndSetMainContent={updateModelAndSetMainContent}
      />
    );
  else if (mainContent.view === "admin-profile-page")
    mainContentComponent = (
      <AdminProfilePage
        data={data}
        setData={setData}
        mainContent={mainContent}
        setMainContent={setMainContent}
        updateModelAndSetMainContent={updateModelAndSetMainContent}
      />
    );
  else if (
    mainContent.view === "home-page" ||
    mainContent.view === "community-page" ||
    mainContent.view === "search-page"
  )
    mainContentComponent = (
      <HomeCommunitySearchPage
        data={data}
        setData={setData}
        mainContent={mainContent}
        setMainContent={setMainContent}
        updateModelAndSetMainContent={updateModelAndSetMainContent}
      />
    );
  else if (mainContent.view === "post-page")
    mainContentComponent = (
      <PostPage
        postID={mainContent.postID}
        data={data}
        setData={setData}
        setMainContent={setMainContent}
      />
    );
  else if (
    mainContent.view === "new-post-page" ||
    mainContent.view === "edit-post-page"
  )
    mainContentComponent = (
      <NewPostPage
        key={counter}
        data={data}
        setData={setData}
        mainContent={mainContent}
        setMainContent={setMainContent}
      />
    );
  else if (
    mainContent.view === "new-community-page" ||
    mainContent.view === "edit-community-page"
  )
    mainContentComponent = (
      <NewCommunityPage
        key={counter}
        communities={data.communities}
        setData={setData}
        mainContent={mainContent}
        setMainContent={setMainContent}
      />
    );
  else if (
    mainContent.view === "new-comment-page" ||
    mainContent.view === "edit-comment-page"
  )
    mainContentComponent = (
      <NewCommentPage
        comments={data.comments}
        setData={setData}
        mainContent={mainContent}
        setMainContent={setMainContent}
      />
    );

  return (
    <>
      <Banner
        setView={setView}
        user={data.user}
        mainContent={mainContent}
        setMainContent={setMainContent}
        updateModelAndSetMainContent={updateModelAndSetMainContent}
      />
      <Navbar
        user={data.user}
        communities={data.communities}
        mainContent={mainContent}
        updateModelAndSetMainContent={updateModelAndSetMainContent}
      />
      {mainContentComponent}
      {mainContent.popUp !== undefined && (
        <PopUp
          setView={setView}
          mainContent={mainContent}
          setMainContent={setMainContent}
          onConfirmation={mainContent.confirmationHandler}
        />
      )}
    </>
  );
}
