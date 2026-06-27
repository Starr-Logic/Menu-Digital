import express from 'express';
import { sequelize, Order, OrderItem, Product } from '../models/index.js';

const router = express.Router();

// GET /api/orders : Fetch all orders (with details of items and products)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'category', 'image']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders : Place a new order
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { table_number, items } = req.body;

    if (!table_number) {
      return res.status(400).json({ error: 'table_number is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    // Calculate total price and validate products
    let total_price = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const { product_id, quantity } = item;
      
      if (!product_id || !quantity || quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Each item must have a valid product_id and a quantity greater than 0' });
      }

      // Fetch the product to get its true price from the DB (safe from tampering)
      const product = await Product.findByPk(product_id);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product with ID ${product_id} not found` });
      }

      const itemPrice = product.price;
      const subtotal = itemPrice * quantity;
      total_price += subtotal;

      orderItemsToCreate.push({
        product_id,
        quantity,
        price: itemPrice
      });
    }

    // Create the order
    const order = await Order.create({
      table_number,
      total_price,
      status: 'Pending'
    }, { transaction });

    // Create all the associated items
    for (const item of orderItemsToCreate) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }, { transaction });
    }

    await transaction.commit();

    // Fetch full order details to return
    const completedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'category', 'image']
            }
          ]
        }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('new_order', completedOrder);
    }

    res.status(201).json(completedOrder);
  } catch (error) {
    await transaction.rollback();
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// PATCH /api/orders/:id/status : Update status of an order
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'Preparing', 'Served', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Fetch full order details to return and broadcast
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'category', 'image']
            }
          ]
        }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('order_updated', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
