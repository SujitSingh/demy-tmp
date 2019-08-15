// @ts-check
const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/paths');
// product file path
const productFile = path.join(rootDir, 'data', 'products.json');

module.exports = class Product {
  constructor(title, imgUrl, description, price) {
    this.title = title;
    this.imgUrl = imgUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    this.id = (Math.random() * 1000).toString();
    getProductContent(products => {
      products.push(this); // add new product
      fs.writeFile(productFile, JSON.stringify(products), (error) => {
        console.log(error);
      });
    });
  }

  static fetchAll(cb) {
    getProductContent(cb);
  }

  static findById(id, cb) {
    getProductContent(products => {
      const product = products.find(p => p.id === id);
      cb(product);
    });
  }
}

const getProductContent = (cb) => {
  fs.readFile(productFile, (error, fileContent) => {
    if(!error && fileContent.length) {
      cb(JSON.parse(fileContent)); // pass the data to call-back function
    } else {
      cb([]);
    }
  });
}
