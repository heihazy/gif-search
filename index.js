var express = require("express");
var PORT = process.env.PORT || 5000;
var fetch = require("node-fetch");
var app = express();
var mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://phuonglaitinen:@Kingkong4296@phuong-nodejs-learning-fw7ui.mongodb.net/test?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

var db = mongoose.connection;

db.on("error", function (err) {
  console.log(
    "An error has occured while establishing connection with DB: " + err
  );
});

db.on("open", function () {
  console.log("Connected to DB");
});

var Schema = mongoose.Schema;

var rankSchema = new Schema({
  username: String,
  score: Number,
});

var Rank = mongoose.model("Rank", rankSchema);

app
  .use(express.static(__dirname + "/public/"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/leaderboard.html");
});

app.post("/api/addRank/:username/:score", function (req, res) {
  Rank.findOne({ username: req.params.username }, function (err, record) {
    if (err) {
      console.error("Error while fetching from DB. ");
    }

    if (record !== null) {
      record.score = req.params.score;
      record
        .save()
        .then(function () {
          console.log("Update score for user " + req.params.username);
          res.status(200).end();
        })
        .catch(function (err) {
          console.error(err.message);
          res.status(501).end();
        });
      return;
    }

    var newRank = new Rank();

    newRank.username = req.params.username;
    newRank.score = req.params.score;

    newRank
      .save()
      .then(function () {
        console.log("Saved new score");
        res.status(200).end();
      })
      .catch(function (err) {
        console.error(err.message);
        res.status(501).end();
      });
  });
});

app.get("/api/wipe", function (req, res) {
  Rank.deleteMany({}, function (err, resp) {
    res.send("Wiped");
  });
});

app.get("/api/rank", function (req, res) {
  Rank.find({}, function (err, record) {
    if (err) {
      res.send("An error has occured while fetching Ranking table. ");
      return;
    }

    res.send(record);
  });
});
