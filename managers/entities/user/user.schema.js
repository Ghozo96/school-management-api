

module.exports = {
    create: [
        {
            model: 'username',
            required: true,
        },
        {
            model: 'email',
            required: true
        },
        {
            model: 'password',
            required: true
        }
    ],
    authenticate: [
        {
            model: 'username',
            required: true,
        },
        {
            model: 'password',
            required: true
        }
    ],
}


