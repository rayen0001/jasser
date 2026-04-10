const mongoose = require('mongoose');

const Feedback = require('../models/Feedback');
const Product = require('../models/Product');
const User = require('../models/User');

class FeedbackController {
    static async create(req, res) {
        try {
            const { productId, userId, rating, comment } = req.body;

            if (!productId || !userId || rating === undefined) {
                return res.status(400).json({
                    message: 'productId, userId and rating are required'
                });
            }

            if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid productId or userId' });
            }

            const [product, user] = await Promise.all([
                Product.findById(productId),
                User.findById(userId)
            ]);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const existingFeedback = await Feedback.findOne({ productId, userId });
            if (existingFeedback) {
                return res.status(400).json({
                    message: 'Feedback already exists for this user and product'
                });
            }

            const feedback = await Feedback.create({
                productId,
                userId,
                rating: Number(rating),
                comment
            });

            return res.status(201).json({ feedback });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getPerProd(req, res) {
        try {
            const { productId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: 'Invalid productId' });
            }

            const feedbacks = await Feedback.find({ productId })
                .populate('userId', 'username firstname lastname avatar')
                .sort({ createdAt: -1 });

            return res.status(200).json({ feedbacks });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async globalStats(req, res) {
        try {
            const [stats] = await Feedback.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFeedbacks: { $sum: 1 },
                        averageRate: { $avg: '$rating' },
                        totalHelpful: { $sum: '$helpful' },
                        totalUnhelpful: { $sum: '$unhelpful' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalFeedbacks: 1,
                        averageRate: { $round: ['$averageRate', 2] },
                        totalHelpful: 1,
                        totalUnhelpful: 1
                    }
                }
            ]);

            return res.status(200).json({
                stats: stats || {
                    totalFeedbacks: 0,
                    averageRate: 0,
                    totalHelpful: 0,
                    totalUnhelpful: 0
                }
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async statsPerProd(req, res) {
        try {
            const { productId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: 'Invalid productId' });
            }

            const [stats] = await Feedback.aggregate([
                { $match: { productId: new mongoose.Types.ObjectId(productId) } },
                {
                    $group: {
                        _id: '$productId',
                        totalFeedbacks: { $sum: 1 },
                        averageRate: { $avg: '$rating' },
                        totalHelpful: { $sum: '$helpful' },
                        totalUnhelpful: { $sum: '$unhelpful' },
                        rate1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                        rate2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        rate3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        rate4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        rate5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        productId,
                        totalFeedbacks: 1,
                        averageRate: { $round: ['$averageRate', 2] },
                        totalHelpful: 1,
                        totalUnhelpful: 1,
                        distribution: {
                            rate1: '$rate1',
                            rate2: '$rate2',
                            rate3: '$rate3',
                            rate4: '$rate4',
                            rate5: '$rate5'
                        }
                    }
                }
            ]);

            return res.status(200).json({
                stats: stats || {
                    productId,
                    totalFeedbacks: 0,
                    averageRate: 0,
                    totalHelpful: 0,
                    totalUnhelpful: 0,
                    distribution: {
                        rate1: 0,
                        rate2: 0,
                        rate3: 0,
                        rate4: 0,
                        rate5: 0
                    }
                }
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = FeedbackController;
