// @ts-check
const Sequelize = require('sequelize');
const sequelize = require('../utils/database').sequelize;

const CartItem = sequelize.define('CartItem', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  quantity: Sequelize.INTEGER
});

module.exports = CartItem;