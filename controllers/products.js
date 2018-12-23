const products = [];
exports.getProducts = (req, res, next) => {
  res.render('shop', {
    pageTitle: 'Shop',
    path: '/',
    prods: products,
    hasProds: products.length > 0,
  });
}

exports.getAddProduct = (req, res, next) => {
  res.render('add-product', { 
    pageTitle: 'Add product', 
    path: '/admin/add-product'
  });  
}

exports.postAddProduct = (req, res, next) => {
  products.push({ 
    title: req.body.title
  });
  res.redirect('/');
}