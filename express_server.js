const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieSession = require('cookie-session')
const { generateRandomString, getUserByEmail, urlsForUser, urlDatabase, users } = require('./helpers');
const { restart } = require("nodemon");
const bcrypt = require('bcryptjs');

// middleware
app.use(cookieSession({
  name: 'session',
  keys: ['asdfw23'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.set("view engine", "ejs");

// Get Routes
// homepage
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  // if user not signed in redirect to login
  if (!req.session.user_id) {
    res.redirect("/login")
  }
  const templateVars = {
    urls: urlDatabase,
    userId: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  // if user not signed in redirect to login
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    userId: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});
// user can see existing and created URLs
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    userId: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

//login page
app.get("/login", (req, res) => {
  const templateVars = {
    userId: users[req.session.user_id]
  };
  res.render("login", templateVars);
})
// registration page
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  const templateVars = {
    userId: users[req.session.user_id]
  };
  res.render("register", templateVars);
})
// Edit Url
app.get("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  return res.redirect("/urls")
})


/// Post routes
//generate random string for shortUrl and redirect to it
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send("Error login first!");
  }
  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  const templateVars = { userId, longURL };
  urlDatabase[shortUrl] = templateVars;
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id", (req, res) => {
  if (req.params.id)
    console.log(req.body);
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userId: req.session.user_id
  };
  res.redirect("/urls");
});

// Delete Url
app.post("/urls/:id/delete", (req, res) => {
  delete (urlDatabase[req.params.id]);
  res.redirect("/urls");
});

// Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!getUserByEmail(email, users)) {
    res.status(403).send('User cannot be found');
  }

  if (getUserByEmail(email, users)) {
    const findPw = users[getUserByEmail(email, users)].password;
    if (bcrypt.compareSync(password, findPw)) {
      req.session.user_id = getUserByEmail(email, users);
      res.redirect('/urls');
    } else {
      res.status(403).send('Incorrect Password');
    }
  }
});

// logout the user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Register the user
app.post("/register", (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(username, users);
  const hiddenPw = bcrypt.hashSync(req.body.password, 10);
  if (!username) {
    return res.status(404).send("Empty field Error.");
  };
  if (!username || !password) {
    return res.status(404).send("Error one of the fields are empty!")
  }
  if (user) {
    return res.status(404).send("Already registered user try again.")
  } else {
    const userId = generateRandomString();
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hiddenPw
    }
    req.session.user_id = userId;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});