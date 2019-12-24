// @ts-check
const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/paths');
// cart file path
const cartFile = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  static getCart(cb) {
    fs.readFile(cartFile, (error, fileContent) => {
      if (error) {
        cb(null);
      } else {
        const cart = JSON.parse(fileContent);
        cb(cart);
      }
    });
  }

  static addProduct(id, productPrice) {
    // fetch the previous cart
    fs.readFile(cartFile, (error, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!error) {
        const currentItems = JSON.parse(fileContent);
        if(currentItems && Object.keys(currentItems).length) {
          cart = currentItems;
        }
      }
      // analyse the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
      if (existingProductIndex > -1) {
        // increment product quantity
        cart.products[existingProductIndex].qty++;
      } else {
        // add new product to cart
        let newProduct = { id: id, qty: 1 };
        cart.products.push(newProduct);
      }
      cart.totalPrice += productPrice;
      fs.writeFile(cartFile, JSON.stringify(cart), error => {
        console.log(error);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(cartFile, (error, fileContent) => {
      if (error) {
        return;
      }
      let cart = JSON.parse(fileContent);
      const product = cart.products.find(prod => prod.id === id);
      if (!product) {
        return;
      }
      cart.totalPrice = cart.totalPrice - (productPrice * product.qty);
      cart.products = cart.products.filter(
        prod => prod.id !== id
      );
      fs.writeFile(cartFile, JSON.stringify(cart), error => {
        console.log(error);
      });
    });
  }
}