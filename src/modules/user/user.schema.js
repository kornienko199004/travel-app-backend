const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    login: {
        type: String,
        require: true
    },
    psw: {
        type: String,
        require: true
    },
    img: {
        data: Buffer,
        contentType: String
    }
})

const User = model('user', userSchema)

module.exports = User;
