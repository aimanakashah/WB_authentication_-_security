require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true }); //already deprecated in the latest version of node.js
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });
//the 'secret' string was combined with the 'password' and then scrambled into unreadable string that is hard to figure out

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  try {
    await newUser.save();
    //password is encrypt here when the 'save' was called
    res.render("secrets");
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
});

app.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundUser = await User.findOne({ email: username });
    //this part is where the decryption of the password happen when the 'find' was called

    if (foundUser && foundUser.password === password) {
      // console.log(foundUser.password);
      res.render("secrets");
    } else {
      // Handle the case where the user is not found or the password is incorrect
      // For example, you might redirect to a login page with an error message
      res.redirect("/login?error=invalid_credentials");
    }
  } catch (err) {
    console.error(err);
    // Handle the error appropriately, for example, rendering an error page
    res.render("error", {
      errorMessage: "An error occurred while processing your request.",
    });
  }
});

app.listen(port, function () {
  console.log(`Server running on http://localhost:${port}`);
});
