import sortCommunities from "../../helpers/community-helpers";

export default function Navbar({
  user,
  communities,
  mainContent,
  updateModelAndSetMainContent
}) {
  /**
   * Redirect the main content section to the home page after clicking on the
   * the home button on the navbar.
   */
  function handleHomeClick() {
    updateModelAndSetMainContent({view: "home-page", sort: "newest"});
  }

  /**
   * Redirect the main content section to the new community page after
   * clicking on the create community button on the navbar.
   */
  function handleCreateCommunityClick() {
    updateModelAndSetMainContent({view: "new-community-page"});
  }

  /**
   * Redirect the main content section to the community page of the community
   * clicked on in the navbar.
   */
  function handleCommunityClick(communityID) {
    updateModelAndSetMainContent({view: "community-page", communityID: communityID, sort: "newest"});
  }

  // Sort communities array so that communities user has joined are first
  const communitiesCopy = sortCommunities(user, communities);
  
  // Create new array of community elements
  const communityButtons = communitiesCopy.map((community) => {
    return (
      <div 
        key={community.communityID}
        className={"community" + (mainContent.view === "community-page" && mainContent.communityID === community.communityID ? " lightergray" : "")}
        onClick={() => handleCommunityClick(community.communityID)}
      >
        {community.name}
      </div>
    );
  });

  return (
    <>
      <div id="navbar">
        <div 
          id="home-button" 
          className={mainContent.view === "home-page" ? "reddit-orange" : "lightgray"} 
          onClick={handleHomeClick}
        >
          Home
        </div>
        <hr />
        <div id="community-section">
          <h2>COMMUNITIES</h2>
          <div 
            id={(user !== null) ? "create-community" : "create-community-grayed-out"} 
            className={mainContent.view === "new-community-page" ? "reddit-orange" : "lightgray"}
            onClick={(user !== null) ? handleCreateCommunityClick : null}
          >
            Create Community
          </div>
          <div id="community-list">{communityButtons}</div>
        </div>
      </div>
    </>
  );
}
