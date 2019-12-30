// @ts-check
const Sequelize = require('sequelize');
const sequelize = require('../utils/database').sequelize;

const Cart = sequelize.define('Cart', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    unique: true,
    allowNull: false
  }
});

module.exports = Cart;