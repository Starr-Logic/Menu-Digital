import { Sequelize } from 'sequelize';
import defineProduct from './Product.js';
import defineOrder from './Order.js';
import defineOrderItem from './OrderItem.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine database config
// We check if we are in the cloud sandbox environment (e.g., Cloud Run / AI Studio preview)
// In the cloud sandbox, we always use SQLite because there is no local MySQL server running.
// This allows the preview to work perfectly out-of-the-box, while local runs can use MySQL.
const isCloudSandbox = process.env.K_SERVICE || (process.env.APP_URL && process.env.APP_URL.includes('.run.app'));

const useMySQL = !isCloudSandbox && process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

if (isCloudSandbox) {
  console.log('Running in AI Studio cloud preview environment. Using SQLite database for seamless preview.');
} else if (useMySQL) {
  console.log(`Configuring Sequelize for MySQL database at ${process.env.DB_HOST}:${process.env.DB_PORT || '3306'}`);
} else {
  console.log('No MySQL configuration found. Using SQLite database.');
}

const sequelize = useMySQL
  ? new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      port: parseInt(process.env.DB_PORT || '3306', 10),
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
    });

const Product = defineProduct(sequelize);
const Order = defineOrder(sequelize);
const OrderItem = defineOrderItem(sequelize);

// Define relations
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { as: 'product', foreignKey: 'product_id' });

// Initialize database & seed initial products
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Sync models
    await sequelize.sync();
    console.log('Database synchronized.');

    // Seed default products if empty
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('Seeding initial products...');
      await Product.bulkCreate([
        {
          name: 'Classic Cheeseburger',
          price: 12.99,
          description: 'Premium beef patty, melted cheddar, lettuce, tomato, pickles, and our signature sauce on a toasted brioche bun. Served with golden fries.',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
          category: 'Burgers'
        },
        {
          name: 'Truffle Mushroom Swiss Burger',
          price: 14.99,
          description: 'Premium beef patty, sautéed wild mushrooms, melted Swiss cheese, caramelized onions, and black truffle aioli.',
          image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=400',
          category: 'Burgers'
        },
        {
          name: 'Spicy Buffalo Wings',
          price: 9.99,
          description: 'Crispy chicken wings tossed in our signature spicy buffalo sauce. Served with celery sticks and rich blue cheese dressing.',
          image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400',
          category: 'Starters'
        },
        {
          name: 'Truffle Parmesan Fries',
          price: 6.99,
          description: 'Golden crispy fries tossed in white truffle oil, freshly grated parmesan cheese, and chopped fresh rosemary.',
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
          category: 'Starters'
        },
        {
          name: 'Caesar Salad with Grilled Chicken',
          price: 11.99,
          description: 'Crisp romaine lettuce, grilled chicken breast, herb croutons, shaved parmesan, and classic Caesar dressing.',
          image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=400',
          category: 'Salads'
        },
        {
          name: 'Craft IPA Beer',
          price: 7.50,
          description: 'Hoppy craft India Pale Ale with citrus and tropical fruit notes. Brewed locally and served cold.',
          image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400',
          category: 'Drinks'
        },
        {
          name: 'Fresh Strawberry Lemonade',
          price: 4.50,
          description: 'Refreshing house-made lemonade sweetened with real strawberry purée and organic cane sugar.',
          image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400',
          category: 'Drinks'
        },
        {
          name: 'Chocolate Lava Cake',
          price: 8.99,
          description: 'Warm chocolate cake with a molten liquid center, topped with a scoop of premium vanilla bean ice cream and fresh mint.',
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
          category: 'Desserts'
        },
        {
          name: 'Classic New York Cheesecake',
          price: 7.99,
          description: 'Rich, creamy New York-style cheesecake on a buttery graham cracker crust, drizzled with sweet raspberry coulis.',
          image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=400',
          category: 'Desserts'
        }
      ]);
      console.log('Seeding initial products complete.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export {
  sequelize,
  Product,
  Order,
  OrderItem,
  initializeDatabase,
};
