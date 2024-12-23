import { useState } from "react";
import axios from "axios";

export default function Banner({
  setView,
  user,
  mainContent,
  setMainContent,
  updateModelAndSetMainContent
}) {
  const [search, setSearch] = useState("");

  /**
   * Update the value of the search input on the search bar.
   */
  const handleSearchInput = (event) => {
    setSearch(event.target.value);
  };

  /**
   * Parse the input passed into the search bar and update the main content
   * section accordingly.
   */
  function handleEnterSearch(event) {
    const searchContent = search.trim();

    if (event.key === "Enter") {
      if (searchContent !== "")
        updateModelAndSetMainContent({view: "search-page", searchStr: search, sort: "newest"});

      setSearch("");
    }
  }

  /**
   * Redirect the whole page to the welcome page after clicking on the
   * phreddit logo on the banner.
   */
  function handlePhredditLogoClick() {
    setView("welcome-page");
  }

  /**
   * Redirect the main content section to the new post page after clicking
   * on the create post button on the banner.
   */
  function handleCreatePostClick() {
    updateModelAndSetMainContent({view: "new-post-page"});
  }

  /**
   * Redirect the main content section to the user profile page view after
   * clicking on the profile button on the banner.
   */
  function handleProfileClick() {
    if (user.adminStatus === false)
      updateModelAndSetMainContent({view: "user-profile-page", list: "posts"});
    else
      updateModelAndSetMainContent({view: "admin-profile-page", list: "users"});
  }

  /**
   * Send a GET request to the server to destroy the user's session after
   * clicking on the logout button.
   */
  async function handleLogoutClick() {
    try {
      const res = await axios.get("http://localhost:8000/users/logout",
        {withCredentials: true});
      console.log(res.data);
      setView("welcome-page");
    } catch (err) {
      setMainContent({
        ...mainContent,
        popUp: true,
        type: "error",
        message: "A network error has occurred."
      });
    }
  }

  return (
    <>
      <div id="banner">
        <h1 id="logo" onClick={handlePhredditLogoClick}>
          phreddit
        </h1>
        <input
          id="search"
          type="text"
          value={search}
          placeholder="Search Phreddit..."
          onChange={handleSearchInput}
          onKeyDown={handleEnterSearch}
        />
        <div id="navbar-right-side">
          <input
            id={(user !== null) ? "create-post" : "create-post-grayed-out"}
            type="button"
            value="Create Post"
            className={
              (mainContent.view === "new-post-page" ? "reddit-orange" : "lightergray")
            }
            onClick={(user !== null) ? handleCreatePostClick : null}
          />
          <input
            id={(user !== null) ? "user-profile" : "guest-profile"}
            type="button"
            value={(user !== null) ? user.displayName : "Guest"}
            className={
              (mainContent.view === "user-profile-page" ||
                mainContent.view === "admin-profile-page" ?
                "reddit-orange" : "lightergray")
            }
            onClick={(user !== null) ? handleProfileClick : null}
          />
          {(user !== null) && (
            <input
              id="logout-button"
              type="button"
              value="Logout"
              className="lightergray"
              onClick={handleLogoutClick}
            />
          )}
        </div>
      </div>
    </>
  );
}
