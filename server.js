const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//DB configuration
const db = require("./config/keys").mongoURI;

//DB connection
mongoose
  .connect(db)
  .then(() => console.log("DB connected succesfully!"))
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello World Whats up!"));

const port = process.env.port || 5000;

//Routers
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(port, () => console.log(`Server is working on port ${port}`));
