const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const Role = require('../../../constants/Role')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    role: {
        type: String,
        enum: Object.values(Role)
    }
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

module.exports = mongoose.model("User", userSchema)