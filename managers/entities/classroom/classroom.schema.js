module.exports = {
    create: [
        {
            model: 'name',
            required: true,
        }
    ],
    update: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'school',
            required: true
        }
    ],
}