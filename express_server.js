const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieSession = require('cookie-session')
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');
const { restart } = require("nodemon");
const bcrypt = require('bcryptjs');

// middleware
app.use(cookieSession({
  name: 'session',
  keys: ['asdfw23'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.set("view engine", "ejs");
// random string function
//users object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
// default websites used for edit/test and showing
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
// homepage
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});
// creating a tinyurl page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});
app.get("/u/:shortUrl", (req, res) => {
  const longUrl = urlDatabase[req.params.id].longUrl;
  res.redirect(longUrl);
});
// main page that shows urls, edit and delete
app.get("/urls/:shortUrl", (req, res) => {
  if (!req.session.user_id) {
    return res.send("You need to Login");
  }
  let shortURL = req.params.id;
  if (!urlsForUser(shortURL, req.session.user_id)) {
    return res.send("Unauthorized Access ");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});
//login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
})
// registration page
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
})
//generate random string for url link
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortUrl}`);
});
//delete functionality
app.post("/urls/:id/delete", (req, res) => {
  delete (urlDatabase[req.params.id]);
  res.redirect("/urls");
});
//edit..seems to be deleting need to fix
app.get("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  return res.redirect("/urls")
})
app.post("/urls/shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
})
// login
app.post("/login", (req, res) => {
  const hiddenPw = bcrypt.hashSync(req.body.password, 10);
  const userId = urlsForUser(req.body.email, users);
  if (userId === undefined) {
    return res.status(404).send("Error email not found");
  };
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hiddenPw
  }
  req.session.user_id = users[userId].id
  res.redirect('/urls');
});
// logout the user
app.post("/logout", (req, res) => {
  res.redirect("/urls");
});
// register the user
app.post("/register", (req, res) => {
  const hiddenPw = bcrypt.hashSync(req.body.password, 10);
  if (!req.body.email) {
    return res.status(404).send("Empty field Error.");
  };
  if (getUserByEmail(req.body.email)) {
    return res.status(404).send("Already registered user try again.")
  };
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hiddenPw
  }
  req.session.user_id = users[userId].id
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});