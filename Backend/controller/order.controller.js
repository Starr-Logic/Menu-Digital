import { sequelize, Order, OrderItem, Product, Setting } from '../models/index.js';

export const getOrders = async (req, res) => {
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
};

export const getTableOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        table_number: req.params.tableName,
        status: ['Pending', 'Preparing', 'Served']
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
};

export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { table_number, items, note } = req.body;

    if (!table_number) {
      return res.status(400).json({ error: 'table_number is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    let total_price = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const { product_id, quantity } = item;
      
      if (!product_id || !quantity || quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Each item must have a valid product_id and a quantity greater than 0' });
      }

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
    }

    const order = await Order.create({
      table_number,
      total_price,
      note: note ? note.trim() : null,
      status: 'Pending'
    }, { transaction });

    for (const item of orderItemsToCreate) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }, { transaction });
    }

    await transaction.commit();

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
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prep_time_minutes } = req.body;

    const allowedStatuses = ['Pending', 'Preparing', 'Served', 'Paid', 'Cancelled'];
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
    if (status === 'Preparing') {
      order.preparedAt = new Date();
    }
    await order.save();

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
};
