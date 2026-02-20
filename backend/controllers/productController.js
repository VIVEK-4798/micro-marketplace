const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all products with search & pagination
// @route   GET /products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      title: { $regex: search, $options: 'i' },
    };

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ products, totalPages, currentPage: page });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get single product by ID
// @route   GET /products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// @desc    Create new product
// @route   POST /products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { title, price, description, image } = req.body;
    const product = new Product({ title, price, description, image });
    const created = await product.save();
    res.status(201).json(created);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update product
// @route   PUT /products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { title, price, description, image } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.title = title || product.title;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      const updated = await product.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete product
// @route   DELETE /products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// @desc    Add favorite
// @route   POST /products/:id/favorite
// @access  Private
const addFavorite = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.params.id;

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }
    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Server error adding favorite', error: error.message });
  }
};

// @desc    Remove favorite
// @route   DELETE /products/:id/favorite
// @access  Private
const removeFavorite = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.params.id;

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== productId
    );
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error removing favorite', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
};