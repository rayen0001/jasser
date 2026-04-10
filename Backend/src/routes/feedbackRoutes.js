const router = require('express').Router();

const FeedbackController = require('../controllers/FeedbackController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate,  FeedbackController.create);
router.get('/product/:productId', FeedbackController.getPerProd);
router.get('/stats/global',authenticate, authorize( 'admin'), FeedbackController.globalStats);
router.get('/stats/product/:productId',authenticate, authorize( 'admin'), FeedbackController.statsPerProd);

module.exports = router;
