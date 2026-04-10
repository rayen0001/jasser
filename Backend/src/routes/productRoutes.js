const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = require('express').Router();

const ProductController = require('../controllers/ProductController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const uploadsDir = path.join(process.cwd(), 'uploads', 'products');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
        cb(null, `${Date.now()}-${baseName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

router.post(
    '/',
    authenticate,
    authorize('admin'),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]),
    ProductController.create
);

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]),
    ProductController.update
);
router.delete('/:id', authenticate, authorize('admin'), ProductController.remove);

module.exports = router;
