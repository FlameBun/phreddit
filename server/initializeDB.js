const mongoose = require("mongoose");
const CommunityModel = require("./models/communities");
const PostModel = require("./models/posts");
const CommentModel = require("./models/comments");
const LinkFlairModel = require("./models/linkflairs");
const UserModel = require("./models/users");
const bcrypt = require("bcrypt");

let userArgs = process.argv.slice(2);

mongoose.connect("mongodb://127.0.0.1:27017/phreddit");
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

function createLinkFlair(linkFlairObj) {
  let newLinkFlairDoc = new LinkFlairModel({
    content: linkFlairObj.content,
  });
  return newLinkFlairDoc.save();
}

function createComment(commentObj) {
  let newCommentDoc = new CommentModel({
    content: commentObj.content,
    commentedBy: commentObj.commentedBy,
    commentedDate: commentObj.commentedDate,
    commentIDs: commentObj.commentIDs,
    upvoters: commentObj.upvoters,
    downvoters: commentObj.downvoters,
  });
  return newCommentDoc.save();
}

function createPost(postObj) {
  let newPostDoc = new PostModel({
    title: postObj.title,
    content: postObj.content,
    postedBy: postObj.postedBy,
    postedDate: postObj.postedDate,
    views: postObj.views,
    linkFlairID: postObj.linkFlairID,
    commentIDs: postObj.commentIDs,
    upvoters: postObj.upvoters,
    downvoters: postObj.downvoters,
  });
  return newPostDoc.save();
}

function createCommunity(communityObj) {
  let newCommunityDoc = new CommunityModel({
    name: communityObj.name,
    description: communityObj.description,
    postIDs: communityObj.postIDs,
    startDate: communityObj.startDate,
    members: communityObj.members,
    creator: communityObj.creator
  });
  return newCommunityDoc.save();
}

function createUser(userObj) {
  let newUserDoc = new UserModel({
    adminStatus: userObj.adminStatus,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    email: userObj.email,
    displayName: userObj.displayName,
    passwordHash: userObj.passwordHash,
    startDate: userObj.startDate,
    reputation: userObj.reputation,
  });
  return newUserDoc.save();
}

async function initializeDB() {
  // Link flair objects
  const linkFlair1 = {
    // Link flair 1
    content: "Group of Jerks"
  };
  const linkFlair2 = {
    // Link flair 2
    content: "Talented Learner"
  };
  const linkFlair3 = {
    // Link flair 3
    content: "Among Us"
  };
  const linkFlair4 = {
    // Link flair 4
    content: "Egotist"
  };
  let linkFlairRef1 = await createLinkFlair(linkFlair1);
  let linkFlairRef2 = await createLinkFlair(linkFlair2);
  let linkFlairRef3 = await createLinkFlair(linkFlair3);
  let linkFlairRef4 = await createLinkFlair(linkFlair4);

  // Comment objects
  const comment12 = {
    // Comment 12
    content: "Interested. Check your email.",
    commentIDs: [],
    commentedBy: "Cat13",
    commentedDate: new Date("December 17, 2024 23:36:22"),
    upvoters: [],
    downvoters: [],
  }
  let commentRef12 = await createComment(comment12);

  const comment11 = {
    // Comment 11
    content: "Let's do this! Red Bull and Monster Energy every day, baby.",
    commentIDs: [],
    commentedBy: "BigFeet",
    commentedDate: new Date("December 13, 2024 01:30:00"),
    upvoters: [],
    downvoters: [],
  }
  let commentRef11 = await createComment(comment11);

  const comment10 = {
    // Comment 10
    content: "How can you enjoy seeing colored manga panels? Anime is supposed to portray motion, and this adaptation shows none of that.",
    commentIDs: [],
    commentedBy: "RankOneTrucker",
    commentedDate: new Date("October 25, 2024 08:30:00"),
    upvoters: ["Astyanax", "RankOneTrucker"],
    downvoters: [],
  }
  let commentRef10 = await createComment(comment10);

  const comment9 = {
    // Comment 9
    content: "You must be delusional and blind then.",
    commentIDs: [],
    commentedBy: "Astyanax",
    commentedDate: new Date("October 25, 2024 07:20:20"),
    upvoters: ["Astyanax", "RankOneTrucker"],
    downvoters: [],
  }
  let commentRef9 = await createComment(comment9);

  const comment8 = {
    // Comment 8
    content: "I think you're a hater. It looks fine to me and I enjoy it.",
    commentIDs: [commentRef9, commentRef10],
    commentedBy: "Cat13",
    commentedDate: new Date("October 25, 2024 05:00:00"),
    upvoters: ["Rollo", "Shemp", "Cat13"],
    downvoters: ["Astyanax", "RankOneTrucker"],
  };
  let commentRef8 = await createComment(comment8);

  const comment7 = {
    // Comment 7
    content: "I want to believe too! Let's do this!!!",
    commentIDs: [],
    commentedBy: "BigFeet",
    commentedDate: new Date("September 10, 2024 09:43:00"),
    upvoters: [],
    downvoters: [],
  };
  let commentRef7 = await createComment(comment7);

  const comment6 = {
    // Comment 6
    content: "I want to believe.",
    commentIDs: [commentRef7],
    commentedBy: "OutTheTruth47",
    commentedDate: new Date("September 10, 2024 07:18:00"),
    upvoters: [],
    downvoters: [],
  };
  let commentRef6 = await createComment(comment6);

  const comment5 = {
    // Comment 5
    content:
      "The same thing happened to me. I guess this channel does still show real history.",
    commentIDs: [],
    commentedBy: "BigFeet",
    commentedDate: new Date("September 09, 2024 017:03:00"),
    upvoters: [],
    downvoters: [],
  };
  let commentRef5 = await createComment(comment5);

  const comment4 = {
    // Comment 4
    content: "The truth is out there.",
    commentIDs: [commentRef6],
    commentedBy: "Astyanax",
    commentedDate: new Date("September 10, 2024 6:41:00"),
    upvoters: [],
    downvoters: [],
  };
  let commentRef4 = await createComment(comment4);

  const comment3 = {
    // Comment 3
    content: "My brother in Christ, are you ok? Also, YTJ.",
    commentIDs: [],
    commentedBy: "Rollo",
    commentedDate: new Date("August 23, 2024 09:31:00"),
    upvoters: ["Cat13"],
    downvoters: [],
  };
  let commentRef3 = await createComment(comment3);

  const comment2 = {
    // Comment 2
    content:
      "Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave is in peace. YTJ.",
    commentIDs: [],
    commentedBy: "Astyanax",
    commentedDate: new Date("August 23, 2024 10:57:00"),
    upvoters: ["BigFeet"],
    downvoters: [],
  };
  let commentRef2 = await createComment(comment2);

  const comment1 = {
    // Comment 1
    content:
      "There is no higher calling than the protection of Tesla products. God bless you sir and God bless Elon Musk. Oh, NTJ.",
    commentIDs: [commentRef3],
    commentedBy: "Shemp",
    commentedDate: new Date("August 23, 2024 08:22:00"),
    upvoters: [],
    downvoters: [],
  };
  let commentRef1 = await createComment(comment1);

  // Post objects
  const post1 = {
    // Post 1
    title:
      "AITJ: I parked my cybertruck in the handicapped spot to protect it from bitter, jealous losers.",
    content:
      "Recently I went to the store in my brand new Tesla cybertruck. I know there are lots of haters out there, so I wanted to make sure my truck was protected. So I parked it so it overlapped with two of those extra-wide handicapped spots. When I came out of the store with my beef jerky some Karen in a wheelchair was screaming at me. So tell me phreddit, was I the jerk?",
    linkFlairID: linkFlairRef1,
    postedBy: "RankOneTrucker",
    postedDate: new Date("August 23, 2024 01:19:00"),
    commentIDs: [commentRef1, commentRef2],
    views: 14,
    upvoters: ["Shemp"],
    downvoters: [],
  };
  const post2 = {
    // Post 2
    title: "Remember when this was a HISTORY channel?",
    content:
      'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do. But, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
    linkFlairID: linkFlairRef3,
    postedBy: "MarcoArelius",
    postedDate: new Date("September 9, 2024 14:24:00"),
    commentIDs: [commentRef4, commentRef5],
    views: 1023,
    upvoters: ["OutTheTruth47"],
    downvoters: [],
  };
  const post3 = {
    // Post 3
    title: "Blue Lock is not it.",
    content: "How is it so bad? The whole anime is just a slideshow. It's over for the Blue Lock anime.",
    linkFlairID: linkFlairRef4,
    postedBy: "BigFeet",
    postedDate: new Date("October 24, 2024 13:57:00"),
    commentIDs: [commentRef8],
    views: 420,
    upvoters: [],
    downvoters: [],
  };
  const post4 = {
    // Post 4
    title: "Good luck on finals week everyone!",
    content: "Finals week is here at least. I am going to lose at least 2 years of my life span from all the all-nighters I'm going to pull when studying for my CS exams this week. Please SEND HELP.",
    linkFlairID: linkFlairRef2,
    postedBy: "Rollo",
    postedDate: new Date("December 12, 2024 10:13:00"),
    commentIDs: [commentRef11],
    views: 110,
    upvoters: ["Rollo", "Shemp"],
    downvoters: [],
  };
  const post5 = {
    // Post 5
    title: "Selling ASUS monitor before leaving",
    content: "I am graduating and am moving back to Korea. I'm selling my ASUS monitor for $200. It is 1440p, 144hz, and is an IPS panel with 1ms response time. Email me at blingbling11@gmail.com if you're interested.",
    linkFlairID: null,
    postedBy: "MarcoArelius",
    postedDate: new Date("December 14, 2024 16:55:00"),
    commentIDs: [commentRef12],
    views: 21,
    upvoters: ["Cat13"],
    downvoters: [],
  };
  const post6 = {
    // Post 6
    title: "AITJ: I poured in the milk before the cereal for my son's breakfast",
    content: "I was making my young son of five years old some cereal for breakfast, but all of a sudden, he started crying. I asked him what was wrong, and he told me he was upset because I poured in milk into his bowl before I poured in the cereal. I told my son that he was wrong because as far as I know, milk always comes first. After that, my son wouldn't talk to me for the rest of the day. Am I the jerk here?",
    linkFlairID: null,
    postedBy: "OutTheTruth47",
    postedDate: new Date("December 21, 2024 00:57:00"),
    commentIDs: [],
    views: 6,
    upvoters: [],
    downvoters: ["Cat13", "MarcoArelius", "Astyanax"],
  };
  let postRef1 = await createPost(post1);
  let postRef2 = await createPost(post2);
  let postRef3 = await createPost(post3);
  let postRef4 = await createPost(post4);
  let postRef5 = await createPost(post5);
  let postRef6 = await createPost(post6);

  // Community objects
  const community1 = {
    // Community object 1
    name: "Am I the Jerk?",
    description: "A practical application of the principles of justice.",
    postIDs: [postRef1, postRef6],
    startDate: new Date("August 10, 2014 04:18:00"),
    members: ["Rollo", "Shemp", "Cat13", "Astyanax", "RankOneTrucker"],
    creator: "Astyanax",
  };
  const community2 = {
    // Community object 2
    name: "The History Channel",
    description: "A fantastical reimagining of our past and present.",
    postIDs: [postRef2],
    startDate: new Date("May 4, 2017 08:32:00"),
    members: ["MarcoArelius", "Astyanax", "OutTheTruth47", "BigFeet"],
    creator: "OutTheTruth47",
  };
  const community3 = {
    // Community object 3
    name: "Blue Lock",
    description: "An egotistical soccer anime.",
    postIDs: [postRef3],
    startDate: new Date("October 23, 2023 16:37:00"),
    members: ["BigFeet"],
    creator: "BigFeet",
  };
  const community4 = {
    // Community object 4
    name: "Stony Brook University",
    description: "A subreddit devoted to Stony Brook University students and alumni.",
    postIDs: [postRef4, postRef5],
    startDate: new Date("August 10, 2024 17:10:00"),
    members: ["Rollo", "Shemp", "Cat13", "Astyanax", "RankOneTrucker", "BigFeet"],
    creator: "Cat13",
  };
  await createCommunity(community1);
  await createCommunity(community2);
  await createCommunity(community3);
  await createCommunity(community4);

  // Generate password hash for all users except for command-line admin
  const salt = await bcrypt.genSalt(10);
  const password = "cse316";
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate password hash specifically for command-line admin
  const commandLinePasswordHash = await bcrypt.hash(userArgs[2], salt);

  // User objects
  const user1 = {
    adminStatus: false,
    firstName: "Johnny",
    lastName: "Stark",
    email: "johnstark092@gmail.com",
    displayName: "Rollo",
    passwordHash: passwordHash,
    startDate: new Date("December 9, 2020 04:54:00"),
    reputation: 100,
  };

  const user2 = {
    adminStatus: false,
    firstName: "Hannah",
    lastName: "Thompson",
    email: "tree314pie@gmail.com",
    displayName: "Shemp",
    passwordHash: passwordHash,
    startDate: new Date("March 21, 2022 07:02:00"),
    reputation: 100,
  };

  const user3 = {
    adminStatus: false,
    firstName: "Vivian",
    lastName: "Wong",
    email: "vvwong_09@gmail.com",
    displayName: "Cat13",
    passwordHash: passwordHash,
    startDate: new Date("July 6, 2017 14:43:00"),
    reputation: 100,
  };

  const user4 = {
    // Command-line admin
    adminStatus: true,
    firstName: "Bob",
    lastName: "Ross",
    email: userArgs[0],
    displayName: userArgs[1],
    passwordHash: commandLinePasswordHash,
    startDate: new Date("September 27, 2023 06:35:00"),
    reputation: 1000,
  };

  const user5 = {
    adminStatus: false,
    firstName: "Evan",
    lastName: "Carlson",
    email: "evancarlson000@gmail.com",
    displayName: "RankOneTrucker",
    passwordHash: passwordHash,
    startDate: new Date("April 28, 2024 17:26:00"),
    reputation: 100,
  };

  const user6 = {
    adminStatus: false,
    firstName: "Mark",
    lastName: "Star",
    email: "blingbling11@gmail.com",
    displayName: "MarcoArelius",
    passwordHash: passwordHash,
    startDate: new Date("May 14, 2019 11:03:00"),
    reputation: 100,
  };

  const user7 = {
    adminStatus: true,
    firstName: "Jennifer",
    lastName: "Aniston",
    email: "jenaniston124@gmail.com",
    displayName: "OutTheTruth47",
    passwordHash: passwordHash,
    startDate: new Date("November 30, 2021 00:34:00"),
    reputation: 1000,
  };

  const user8 = {
    adminStatus: false,
    firstName: "Jay",
    lastName: "Chang",
    email: "jayjayc999@gmail.com",
    displayName: "BigFeet",
    passwordHash: passwordHash,
    startDate: new Date("February 23, 2022 20:17:00"),
    reputation: 100,
  };

  const user9 = {
    adminStatus: false,
    firstName: "Asta",
    lastName: "Moon",
    email: "astamoon555@gmail.com",
    displayName: "Astyanax",
    passwordHash: passwordHash,
    startDate: new Date("June 24, 2022 09:42:00"),
    reputation: 100,
  };

  await createUser(user1);
  await createUser(user2);
  await createUser(user3);
  await createUser(user4);
  await createUser(user5);
  await createUser(user6);
  await createUser(user7);
  await createUser(user8);
  await createUser(user9);

  if (db)
    db.close();
  console.log("Done");
}

initializeDB().catch((err) => {
  console.log("ERROR: " + err);
  console.trace();
  if (db)
    db.close();
});

console.log("Processing...");
