const jwt = require('jsonwebtoken');

const User = require('../models/User');

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return null;
};

const authenticate = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT secret is not configured' });
        }

        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        const user = await User.findById(userId).select('_id role email username');
        if (!user) {
            return res.status(401).json({ message: 'User linked to token not found' });
        }

        req.user = {
            id: String(user._id),
            role: user.role,
            email: user.email,
            username: user.username
        };

        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (allowedRoles.length === 0 || allowedRoles.includes(req.user.role)) {
        return next();
    }

    return res.status(403).json({ message: 'Access denied' });
};

const authorizeSelfOrRoles = (paramKey = 'userId', allowedRoles = ['admin']) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const ownerId = String(req.params?.[paramKey] || req.body?.[paramKey] || '');
    if (ownerId && ownerId === req.user.id) {
        return next();
    }

    if (allowedRoles.includes(req.user.role)) {
        return next();
    }

    return res.status(403).json({ message: 'Access denied' });
};

module.exports = {
    authenticate,
    authorize,
    authorizeSelfOrRoles
};