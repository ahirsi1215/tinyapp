const getUserByEmail = function (email, users) {
  for (let user in users) {
    if (users[user].email === email) {
    }
    return user;
  }
};
const urlsForUser = (user_id, urlDatabase) => {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === user_id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
};
const generateRandomString = function () {
  let character = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = "";
  for (let i = 6; i > 0; --i) {
    result += character[Math.floor(Math.random() * character.length)];
  }
  return result;
};
module.exports = { generateRandomString, getUserByEmail, urlsForUser };
