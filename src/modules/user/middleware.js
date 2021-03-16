const jwt = require('jsonwebtoken');
const AUTH_COOKIE = 'travel-app-token';

function authToken(req, res, next) {
  const token = req.cookies[AUTH_COOKIE];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = data;
    next();
  });
}

module.exports = { authToken };