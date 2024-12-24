import { sortByNewest, sortByOldest, sortByActive } from "../../helpers/post-helpers.js";
import { getCommentCount } from "../../helpers/comment-helpers.js";
import { generateTimestamp } from "../../helpers/date-helpers.js";
import { initializeModel } from "../../helpers/model-helpers.js";
import { Fragment } from "react";
import axios from "axios";

export default function HomeCommunitySearchPage({
  data,
  setData,
  mainContent,
  setMainContent,
  updateModelAndSetMainContent
}) {
  // Create shallow copy of posts array, sorted depending on mainContent.sort
  const postsCopy = getHomeCommunitySearchPosts();
  if (mainContent.sort === "newest")
    sortByNewest(postsCopy);
  else if (mainContent.sort === "oldest")
    sortByOldest(postsCopy);
  else
    sortByActive(postsCopy, data.comments);

  /**
   * Return all posts, all community posts corresponding to the community
   * associated with communityID, or all posts corresponding to a specific
   * search result.
   */
  function getHomeCommunitySearchPosts() {
    if (mainContent.view === "community-page") return getCommunityPosts();
    else if (mainContent.view === "search-page") return getSearchPosts();

    // Return all posts if displaying home page
    return data.posts.slice();
  }

  /**
   * Return all community posts corresponding to the community associated with
   * communityID.
   */
  function getCommunityPosts() {
    const communityID = mainContent.communityID;

    // Find community associated with communityID
    const community = data.communities.find(
      (community) => community.communityID === communityID
    );

    // Get all posts of community
    const communityPosts = community.postIDs.map((postID) =>
      data.posts.find((post) => post.postID === postID)
    );

    return communityPosts;
  }

  /**
   * Return all posts corresponding to a specific search result.
   */
  function getSearchPosts() {
    const { posts, comments } = data;

    // Trims and splits all terms of the search string
    const searchTerms = mainContent.searchStr.trim().toLowerCase().split(/\s+/);

    // Array of relevant posts
    let searchPosts = [];

    posts.forEach((post) => {
      searchComments(post.commentIDs);

      searchTerms.forEach((searchTerm) => {
        if (
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm)
        ) {
          if (!searchPosts.includes(post)) {
            searchPosts.push(post);
          }
        }
      });

      function searchComments(commentArray) {
        if (commentArray.length !== 0) {
          commentArray.forEach((commentID) => {
            const subComment = comments.find(
              (comment) => commentID === comment.commentID
            );

            let commentTerms;
            comments.forEach((comment) => {
              if (commentID === comment.commentID) {
                commentTerms = comment.content.toLowerCase();
              }
            });

            searchTerms.forEach((searchTerm) => {
              if (commentTerms.includes(searchTerm)) {
                if (!searchPosts.includes(post)) {
                  searchPosts.push(post);
                }
              }
            });

            searchComments(subComment.commentIDs);
          });
        }
      }
    });

    return searchPosts;
  }

  /**
   * Sort posts by newest to oldest in the home page.
   */
  function handleNewestClick() {
    updateModelAndSetMainContent({...mainContent, sort: "newest"});
  }

  /**
   * Sort posts by oldest to newest in the home page.
   */
  function handleOldestClick() {
    updateModelAndSetMainContent({...mainContent, sort: "oldest"});
  }

  /**
   * Sort posts by the most recent to the least recent comment in the home page.
   */
  function handleActiveClick() {
    updateModelAndSetMainContent({...mainContent, sort: "active"});
  }

  /**
   * Add the user to the community when the user clicks on the join button. If
   * the community has been deleted by the time the user has done so, provide
   * error feedback.
   */
  async function handleJoin(communityID) {
    try {
      const res = await axios.post("http://localhost:8000/communities/join",
        {communityID: communityID}, {withCredentials: true});
      initializeModel(res.data);
      setData(res.data);
      console.log(res.data);
    } catch (err) {
      setMainContent({
        ...mainContent,
        popUp: true,
        type: "error",
        message: "A network error has occurred."
      });
    }
  }

  /**
   * Remove the user from the community when the user clicks on the leave
   * button. If the community has been deleted by the time the user has done so,
   * provide error feedback.
   */
  async function handleLeave(communityID) {
    try {
      const res = await axios.post("http://localhost:8000/communities/leave",
        {communityID: communityID}, {withCredentials: true});
      initializeModel(res.data);
      setData(res.data);
      console.log(res.data);
    } catch (err) {
      setMainContent({
        ...mainContent,
        popUp: true,
        type: "error",
        message: "A network error has occurred."
      });
    }
  }

  /**
   * After clicking on a post in the home, community, or search page:
   * - Increment the view count of the post with postID.
   * - Redirect the main content section to the post page associated with postID.
   */
  function handlePostClick(postID) {
    axios.post("http://localhost:8000/posts/updateViewCount", {postID: postID},
      {withCredentials: true}).then((res) => {
        initializeModel(res.data);
        setData(res.data);
        setMainContent({view: "post-page", postID: postID});
      }).catch((err) => {
        setMainContent({
          ...mainContent,
          popUp: true,
          type: "error",
          message: "A network error has occurred."
        });
      });
  }

  // Extract arrays from data
  const { user, communities, comments, linkFlairs } = data;

  // Find community associated with communityID (if in community page view)
  let community;
  if (mainContent.view === "community-page") {
    community = communities.find(
      (community) => community.communityID === mainContent.communityID
    );
  }

  /*
   * If main content section is home page or search page:
   *    If user is logged in, split post elements into posts from user's
   *    communities and posts NOT from user's communities and merge.
   *    If user is not logged in, show all posts from all communities.
   * 
   * If main content section is community page:
   *    Show all posts from specified community.
   */
  let postElements;
  if (mainContent.view === "home-page" || mainContent.view === "search-page") {
    // Compile communities user has joined if they are logged in
    let joinedCommunities = [];
    if (user !== null) { 
      joinedCommunities = communities.filter((community) => {
        return community.members.includes(user.displayName);
      });
    } 

    // Filter postsCopy down to posts from joinedCommunities
    const subbedPosts = postsCopy.filter((post) => {
      // Add post to subbedPosts if it belongs to one of the joinedCommunities
      for (let i = 0; i < joinedCommunities.length; i++) {
        if (joinedCommunities[i].postIDs.includes(post.postID))
          return true;
      }

      return false;
    });

    // Filter postsCopy down to posts NOT from joinedCommunities 
    const nonsubbedPosts = postsCopy.filter((post) => {
      // Add post to subbedPosts if it belongs to one of the joinedCommunities
      for (let i = 0; i < joinedCommunities.length; i++) {
        if (joinedCommunities[i].postIDs.includes(post.postID))
          return false;
      }

      return true;
    });

    const subbedPostElements = subbedPosts.map((post, index) => {
      // Find community name associated with post
      let communityName;
      communities.forEach((community) => {
        if (community.postIDs.includes(post.postID))
          communityName = community.name;
      });

      // Find link flair associated with post
      let linkFlair = linkFlairs.find(
        (linkFlair) => linkFlair.linkFlairID === post.linkFlairID
      );
      linkFlair = linkFlair === undefined ? "" : linkFlair.content;

      // Set horizontal rule under post to be sub-list demarcation if this is
      // last post in array and nonsubbedPosts is nonempty
      let horizontalRule = <hr />;
      if (index === subbedPosts.length - 1 && nonsubbedPosts.length > 0) {
        horizontalRule = (
          <div className="sub-list-demarcation">
            <span>OTHER COMMUNITIES</span>
          </div>
        );
      }

      return (
        <Fragment key={post.postID}>
          <div className="post" onClick={() => handlePostClick(post.postID)}>
            <div>
              <div>{communityName}</div>
              <div>&#8226;</div>
              <div>{post.postedBy}</div>
              <div>&#8226;</div>
              <div>{generateTimestamp(post.postedDate)}</div>
            </div>
            <div>{post.title}</div>
            <div>{linkFlair}</div>
            <div>{post.content.slice(0, 200).trim() + ((post.content.trim().length > 200) ? ". . ." : "")}</div>
            <div>
              <div>{post.views} Views</div>
              <div>{getCommentCount(post, comments)} Comments</div>
              <div>{post.upvoters.length - post.downvoters.length} Upvotes</div>
            </div>
          </div>
          {horizontalRule}
        </Fragment>
      );
    });

    const nonsubbedPostElements = nonsubbedPosts.map((post) => {
      // Find community name associated with post
      let communityName;
      communities.forEach((community) => {
        if (community.postIDs.includes(post.postID))
          communityName = community.name;
      });

      // Find link flair associated with post
      let linkFlair = linkFlairs.find(
        (linkFlair) => linkFlair.linkFlairID === post.linkFlairID
      );
      linkFlair = linkFlair === undefined ? "" : linkFlair.content;

      return (
        <Fragment key={post.postID}>
          <div className="post" onClick={() => handlePostClick(post.postID)}>
            <div>
              <div>{communityName}</div>
              <div>&#8226;</div>
              <div>{post.postedBy}</div>
              <div>&#8226;</div>
              <div>{generateTimestamp(post.postedDate)}</div>
            </div>
            <div>{post.title}</div>
            <div>{linkFlair}</div>
            <div>{post.content.slice(0, 200).trim() + ((post.content.trim().length > 200) ? ". . ." : "")}</div>
            <div>
              <div>{post.views} Views</div>
              <div>{getCommentCount(post, comments)} Comments</div>
              <div>{post.upvoters.length - post.downvoters.length} Upvotes</div>
            </div>
          </div>
          <hr />
        </Fragment>
      );
    });

    postElements = subbedPostElements.concat(nonsubbedPostElements);
  } else {
    postElements = postsCopy.map((post) => {
      // Find link flair associated with post
      let linkFlair = linkFlairs.find(
        (linkFlair) => linkFlair.linkFlairID === post.linkFlairID
      );
      linkFlair = linkFlair === undefined ? "" : linkFlair.content;
  
      return (
        <Fragment key={post.postID}>
          <div className="post" onClick={() => handlePostClick(post.postID)}>
            <div>
              <div>{post.postedBy}</div>
              <div>&#8226;</div>
              <div>{generateTimestamp(post.postedDate)}</div>
            </div>
            <div>{post.title}</div>
            <div>{linkFlair}</div>
            <div>{post.content.slice(0, 200).trim() + ((post.content.trim().length > 200) ? ". . ." : "")}</div>
            <div>
              <div>{post.views} Views</div>
              <div>{getCommentCount(post, comments)} Comments</div>
              <div>{post.upvoters.length - post.downvoters.length} Upvotes</div>
            </div>
          </div>
          <hr />
        </Fragment>
      );
    });
  }

  return (
    <div id="home-page" className="main">
      <div id="home-page-header">
        {mainContent.view === "home-page" && <div id="all-posts">All Posts</div>}
        {mainContent.view === "community-page" && (
          <div id="all-posts">{community.name}</div>
        )}
        {mainContent.view === "search-page" && postsCopy.length > 0 && (
          <div id="all-posts">Results for: {mainContent.searchStr}</div>
        )}
        {mainContent.view === "search-page" && postsCopy.length === 0 && (
          <div id="all-posts">No results found for: {mainContent.searchStr}</div>
        )}
        <button
          id="button-newest"
          className={mainContent.sort === "newest" ? "lightergray" : "clear"}
          onClick={handleNewestClick}
        >
          Newest
        </button>
        <button
          id="button-oldest"
          className={mainContent.sort === "oldest" ? "lightergray" : "clear"}
          onClick={handleOldestClick}
        >
          Oldest
        </button>
        <button
          id="button-active"
          className={mainContent.sort === "active" ? "lightergray" : "clear"}
          onClick={handleActiveClick}
        >
          Active
        </button>
      </div>
      <div id="post-info">
        {(mainContent.view === "home-page" || mainContent.view === "search-page") &&
          `${postsCopy.length} Posts`}
        {mainContent.view === "community-page" && (
          <>
            <p>{community.description}</p>
            <div id="community-name-time">
              <p>Created by {community.creator}</p>
              <div>&#8226;</div>
              <p>Created {generateTimestamp(community.startDate)}</p>
            </div>
            <div id="community-info">
              <p>{postsCopy.length} Posts</p>
              <div>&#8226;</div>
              <p>{community.memberCount} Members</p>
            </div>
            {user !== null && !community.members.includes(user.displayName) && (
              <button 
                id="join-leave-button"
                onClick={() => handleJoin(community.communityID)}
              >
                Join
              </button>
            )}
            {user !== null && community.members.includes(user.displayName) && (
              <button 
                id="join-leave-button"
                onClick={() => handleLeave(community.communityID)}
              >
                Leave
              </button>
            )}
          </>
        )}
      </div>
      <hr />
      <div id="post-section">{postElements}</div>
    </div>
  );
}
