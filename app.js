const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect(
  "mongodb+srv://Pratt:WX82cBX955tyGtD@cluster0.wh1as.mongodb.net/Podcast",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const cardSchema = new mongoose.Schema({
  Description: String,
  Title: String,
  audio: String,
});

const userSchema = new mongoose.Schema({
  Username: String,
  Mail: String,
  Password: String,
  Course: Number,
  Episode: Number,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});
const podcast = mongoose.model("podcast", cardSchema);
app.get("/podcasts", (req, res) => {
  podcast.find(function (err, cards) {
    if (err) {
      console.log(err);
    } else {
      res.json(cards);
    }
  });
});
const User = new mongoose.model("user", userSchema);

app.post("/login", (req, res) => {
  const Username = req.body.username;
  const Password = req.body.password;

  User.findOne({ Username: Username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.Password === Password) {
          app.set("user", foundUser);
          res.redirect("/listen");
        } else {
          res.send("Incorrect Password");
        }
      } else {
        res.send("Dunno you");
      }
    }
  });
});

app.get("/listen", (req, res) => {
  const user = app.get("user");

  // res.render("episode", {
  //   user: user.Username,
  //   cno: user.Course,
  //   eno: user.Episode,
  // });

  podcast.findOne(
    { Course: user.Course, Ep: user.Episode },
    (err, userCourse) => {
      if (err) {
        console.log(err);
      } else {
        res.render("episode", {
          user: user.Username,
          cno: user.Course,
          eno: user.Episode,
          title: userCourse.Title,
          imagesrc: userCourse.image,
          desc: userCourse.Description,
          audiosrc: userCourse.audio,
        });
      }
    }
  );
});

app.post("/register", (req, res) => {
  const user = new User({
    Username: req.body.username,
    Mail: req.body.mail,
    Password: req.body.password,
    Course: 1,
    Episode: 1,
  });

  user.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.send("success");
    }
  });
});

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Im on");
});
