// @ts-check
const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Product = sequelize.define('Product', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  title: { type: Sequelize.STRING, allowNull: false },
  price: { type: Sequelize.DOUBLE, allowNull: false },
  imageUrl: { type: Sequelize.STRING, allowNull: false },
  description: Sequelize.STRING
});

module.exports = Product;