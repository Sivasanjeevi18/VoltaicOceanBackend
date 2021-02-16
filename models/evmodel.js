const mongoose = require('mongoose');

const EvModelSchema = mongoose.Schema({
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'evbrand',
        required: true
    },
    model: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('EvModel', EvModelSchema, 'evmodels');