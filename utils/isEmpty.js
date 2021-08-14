module.exports.isEmpty = (products) => {
  if (!Object.keys(products).length > 0) {
    return true
  }
  return false
}
