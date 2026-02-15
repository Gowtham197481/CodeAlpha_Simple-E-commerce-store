const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  originalPrice: { type: DataTypes.FLOAT },
  discountPercentage: { type: DataTypes.INTEGER },
  category: { type: DataTypes.STRING },
  imagePath: { type: DataTypes.STRING },
  advantages: { type: DataTypes.TEXT }, // Stored as comma-separated or JSON
  stock: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Order = sequelize.define('Order', {
  orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  shippingName: { type: DataTypes.STRING },
  shippingAddress: { type: DataTypes.TEXT },
  shippingCity: { type: DataTypes.STRING },
  paymentMethod: { type: DataTypes.STRING },
  deliveryDate: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'Processing' }
});

const OrderItem = sequelize.define('OrderItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false }
});

// Associations
User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

module.exports = { sequelize, User, Product, Order, OrderItem };
