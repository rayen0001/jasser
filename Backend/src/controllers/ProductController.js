const Product = require('../models/Product');
const Feedback = require('../models/Feedback');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(process.cwd(), 'uploads', 'products');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const toRelativeUploadPath = (file) => `/uploads/products/${file.filename}`;

const deleteFileByRelativePath = (relativePath) => {
    if (!relativePath || typeof relativePath !== 'string') {
        return;
    }

    const normalizedPath = relativePath.replace(/^\/+/, '');
    const absolutePath = path.join(process.cwd(), normalizedPath);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

const parseOptionalArray = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
    }

    return Boolean(value);
};

const parseRemisComposerd = (payload, fallback = { enabled: false, percentage: 0 }) => {
    const defaultValue = {
        enabled: parseBoolean(fallback?.enabled, false),
        percentage: Number(fallback?.percentage ?? 0)
    };

    let composed = payload?.remisComposerd;

    if (typeof composed === 'string') {
        try {
            composed = JSON.parse(composed);
        } catch (error) {
            composed = null;
        }
    }

    const enabled = composed?.enabled ?? payload?.remisComposerdEnabled;
    const percentage = composed?.percentage ?? payload?.remisComposerdPercentage;

    const parsed = {
        enabled: parseBoolean(enabled, defaultValue.enabled),
        percentage:
            percentage !== undefined && percentage !== null && percentage !== ''
                ? Number(percentage)
                : defaultValue.percentage
    };

    if (!Number.isFinite(parsed.percentage) || parsed.percentage < 0 || parsed.percentage > 100) {
        return { error: 'remisComposerd.percentage must be between 0 and 100' };
    }

    if (!parsed.enabled) {
        parsed.percentage = 0;
    }

    return { value: parsed };
};

class ProductController {
    static async create(req, res) {
        try {
            const { name, ref, desc, price, category, stock } = req.body;

            if (!name || !ref || !desc || !price || !category) {
                return res.status(400).json({
                    message: 'name, ref, desc, price and category are required'
                });
            }

            const existingProduct = await Product.findOne({ ref });
            if (existingProduct) {
                return res.status(400).json({ message: 'Product with this ref already exists' });
            }

            const thumbnailFile = req.files?.thumbnail?.[0] || null;
            const imageFiles = req.files?.images || [];
            const remisComposerdResult = parseRemisComposerd(req.body);

            if (remisComposerdResult.error) {
                return res.status(400).json({ message: remisComposerdResult.error });
            }

            const product = await Product.create({
                name,
                ref,
                desc,
                price: Number(price),
                category,
                stock: Number(stock || 0),
                remisComposerd: remisComposerdResult.value,
                thumbnail: thumbnailFile ? toRelativeUploadPath(thumbnailFile) : null,
                images: imageFiles.map(toRelativeUploadPath)
            });

            return res.status(201).json({ product });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const products = await Product.find().sort({ createdAt: -1 }).lean();

            if (products.length === 0) {
                return res.status(200).json({ products: [] });
            }

            const productIds = products.map((product) => product._id);

            const ratings = await Feedback.aggregate([
                { $match: { productId: { $in: productIds } } },
                {
                    $group: {
                        _id: '$productId',
                        averageRate: { $avg: '$rating' }
                    }
                }
            ]);

            const ratingMap = new Map(
                ratings.map((item) => [String(item._id), Number(item.averageRate.toFixed(2))])
            );

            const productsWithAverageRate = products.map((product) => ({
                ...product,
                averageRate: ratingMap.get(String(product._id)) || 0
            }));

            return res.status(200).json({ products: productsWithAverageRate });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            return res.status(200).json({ product });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const thumbnailFile = req.files?.thumbnail?.[0] || null;
            const imageFiles = req.files?.images || [];
            const existingImages = parseOptionalArray(req.body.existingImages);
            const remisComposerdResult = parseRemisComposerd(req.body, product.remisComposerd);

            if (remisComposerdResult.error) {
                return res.status(400).json({ message: remisComposerdResult.error });
            }

            if (thumbnailFile && product.thumbnail) {
                deleteFileByRelativePath(product.thumbnail);
            }

            const updatedData = {
                name: req.body.name ?? product.name,
                ref: req.body.ref ?? product.ref,
                desc: req.body.desc ?? product.desc,
                price: req.body.price !== undefined ? Number(req.body.price) : product.price,
                category: req.body.category ?? product.category,
                stock: req.body.stock !== undefined ? Number(req.body.stock) : product.stock,
                remisComposerd: remisComposerdResult.value,
                thumbnail: thumbnailFile ? toRelativeUploadPath(thumbnailFile) : product.thumbnail,
                images: [...existingImages, ...imageFiles.map(toRelativeUploadPath)]
            };

            const currentImageSet = new Set(product.images || []);
            const nextImageSet = new Set(updatedData.images);

            for (const oldImagePath of currentImageSet) {
                if (!nextImageSet.has(oldImagePath)) {
                    deleteFileByRelativePath(oldImagePath);
                }
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
                new: true,
                runValidators: true
            });

            return res.status(200).json({ product: updatedProduct });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async remove(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.thumbnail) {
                deleteFileByRelativePath(product.thumbnail);
            }

            if (Array.isArray(product.images)) {
                for (const imagePath of product.images) {
                    deleteFileByRelativePath(imagePath);
                }
            }

            await Product.findByIdAndDelete(id);

            return res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = ProductController;
