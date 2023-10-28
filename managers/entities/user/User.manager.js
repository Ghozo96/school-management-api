const bcrypt = require("bcrypt");
const Role = require('../../../constants/Role')

module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.httpExposed         = ['create', 'authenticate', 'get=list'];
        this.allowedRoles = {
            create: [Role.SuperAdmin],
            authenticate: [Role.SuperAdmin, Role.SchoolAdmin],
            list: [Role.SuperAdmin]
        } 
    }

    async create({
        __longToken,
        __apiAccess,
        username,
        email,
        password
    }){
        const body = {username, email, password};

        const validationResult = await this.validators.user.create(body);
        if(validationResult) return validationResult;

        const foundUser = await this.mongomodels.User.findOne({ username })
        if (foundUser) {
            throw new Error('User already exists')
        }

        const createdUser = await this.mongomodels.User.create({
            username,
            email,
            password,
            role: Role.SchoolAdmin
        })

        const { __v, password: pw, ...user } = createdUser.toObject()
        return { user }
    }

    async authenticate({ username, password }) {
        const body = { username, password }

        const validationResult = await this.validators.user.authenticate(body);
        if(validationResult) return validationResult;

        const user = await this.mongomodels.User.findOne({ username })
        if (!user) {
            throw new Error('Invalid credentials')
        }
        const arePasswordsMatching = await bcrypt.compare(password, user.password);
        if(!arePasswordsMatching) {
            throw new Error('Invalid credentials')
        }

        const tokenData = {
            userId: user._id,
            userKey: user.username,
            userRole: user.role
        }
        const accessToken = this.tokenManager.genLongToken(tokenData);

        return { accessToken }
    }

    async list({
        __longToken,
        __apiAccess,
    }) {
        const users = await this.mongomodels.User.find().select('-password -__v')
        return { users }
    }
}
