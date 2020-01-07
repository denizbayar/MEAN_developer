const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require("path");

const app = express();

//DB configuration
const db = require("./config/keys").mongoURI;

//DB connection
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("DB connected succesfully!"))
  .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Passport middleware
app.use(passport.initialize())

//Passport configuration
require('./config/passport')(passport);

const port = process.env.port || 5000;

//Routers
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

if (process.env.MONGO_URI === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

app.listen(port, () => console.log(`Server is working on port ${port}`));
