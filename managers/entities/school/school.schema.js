module.exports = {
    create: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'address',
            required: true
        },
        {
            model: 'admins',
            required: true
        }
    ],
    update: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'address',
            required: true
        },
        {
            model: 'admins',
            required: true
        }
    ]
}