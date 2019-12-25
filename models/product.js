// @ts-check
const db = require('../utils/database');
const Cart = require('./cart');

module.exports = class Product {
  constructor(id, title, imgUrl, description, price) {
    this.id = id && id.trim() || null;
    this.title = title.trim();
    this.imgUrl = imgUrl.trim();
    this.description = description.trim();
    this.price = price && parseFloat(price) || 0;
  }

  save() {
    const query = 'INSERT INTO Products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)';
    return db.execute(query, [this.title, this.price, this.imgUrl, this.description]);
  }

  static fetchAll() {
    const query = 'SELECT * FROM Products';
    return db.execute(query);
  }

  static findById(id) {
    const query = 'SELECT * FROM Products WHERE id = ?';
    return db.execute(query, [id]);
  }

  static deleteById(id) {
    const query = 'DELETE FROM Products WHERE id = ?';
    return db.execute(query, [id]);
  }
}