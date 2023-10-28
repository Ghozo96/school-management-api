const Role = require('../../../constants/Role')

module.exports = class School { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.httpExposed         = ['create', 'get=list', 'get=getOne', 'put=update', 'delete=delete'];
        this.allowedRoles = {
            create: [Role.SuperAdmin],
            list: [Role.SuperAdmin],
            getOne: [Role.SuperAdmin, Role.SchoolAdmin],
            update: [Role.SuperAdmin],
            delete: [Role.SuperAdmin]
        }
    }

    async create({
        __longToken,
        __apiAccess,
        name,
        address,
        admins
    }){
        const body = { name, address, admins };

        const validationResult = await this.validators.school.create(body);
        if(validationResult) return validationResult;

        const foundSchool = await this.mongomodels.School.findOne({ name })
        if (foundSchool) {
            throw new Error('School already exists')
        }

        const foundAdmins = await this.mongomodels.User.find({
            _id: { $in: admins },
            role: Role.SchoolAdmin
        }, { _id: 1 }).lean()

        const createdSchool = await this.mongomodels.School.create({
            name,
            address,
            admins: foundAdmins
        })

        const { __v, ...school } = createdSchool.toObject()
        return { school }
    }

    async list({
        __longToken,
        __apiAccess
    }) {
        const schools = await this.mongomodels.School.find().select('-__v')
        return { schools }
    }
    
    async getOne({
        __headers,
        __longToken,
        __apiAccess
    }) {
        const schoolId = __headers.id;
        const userId = __longToken.userId;
        const userRole = __longToken.userRole;

        const school = await this.mongomodels.School.findById(schoolId).select('-__v')
        if(!school) {
            throw new Error("School not found")
        }
        if (!school.admins.includes(userId) && userRole != Role.SuperAdmin) {
            throw new Error("Forbidden")
        }

        return { school }
    }

    async update({
        __headers,
        __longToken,
        __apiAccess,
        name,
        address,
        admins
    }){
        const schoolId = __headers.id;
        const body = { name, address, admins };

        const validationResult = await this.validators.school.update(body);
        if(validationResult) return validationResult;

        const foundSchool = await this.mongomodels.School.findById(schoolId)
        if (!foundSchool) {
            throw new Error('School not found')
        }

        const foundAdmins = await this.mongomodels.User.find({
            _id: { $in: admins },
            role: Role.SchoolAdmin
        }, { _id: 1 })

        await this.mongomodels.School.updateOne({ _id: schoolId }, {
            name,
            address,
            admins: foundAdmins
        })
        const updatedSchool = await this.mongomodels.School.findById(schoolId)

        const { __v, ...school } = updatedSchool.toObject()
        return { school }
    }

    async delete({
        __headers,
        __longToken,
        __apiAccess
    }) {
        const schoolId = __headers.id;

        const foundSchool = await this.mongomodels.School.findById(schoolId)
        if (!foundSchool) {
            throw new Error('School not found')
        }

        await this.mongomodels.School.deleteOne({ _id: schoolId })
    }
}
