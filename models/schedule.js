const mongoose = require('mongoose');

const ScheduleSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'electricvehicle',
        required: true
    },
    sourcecoordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    destinationcoordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    time: {
        type: mongoose.Schema.Types.Date,
        required: true
    }
});

module.exports = mongoose.model('Schedule', ScheduleSchema, 'schedules');