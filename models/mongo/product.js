//@ts-check
const mongodb = require('mongodb');
const mongoConnect = require('../../utils/database').mongoDBConnect;

class Product {
  constructor(title, price, imageUrl, description, id) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this._id = id ? new mongodb.ObjectId(id) : undefined
  }

  addOne() {
    return mongoConnect().collection('Products').insertOne(this);
  }

  static getAll() {
    return mongoConnect().collection('Products').find().toArray();
  }

  static findById(prodId) {
    return mongoConnect().collection('Products').findOne({_id: new mongodb.ObjectId(prodId)});
  }

  updateOne() {
    return mongoConnect().collection('Products').updateOne({ _id: this._id }, { $set: this });
  }

  static deleteById(id) {
    return mongoConnect().collection('Products').deleteOne({ _id: new mongodb.ObjectId(id) });
  }
}

module.exports = Product;