const router = require('express').Router();

const AuthController = require('../controllers/AuthController');

router.post('/auth/signup', AuthController.signup);
router.post('/auth/login', AuthController.login);

router.use('/products', require('./productRoutes'));
router.use('/feedbacks', require('./feedbackRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/profiles', require('./profileRoutes'));


module.exports = router;