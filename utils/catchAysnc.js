module.exports = (fn) => {
  return (req, res, next) => {
    //lexiacl scope of this function cantains fn function
    fn(req, res, next)
    .catch((err) => {
      console.log(err,"error 💥")
      next(err)
    })
  }
}