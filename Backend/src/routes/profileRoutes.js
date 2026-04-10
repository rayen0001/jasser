const router = require('express').Router();

const ProfileController = require('../controllers/ProfileController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/:userId', authenticate, ProfileController.getProfile);
router.patch('/:userId', authenticate,  ProfileController.updateProfile);

module.exports = router;
