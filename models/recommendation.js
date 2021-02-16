const mongoose = require('mongoose');

const RecommendationSchema = mongoose.Schema({
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
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'electricstation',
        required: true
    },
    mode: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Recommendation', RecommendationSchema, 'recommendations');