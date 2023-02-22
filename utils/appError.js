class AppError extends Error {
  constructor (message, statusCode) {
    super(message) // calls the parent class
    // this.message = message; no need of this line
    this.statusCode = statusCode
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true
    // don't know how this line works
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError