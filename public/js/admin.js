function deleteProduct(btn) {
  const productId = document.querySelector('[name=productId]').value;
  const csrf = document.querySelector('[name=_csrf]').value;

  fetch(`/admin/product/${productId}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  }).then(result => result.json()).then(result => {
    const path = location.origin + location.pathname;
    window.location.href = path;
  }).catch(error => {
    console.log(error)
  })
}