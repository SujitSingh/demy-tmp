exports.notFound = (req, res, next) => {
  res.status(404).render('404', { pageTitle: '404', path: '', isAuthenticated: req.session.isLoggedIn });
}