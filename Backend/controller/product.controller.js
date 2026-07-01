import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');

await fs.mkdir(uploadDir, { recursive: true });

const buildImagePath = (file) => (file ? `/uploads/products/${file.filename}` : null);

const deleteImageFile = async (image) => {
  if (!image || typeof image !== 'string' || !image.startsWith('/uploads/')) {
    return;
  }
  try {
    await fs.unlink(path.join(__dirname, '..', image));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('Could not remove previous image:', error.message);
    }
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, prep_time_minutes } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const image = req.file ? buildImagePath(req.file) : (req.body.image || null);
    const newProduct = await Product.create({
      name,
      price: Number(price),
      description: description || null,
      image,
      category,
      prep_time_minutes: prep_time_minutes ? Number(prep_time_minutes) : 5
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, price, description, category, prep_time_minutes } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const nextImage = req.file
      ? buildImagePath(req.file)
      : (req.body.image !== undefined ? req.body.image : product.image);

    if (req.file && product.image) {
      await deleteImageFile(product.image);
    }

    await product.update({
      name,
      price: Number(price),
      description: description || null,
      image: nextImage || null,
      category,
      prep_time_minutes: prep_time_minutes ? Number(prep_time_minutes) : 5
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await deleteImageFile(product.image);
    await product.destroy();

    res.json({ message: 'Product deleted', id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
