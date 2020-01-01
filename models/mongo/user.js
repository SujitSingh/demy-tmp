const mongodb = require('mongodb');
const mongoConnect = require('../../utils/database').mongoDBConnect;

class User {
  constructor(userName, email) {
    this.name = userName;
    this.email = email;
  }

  addOne() {
    return mongoConnect().collection('Users').insertOne(this);
  }

  static findById(userId) {
    return mongoConnect().collection('Users').findOne({ _id: new mongodb.ObjectId(userId) });
  }

  static findOne(filter) {
    return mongoConnect().collection('Users').findOne(filter);
  }
}

module.exports = User;