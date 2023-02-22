const AppError = require("../utils/appError")

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err, res) => {
  //operational error, send error to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    //programming error, dont leak it to client
    console.log('ERROR💥',err)
    res.status(500).json({
      statusCode: 'fail',
      message: 'we saw it too, will fix asap'
    })
  }
  
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value ${err.keyValue.name}. Please use another value`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
  console.log(err.message)
  return new AppError(err.message, 400)
}

const handleJWTError = () => {
  return new AppError('invalid token',401)
}

const handleJWTExpiredError = () => new AppError('token expired, login again',401)

module.exports = (err, req, res, next) => { // if we specifing 4 parameters then nodeJS will automatically understand that it is an error handling middleware
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else {

    let error = JSON.parse(JSON.stringify(err)) //for deep copy

    // let error = {...err}

    // what a spread operator does? It deep copies the data if it is not nested. For nested data, it deeply copies the topmost data and shallow copies of the nested data.

    if(error.name === 'CastError') error = handleCastErrorDB(error)

    if(error.code === 11000) error = handleDuplicateFieldsDB(error)

    if(error.name === 'ValidationError') error = handleValidationErrorDB(error)

    if(error.name === 'JsonWebTokenError') error = handleJWTError()

    if(error.name === 'TokenExpiredError') error = handleJWTExpiredError()
    sendErrorProd(error, res)
  }
}
