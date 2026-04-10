const router = require('express').Router();

const OrderController = require('../controllers/OrderController');
const { authenticate, authorize, authorizeSelfOrRoles } = require('../middlewares/authMiddleware');

router.post('/', authenticate, OrderController.create);
router.get('/', authenticate, authorize('admin'), OrderController.getAll);
router.get('/history/:userId', authenticate, OrderController.historyPerUser);
router.patch('/:orderId/status', authenticate, authorize('admin'), OrderController.updateStatus);
router.get('/stats/global', authenticate, authorize('admin'), OrderController.stats);

module.exports = router;
