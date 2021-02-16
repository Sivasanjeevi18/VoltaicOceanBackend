const mongoose = require('mongoose');

const TripSchema = mongoose.Schema({
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
    livecoordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

module.exports = mongoose.model('Trip', TripSchema, 'trips');