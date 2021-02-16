const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    cutOff: {
        type: Number,
        required: true
    },
    batteryDepletionThreshold: {
        type: Number,
        required: true
    },
    maxWaitingTime: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema, 'users');