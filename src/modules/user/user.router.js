const express = require("express")
const router = express.Router()
const jwt = require('jsonwebtoken')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const bcrypt = require('bcrypt');
const User = require('./user.schema')
const Sight = require('../sights/sights.schema')
const AUTH_COOKIE = 'travel-app-token'
const saltRounds = 10;

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
const upload = multer({storage: storage});

// middleware for check auth token
export function authToken(req, res, next) {
    const token = req.cookies[AUTH_COOKIE]
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

function generateAccessToken({_id, login, psw}) {
    return jwt.sign({_id, login, psw}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3000s'});
}

function convertImage(image) {
    try {
        return `data:${image.contentType};base64,${image.data.toString('base64')}`
    } catch (e) {
        console.error("image are not converted: ", e)
        return null
    }
}

router.get('/', authToken, async (req, res) => {
    await User.findById(req.user._id)
        .then(({_id, img, login}) => {
            res.json({ _id, img: convertImage(img), name: login })
        })
})

router.post('/signUp', upload.single('image'), async (req, res) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const newUser = new User({
        login: req.body.login,
        img: {
            data: (req.file) ? fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)) : null,
            contentType: 'image/png'
        }
    })
    newUser.psw = await bcrypt.hash(req.body.password, salt)
    newUser.save().then((user) => {
        res.cookie(AUTH_COOKIE, generateAccessToken(user))
        res.send({_id: user._id, img: convertImage(user.img)})
    })
})

router.post('/signIn', async (req, res) => {
    const {login, password} = req.body
    let user = await User.findOne({login});
    if (!user)
        res.sendStatus(401)
    await bcrypt.compare(password, user.psw).then(
        (isValid) => {
            if (isValid) {
                res.cookie(AUTH_COOKIE, generateAccessToken(user))
                res.json({_id: user._id, img: convertImage(user.img), name: user.login })
            } else
                res.sendStatus(401)
        }
    )
});

router.get('/logout', (req, res) => {
    res.cookie(AUTH_COOKIE, "")
    res.send()
});

router.post('/score', authToken, async (req, res) => {
    const {id, score} = req.body;
    let sight = await Sight.findOne({_id: id});

    let updatedScores = [...sight.scores];
    const index = sight.scores.findIndex(({ user }) => user.toString() === req.user._id.toString());
    const newRecord = { user: req.user._id, score };

    if (index > -1) {
        updatedScores[index] = newRecord;
    } else {
        updatedScores = [...updatedScores, newRecord];
    }

    sight.scores = updatedScores;
    sight.save()
    res.send()
})

module.exports = router
