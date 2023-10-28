const mongoose = require('mongoose')

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    address: String,
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

module.exports = mongoose.model("School", schoolSchema)