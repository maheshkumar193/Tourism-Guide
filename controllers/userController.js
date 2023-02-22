const User = require('./../models/UserModel')
const catchAsync = require('../utils/catchAysnc')
const AppError = require('../utils/appError')
const catchAysnc = require('../utils/catchAysnc')
const factory = require('./handlerFactory')


function filterData(userData, ...fields) {
  const allowedFields = new Map()
  fields.forEach((field) => {
    allowedFields.set(field, 1)
  })
  const updatedData = {}
  Object.keys(userData).forEach((key) => {
    if (allowedFields.has(key)) updatedData[key] = userData[key]
  })
  return updatedData
}

exports.updateMe = catchAsync(async (req, res, next) => {
  // create error if password data is posted
  if (req.body.password || req.body.passwordConfirm) return next(new AppError("please use /updateMyPassword route to update password", 403))
  // update user data
  // fiilter the user data, don't allow user to add roles, resetPasswordToken ....
  const filteredData = filterData(req.body, 'name', 'email')
  
  // as we are not updating any passwords here, running validators while saving is not necessary
  // so instead if .save, we can directly use update
  await User.findByIdAndUpdate(req.user.id, filteredData)
  
  res.status(204).json({
    status: 'success',
    data: {
      
    }
  })
})

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()    
}

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false})
  res.status(200).json({
    status: 'success',
    data: {
      
    }  
  })  
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined. Use /signup instead'
  })
}

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User) // do not update passwords with this
exports.deleteUser = factory.deleteOne(User)
