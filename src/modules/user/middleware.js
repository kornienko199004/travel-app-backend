const jwt = require('jsonwebtoken');

function authToken(req, res, next) {
  const token = req.header('Authorization')
  if (!token)
    return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403)
    }
    req.user = data
    next()
  })
}

module.exports = { authToken };