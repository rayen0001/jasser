const mongoose = require('mongoose');

const User = require('../models/User');

const sanitizeUser = (user) => ({
    id: user._id,
    username: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    birthday: user.birthday,
    phone: user.phone,
    avatar: user.avatar,
    gender: user.gender,
    role: user.role,
    createdAt: user.createdAt
});

class ProfileController {
    static async getProfile(req, res) {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid userId' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({ user: sanitizeUser(user) });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updateProfile(req, res) {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid userId' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const allowedFields = [
                'username',
                'firstname',
                'lastname',
                'email',
                'birthday',
                'phone',
                'avatar',
                'gender'
            ];

            const updates = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            }

            if (updates.email) {
                updates.email = String(updates.email).toLowerCase().trim();
                const existingEmail = await User.findOne({
                    email: updates.email,
                    _id: { $ne: userId }
                });
                if (existingEmail) {
                    return res.status(400).json({ message: 'Email already in use' });
                }
            }

            if (updates.username) {
                const existingUsername = await User.findOne({
                    username: updates.username,
                    _id: { $ne: userId }
                });
                if (existingUsername) {
                    return res.status(400).json({ message: 'Username already in use' });
                }
            }

            if (updates.birthday) {
                const birthdayDate = new Date(updates.birthday);
                if (Number.isNaN(birthdayDate.getTime())) {
                    return res.status(400).json({ message: 'birthday must be a valid date' });
                }
                updates.birthday = birthdayDate;
            }

            const updatedUser = await User.findByIdAndUpdate(userId, updates, {
                new: true,
                runValidators: true
            });

            return res.status(200).json({ user: sanitizeUser(updatedUser) });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = ProfileController;
