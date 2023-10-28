const Role = require('../../../constants/Role')

module.exports = class Classroom { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.httpExposed         = ['create', 'get=list', 'get=getOne', 'put=update', 'delete=delete'];
        this.allowedRoles = [Role.SchoolAdmin]
    }

    async create({
        __headers,
        __longToken,
        __apiAccess,
        name
    }){
        const schoolId = __headers.schoolid;
        const userId = __longToken.userId;
        const body = { name };

        const validationResult = await this.validators.classroom.create(body);
        if(validationResult) return validationResult;

        await this.validateSchool(schoolId, userId)
        const foundClassroom = await this.mongomodels.Classroom.findOne({ name, school: schoolId })
        if (foundClassroom) {
            throw new Error('Classroom already exists')
        }

        const createdClassroom = await this.mongomodels.Classroom.create({
            name,
            school: schoolId
        })

        const { __v, ...classroom } = createdClassroom.toObject()
        return { classroom }
    }

    async list({
        __headers,
        __longToken,
        __apiAccess
    }) {
        const schoolId = __headers.schoolid;
        const userId = __longToken.userId;

        await this.validateSchool(schoolId, userId)

        const classrooms = await this.mongomodels.Classroom.find({ school: schoolId }).select('-__v')
        return { classrooms }
    }

    async validateSchool(schoolId, userId) {
        const school = await this.mongomodels.School.findById(schoolId)
        if (!school) {
            throw new Error('School not found')
        }
        if (!school.admins.includes(userId)) {
            throw new Error('Forbidden')
        }
    }
    
    async getOne({
        __headers,
        __longToken,
        __apiAccess
    }) {
        const classroomId = __headers.id;
        const userId = __longToken.userId;

        const classroom = await this.mongomodels.Classroom.findById(classroomId).select('-__v')
        if(!classroom) {
            throw new Error("Classroom not found")
        }
        await this.validateSchool(classroom.school, userId)

        return { classroom }
    }

    async update({
        __headers,
        __longToken,
        __apiAccess,
        name,
        school
    }){
        const classroomId = __headers.id;
        const userId = __longToken.userId;
        const body = { name, school };

        const validationResult = await this.validators.classroom.update(body);
        if(validationResult) return validationResult;

        const foundClassroom = await this.mongomodels.Classroom.findById(classroomId)
        if (!foundClassroom) {
            throw new Error('Classroom not found')
        }
        await this.validateSchool(foundClassroom.school, userId)
        await this.validateSchool(school, userId)

        await this.mongomodels.Classroom.updateOne({ _id: classroomId }, {
            name,
            school
        })
        const updatedClassroom = await this.mongomodels.Classroom.findById(classroomId).select('-__v')

        return { classroom: updatedClassroom }
    }

    async delete({
        __headers,
        __longToken,
        __apiAccess
    }) {
        const classroomId = __headers.id;
        const userId = __longToken.userId;

        const foundClassroom = await this.mongomodels.Classroom.findById(classroomId)
        if (!foundClassroom) {
            throw new Error('Classroom not found')
        }
        await this.validateSchool(foundClassroom.school, userId)

        await this.mongomodels.Classroom.deleteOne({ _id: classroomId })
    }
}
