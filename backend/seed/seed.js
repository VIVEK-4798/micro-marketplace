const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const Product = require('../models/Product');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await User.deleteMany();

    const sampleProducts = [
      {
        title: 'Wireless Headphones',
        price: 79.99,
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      },
      {
        title: 'Smartwatch Pro',
        price: 299.99,
        description: 'Advanced smartwatch with fitness tracking and health monitoring',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      },
      {
        title: 'USB-C Cable',
        price: 12.99,
        description: 'Durable USB-C charging and data cable, 6 feet long',
        image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',
      },
      {
        title: 'Portable Speaker',
        price: 49.99,
        description: 'Waterproof Bluetooth speaker with powerful bass and 12-hour battery',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
      },
      {
        title: 'Phone Screen Protector',
        price: 9.99,
        description: 'Tempered glass screen protector for smartphones, anti-scratch',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
      },
      {
        title: 'Laptop Stand',
        price: 34.99,
        description: 'Adjustable aluminum laptop stand for better ergonomics',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
      },
      {
        title: 'Wireless Mouse',
        price: 24.99,
        description: 'Ergonomic wireless mouse with precision tracking and 18-month battery',
        image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
      },
      {
        title: 'Phone Charging Case',
        price: 39.99,
        description: 'Battery-powered phone case, provides extra 100 hours of battery',
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
      },
      {
        title: '4K Webcam',
        price: 89.99,
        description: 'Professional 4K USB webcam with auto-focus and built-in microphone',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
      },
    ];
    const createdProducts = await Product.insertMany(sampleProducts);

    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      password: hashed,
    });
    const user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      password: hashed,
    });

    console.log('Seeded products and users successfully.');
    console.log('Credentials:');
    console.log('Email: user1@example.com  Password: password123');
    console.log('Email: user2@example.com  Password: password123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();