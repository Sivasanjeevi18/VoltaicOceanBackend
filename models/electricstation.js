const mongoose = require('mongoose');

const ElectricStationSchema = mongoose.Schema({
    chargingModel: {
        type: mongoose.Schema.Types.Array,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('ElectricStation', ElectricStationSchema, 'electricstations');