const mongoose = require('mongoose')

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    }
})

module.exports = mongoose.model("Classroom", classroomSchema)