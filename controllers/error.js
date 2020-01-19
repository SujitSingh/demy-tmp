exports.notFound = (req, res, next) => {
  res.status(404).render('404', { pageTitle: '404', path: '' });
}

exports.serverError = (error, req, res, next) => {
  res.status(500).render('500', { pageTitle: '500', error, path: '' });
}