// Community Helper Functions

/**
 * Sort the communities array by alphabetical order and by which communities
 * the user has joined. The first communities in the array should be the
 * communities the user has joined, if they have joined any. This function
 * returns a new sorted community array without modifying the original.
 */
export default function sortCommunities(user, communities) {
  // Make copy of array and sort communities alphabetically
  communities = communities.slice().sort(compareCommunityNames);
  
  // Return new sorted communities array if user is a guest
  if (user === null)
    return communities;

  const { displayName } = user;

  // Construct two lists of communities user has joined and not joined
  const joinedCommunities = [];
  const notJoinedCommunities = [];
  communities.forEach((community) => {
    if (community.members.includes(displayName))
      joinedCommunities.push(community);
    else
      notJoinedCommunities.push(community);
  });

  // Concatenate the two lists
  return joinedCommunities.concat(notJoinedCommunities);
}

/**
 * Return -1 if str1 comes first alphabetically, 1 if str2 comes first
 * alphabetically, or 0 if the two strings are identical.
 */
function compareCommunityNames(community1, community2) {
  const str1 = community1.name.toLowerCase();
  const str2 = community2.name.toLowerCase();

  if (str1 < str2)
    return -1; // str1 comes first
  else if (str1 > str2)
    return 1; // str2 comes first
  else
    return 0; // Identical strings
}
