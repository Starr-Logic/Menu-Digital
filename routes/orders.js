import express from 'express';
import { sequelize, Order, OrderItem, Product, Setting } from '../models/index.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// GET /api/orders : Fetch all orders (with details of items and products)
router.get('/', verifyToken, async (req, res) => {
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
              attributes: ['name', 'category', 'image', 'prep_time_minutes']
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

// GET /api/orders/table/:tableName : Fetch active orders for a specific table (public)
router.get('/table/:tableName', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        table_number: req.params.tableName,
        status: ['Pending', 'Preparing']
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'category', 'image', 'prep_time_minutes']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching table orders:', error);
    res.status(500).json({ error: 'Failed to fetch table orders' });
  }
});

// POST /api/orders : Place a new order
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { table_number, items, note } = req.body;

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

    // Enforce minimum order value from settings (server-side)
    try {
      const settings = await Setting.findOne();
      if (settings && settings.minOrderValue) {
        const minStr = settings.minOrderValue.toString();
        const numeric = parseFloat(minStr.replace(/[^0-9.]/g, '')) || 0;
        if (numeric > 0 && total_price < numeric) {
          await transaction.rollback();
          return res.status(400).json({ error: `Minimum order amount is ${settings.minOrderValue}` });
        }
      }
    } catch (err) {
      console.error('Error checking settings for min order:', err);
      // proceed without blocking if settings check fails
    }

    // Create the order
    const order = await Order.create({
      table_number,
      total_price,
      note: note ? note.trim() : null,
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
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prep_time_minutes } = req.body;

    const allowedStatuses = ['Pending', 'Preparing', 'Served', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (prep_time_minutes !== undefined) {
      order.prep_time_minutes = prep_time_minutes;
    }
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
