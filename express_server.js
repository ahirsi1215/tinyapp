const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.set("view engine", "ejs");
// random string function
const generateRandomString = function () {
  let character = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = "";
  for (let i = 6; i > 0; --i) {
    result += character[Math.floor(Math.random() * character.length)];
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});
//generate random string for url link
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});
//redirect to long url
app.get("/urls/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});
//delete functionality
app.post("/urls/:shortURL/delete", (req, res) => {
  delete (urlDatabase[req.params.shortURL]);
  res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;;
  res.redirect("/urls");
})
app.post("/login",(req,res) =>{
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
app.post("/logout",(req,res) =>{
 res.clearCookie("username", req.body.username);
 res.redirect("urls")
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});