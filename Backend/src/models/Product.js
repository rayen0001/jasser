const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ref: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Other'],
        required: true
        },
    thumbnail: {
        type: String,
        default: null
    },
    images: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    remisComposerd: {
        enabled: {
            type: Boolean,
            default: false
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);