//@ts-check
const mongodb = require('mongodb');
const mongoConnect = require('../../utils/database').mongoDBConnect;

class Product {
  constructor(title, price, imageUrl, description) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  save() {
    return mongoConnect().collection('Products').insertOne(this);
  }

  static getAll() {
    return mongoConnect().collection('Products').find().toArray();
  }

  static findById(prodId) {
    return mongoConnect().collection('Products').findOne({_id: new mongodb.ObjectId(prodId)});
  }
}

module.exports = Product;