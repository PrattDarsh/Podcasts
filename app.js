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
  image: String,
  likes: Number,
});

const userSchema = new mongoose.Schema({
  Username: String,
  Mail: String,
  Password: String,
  Course: Number,
  Episode: Number,
  favs: [
    {
      courseNo: Number,
      EpNo: Number,
      epTitle: String,
      epDesc: String,
      epImg: String,
      epLink: String,
    },
  ],
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
          image: userCourse.image,
          desc: userCourse.Description,
          audiosrc: userCourse.audio,
        });
        app.set("currCourse", userCourse);
      }
    }
  );
});

app.post("/listen", (req, res) => {
  const curruser = app.get("user");
  // console.log(curruser.Course++);
  User.updateOne(
    { _id: curruser },
    { Episode: curruser.Episode++ },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        res.status(302).redirect("/listen");
      }
    }
  );
});

app.post("/listenprev", (req, res) => {
  const prevuser = app.get("user");
  // console.log(curruser.Course++);
  User.updateOne(
    { _id: prevuser },
    { Episode: prevuser.Episode-- },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        res.status(302).redirect("/listen");
      }
    }
  );
});

app.post("/like", (req, res) => {
  const currCourse = app.get("currCourse");
  const favUser = app.get("user");
  // console.log(currCourse);
  podcast.updateOne(
    { _id: currCourse },
    { likes: currCourse.likes++ },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        res.status(204).send();
      }
    }
  );
  var fav = {
    courseNo: favUser.Course,
    EpNo: favUser.Episode,
    epTitle: currCourse.Title,
    epDesc: currCourse.Description,
    epImg: currCourse.image,
    epLink: currCourse.audio,
  };
  // console.log(fav);
  if (favUser.favs.length == 0) {
    User.updateOne({ _id: favUser }, { $push: { favs: fav } }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("success");
      }
    });
  } else {
    favUser.favs.forEach((element) => {
      if (element.EpNo != fav.EpNo) {
        User.updateOne(
          { _id: favUser },
          { $push: { favs: fav } },
          function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("success");
            }
          }
        );
      } else {
        res.send("already liked");
      }
    });
  }
});

app.post("/favourites", (req, res) => {
  const currentUser = app.get("user");
  // res.send(currentUser.favs);
  res.render("favourites", {
    test: currentUser.favs,
  });
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
