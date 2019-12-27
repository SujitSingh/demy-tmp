// @ts-check
const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Order = sequelize.define('Order', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    unique: true,
    allowNull: false
  }
});

module.exports = Order;