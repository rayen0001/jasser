const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const buildAuthUserPayload = (user) => ({
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

class AuthController {
    static async signup(req, res) {
        try {
            const {
                username,
                firstname,
                lastname,
                email,
                password,
                birthday,
                phone,
                avatar,
                gender
            } = req.body;

            if (!username || !firstname || !lastname || !email || !password) {
                return res.status(400).json({
                    message: 'username, firstname, lastname, email and password are required'
                });
            }

            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: 'JWT secret is not configured' });
            }

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email: email.toLowerCase() }, { username }]
            });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email or username' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const userData = {
                username,
                firstname,
                lastname,
                email,
                password: hashedPassword
            };

            if (birthday) {
                const birthdayDate = new Date(birthday);
                if (Number.isNaN(birthdayDate.getTime())) {
                    return res.status(400).json({ message: 'birthday must be a valid date' });
                }
                userData.birthday = birthdayDate;
            }

            if (phone) {
                userData.phone = phone;
            }

            if (avatar) {
                userData.avatar = avatar;
            }

            if (gender) {
                userData.gender = gender;
            }

            // Create new user
            const user = await User.create(userData);

            // Generate token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '24h'
            });

            res.status(201).json({ token, user: buildAuthUserPayload(user) });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'email and password are required' });
            }

            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: 'JWT secret is not configured' });
            }

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Compare passwords
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '24h'
            });

            res.json({ token, user: buildAuthUserPayload(user) });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AuthController;