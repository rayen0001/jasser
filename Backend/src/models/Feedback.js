const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            maxlength: 1000,
        },
        helpful: {
            type: Number,
            default: 0,
        },
        unhelpful: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);