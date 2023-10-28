const Role = require('../../../constants/Role')

module.exports = class Student { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.classroomManager = managers.classroom;
        this.httpExposed         = ['create', 'get=list', 'get=getOne', 'put=update', 'delete=delete'];
        this.allowedRoles = [Role.SchoolAdmin]
    }

    async create({
        __headers,
        __longToken,
        __apiAccess,
        name,
        gender,
        age,
        gpa
    }){
        const classroomId = __headers.classroomid;
        const userId = __longToken.userId;
        const body = { name, gender, age, gpa };

        const validationResult = await this.validators.student.create(body);
        if(validationResult) return validationResult;

        await this.validateClassroom(classroomId, userId)

        const createdStudent = await this.mongomodels.Student.create({
            name,
            gender,
            age,
            gpa,
            classroom: classroomId
        })

        const { __v, ...student } = createdStudent.toObject()
        return { student }
    }

    async validateClassroom(classroomId, userId) {
        const classroom = await this.mongomodels.Classroom.findById(classroomId)
        if (!classroom) {
            throw new Error('Classroom not found')
        }
        await this.classroomManager.validateSchool(classroom.school, userId)
    }

    async list({
        __headers,
        __longToken,
        __apiAccess
    }) {
        const classroomId = __headers.classroomid;
        const userId = __longToken.userId;

        await this.validateClassroom(classroomId, userId)

        const students = await this.mongomodels.Student.find({ classroom: classroomId }).select('-__v')
        return { students }
    }
    
    async getOne({
        __headers,
        __longToken,
        __apiAccess
    }) {
        const studentId = __headers.id;
        const userId = __longToken.userId;

        const student = await this.mongomodels.Student.findById(studentId).select('-__v')
        console.log("student: ", student)
        if(!student) {
            throw new Error("Student not found")
        }
        await this.validateClassroom(student.classroom, userId)

        return { student }
    }

    async update({
        __headers,
        __longToken,
        __apiAccess,
        name,
        gender,
        age,
        gpa,
        classroom
    }){
        const studentId = __headers.id;
        const userId = __longToken.userId;
        const body = { name, gender, age, gpa, classroom };

        const validationResult = await this.validators.student.update(body);
        if(validationResult) return validationResult;

        const foundStudent = await this.mongomodels.Student.findById(studentId)
        if (!foundStudent) {
            throw new Error('Student not found')
        }
        await this.validateClassroom(foundStudent.classroom, userId)
        await this.validateClassroom(classroom, userId)

        await this.mongomodels.Student.updateOne({ _id: studentId }, {
            name,
            gender,
            age,
            gpa,
            classroom
        })
        const updatedStudent = await this.mongomodels.Student.findById(studentId).select('-__v')

        return { student: updatedStudent }
    }

    async delete({
        __headers,
        __longToken,
        __apiAccess
    }) {
        const studentId = __headers.id;
        const userId = __longToken.userId;

        const foundStudent = await this.mongomodels.Student.findById(studentId)
        if (!foundStudent) {
            throw new Error('Student not found')
        }
        await this.validateClassroom(foundStudent.classroom, userId)

        await this.mongomodels.Student.deleteOne({ _id: studentId })
    }
}
