const mongoose = require('mongoose');

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

class OrderController {
    static async create(req, res) {
        try {
            const { userId, productId, quantity, price, shippingAddress, paymentMethod } = req.body;

            if (!userId || !productId || quantity === undefined || price === undefined || !shippingAddress || !paymentMethod) {
                return res.status(400).json({
                    message: 'userId, productId, quantity, price, shippingAddress and paymentMethod are required'
                });
            }

            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: 'Invalid userId or productId' });
            }

            const parsedQuantity = Number(quantity);
            const parsedPrice = Number(price);

            if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
                return res.status(400).json({ message: 'quantity must be an integer greater than 0' });
            }

            if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({ message: 'price must be a valid number' });
            }

            const [user, product] = await Promise.all([
                User.findById(userId),
                Product.findById(productId)
            ]);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (Number(product.price) !== parsedPrice) {
                return res.status(400).json({
                    message: 'Invalid price. Product price has changed, please refresh and try again.'
                });
            }

            const updatedProduct = await Product.findOneAndUpdate(
                { _id: productId, stock: { $gte: parsedQuantity } },
                { $inc: { stock: -parsedQuantity } },
                { new: true }
            );

            if (!updatedProduct) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }

            const totalAmount = Number((parsedQuantity * Number(product.price)).toFixed(2));

            const order = await Order.create({
                userId,
                items: [
                    {
                        productId,
                        quantity: parsedQuantity,
                        price: Number(product.price)
                    }
                ],
                totalAmount,
                shippingAddress,
                paymentMethod,
                updatedAt: new Date()
            });

            return res.status(201).json({ order, updatedStock: updatedProduct.stock });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async historyPerUser(req, res) {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid userId' });
            }

            const userExists = await User.exists({ _id: userId });
            if (!userExists) {
                return res.status(404).json({ message: 'User not found' });
            }

            const orders = await Order.find({ userId })
                .populate('items.productId', 'name ref thumbnail price')
                .sort({ createdAt: -1 });

            return res.status(200).json({ orders });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const orders = await Order.find()
                .populate('userId', 'username firstname lastname email')
                .populate('items.productId', 'name ref thumbnail price')
                .sort({ createdAt: -1 });

            return res.status(200).json({ orders });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updateStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({ message: 'Invalid orderId' });
            }

            if (!status) {
                return res.status(400).json({ message: 'status is required' });
            }

            const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid status. Allowed: pending, processing, shipped, delivered, cancelled'
                });
            }

            const order = await Order.findByIdAndUpdate(
                orderId,
                { status, updatedAt: new Date() },
                { new: true, runValidators: true }
            )
                .populate('userId', 'username firstname lastname email')
                .populate('items.productId', 'name ref thumbnail price');

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            return res.status(200).json({ order });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async stats(req, res) {
        try {
            const [baseStats] = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' },
                        averageOrderValue: { $avg: '$totalAmount' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalOrders: 1,
                        totalRevenue: { $round: ['$totalRevenue', 2] },
                        averageOrderValue: { $round: ['$averageOrderValue', 2] }
                    }
                }
            ]);

            const statusStats = await Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const statusCounts = {
                pending: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0
            };

            for (const stat of statusStats) {
                statusCounts[stat._id] = stat.count;
            }

            return res.status(200).json({
                stats: {
                    totalOrders: baseStats?.totalOrders || 0,
                    totalRevenue: baseStats?.totalRevenue || 0,
                    averageOrderValue: baseStats?.averageOrderValue || 0,
                    statusCounts
                }
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = OrderController;
