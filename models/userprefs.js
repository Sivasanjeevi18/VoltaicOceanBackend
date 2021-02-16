const mongoose = require('mongoose');

const UserPrefSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('UserPref', UserPrefSchema, 'userprefs');