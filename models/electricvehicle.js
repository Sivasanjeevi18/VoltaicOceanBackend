const mongoose = require('mongoose');

const ElectricVehicleSchema = mongoose.Schema({
    model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'evmodel',
        required: true
    },
    chargingModel: {
        type: mongoose.Schema.Types.Array,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    stateOfCharge: {
        type: Number,
        required: false
    },
    maxCapacity: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('ElectricVehicle', ElectricVehicleSchema, 'electricvehicles');