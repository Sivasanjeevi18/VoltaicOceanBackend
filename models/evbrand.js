const mongoose = require('mongoose');

const EvBrandSchema = mongoose.Schema({
    brand: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('EvBrand', EvBrandSchema, 'evbrands');