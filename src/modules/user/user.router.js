const express = require("express")
const router = express.Router()
const jwt = require('jsonwebtoken')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('./user.schema')
const AUTH_COOKIE = 'travel-app-token'

//init storage for save files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'))
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
//init upload as middleware
const upload = multer({ storage: storage });

// middleware for check auth token
function authToken(req, res, next) {
    const token = req.cookies[AUTH_COOKIE]
    if (!token)
        return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        console.log(err)
        if (err)
            return res.sendStatus(403)
        req.user = data
        next()
    })
}

function generateAccessToken({_id, login, psw}) {
    return jwt.sign({_id, login, psw}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3000s'});
}


router.get('/get', authToken, async (req, res) => {
    await User.findById(req.user._id)
        .then(({_id, img}) => {
            res.json({_id, img})
        })
})

router.post('/signUp', upload.single('image'), (req, res) => {
    const newUser = new User({
        login: req.body.login,
        psw: req.body.password,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    })
    newUser.save()

    res.send({_id: newUser._id, img: newUser.img})
})

router.post('/signIn', async (req, res) => {
    const {login, psw} = req.body
    await User.findOne({login, psw})
        .then((user) => {
            if(!user)
                res.sendStatus(401)
            res.cookie(AUTH_COOKIE, generateAccessToken(user))
            res.json({_id: user._id, img: user.img})
        }
    )
});

module.exports = router
