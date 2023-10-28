const mongoose = require('mongoose')
const Gender = require('../../../constants/Gender')

const studentSchema = new mongoose.Schema({
    name: String,
    gender: {
        type: String,
        enum: Object.values(Gender)
    },
    age: Number,
    gpa: Number,
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    }
})

module.exports = mongoose.model("Student", studentSchema)