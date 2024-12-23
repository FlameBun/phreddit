// Set up connection to running MongoDB instance
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/phreddit");
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Acquire express server instance
const express = require("express");
const app = express(); // Instance of express server

// Import routers
const usersRouter = require("./routers/users-router.js");
const postsRouter = require("./routers/posts-router.js");
const communitiesRouter = require("./routers/communities-router.js");
const commentsRouter = require("./routers/comments-router.js");

// Import async getData() helper function
const getData = require("./helpers.js").getData;

// Set up CORS middleware
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["POST", "GET"],
  credentials: true
}));

// Set up express-session middleware
const session = require("express-session");
const MongoStore = require("connect-mongo");
app.use(session({
  secret: "vPnS2DPsHOPp3rp2Yr6v",
  cookie: {maxAge: 604800000}, // Session cookie expires in one week
  store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/phreddit" }),
  resave: false,
  saveUninitialized: false
}));

// Parse request and store in req.body
app.use(express.json());

// Set up routers
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/communities", communitiesRouter);
app.use("/comments", commentsRouter);

// Send model data: communities, posts, comments, link flairs
app.get("/data", async (req, res) => {
  const data = await getData(req);
  res.send(data);
});

app.listen(8000, () => {
  console.log("Server listening on port 8000...");
});
