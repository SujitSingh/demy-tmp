// @ts-check
const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/paths');
const Cart = require('./cart');
// product file path
const productFile = path.join(rootDir, 'data', 'products.json');

module.exports = class Product {
  constructor(id, title, imgUrl, description, price) {
    this.id = id && id.trim() || null;
    this.title = title.trim();
    this.imgUrl = imgUrl.trim();
    this.description = description.trim();
    this.price = price && parseFloat(price) || 0;
  }

  save() {
    getProductContent(products => {
      if (this.id && products) {
        const productIndex = products.findIndex(prod => prod.id === this.id);
        if (productIndex > -1) {
          // existing product
          products[productIndex] = this;
          fs.writeFile(productFile, JSON.stringify(products), (error) => {
            console.log(error);
          });
        }
      } else {
        // new product
        this.id = (Math.random() * 1000).toString();
        products.push(this); // add new product
        fs.writeFile(productFile, JSON.stringify(products), (error) => {
          console.log(error);
        });
      }
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

  static deleteById(id) {
    getProductContent(products => {
      const product = products.find(prod => prod.id === id);
      const remainedProducts = products.filter(p => p.id !== id);
      fs.writeFile(productFile, JSON.stringify(remainedProducts), error => {
        if (!error) {
          // remove from cart
          Cart.deleteProduct(id, product.price);
        }
      });
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
