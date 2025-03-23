const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const upload = require('../middleware/upload');

const router = express.Router();


// Configure storage for uploaded images
// const storage = multer.diskStorage({
//   destination: "./uploads/",
//   filename: (req, file, cb) => {
//       cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
//   }
// });


/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stockCount, category, variants, createdAt } = req.body;
    const image = req.file ? req.file.path : null;
    // Check if the category exists in the Category collection
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({ error: "Category not found" });
    }

    // Validate createdAt format
    const validCreatedAt = createdAt ? new Date(createdAt) : undefined;
    if (createdAt && isNaN(validCreatedAt)) {
      return res.status(400).json({ error: "Invalid date format for createdAt" });
    }

    // Create the product with a valid category name
    const product = new Product({
      name,
      description,
      price,
      stockCount,
      category, // Now storing category as name instead of ObjectId
      variants, // Include variants in the product
      createdAt: validCreatedAt,
      image,
    });
    await product.save();
    res.status(201).json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products by name or description
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    // Validate query
    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Search query cannot be empty" });
    }

    // Perform search
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } }, // Case-insensitive search
        { description: { $regex: q, $options: "i" } }
      ]
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Get products with low stock
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products with low stock
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stockCount: { $lt: 10 } });
    res.send(lowStockProducts);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).send('Product not found');
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       400:
 *         description: Bad request
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, stockCount, category, variants, createdAt } = req.body;

    // Check if the category exists in the Category collection
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({ error: "Category not found" });
    }

    // Validate createdAt format
    const validCreatedAt = createdAt ? new Date(createdAt) : undefined;
    if (createdAt && isNaN(validCreatedAt)) {
      return res.status(400).json({ error: "Invalid date format for createdAt" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stockCount, category, variants, createdAt: validCreatedAt },
      { new: true }
    );
    if (!product) return res.status(404).send('Product not found');
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    // If stockCount > 1, decrement stockCount instead of deleting
    if (product.stockCount > 1) {
      product.stockCount -= 1;
      await product.save();
      return res.json({ message: "Stock count decreased", product });
    }

    // If stockCount == 1, delete the product
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });

  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               color:
 *                 type: string
 *               size:
 *                 type: number
 *         stockCount:
 *           type: number
 *         discount:
 *           type: number
 *         createdAt:
 *           type: Date
 */


module.exports = router;