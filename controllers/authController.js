const User = require('./../models/UserModel')
const catchAsync = require('../utils/catchAysnc')
const JWT = require('jsonwebtoken')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')
const bcrypt = require('bcryptjs/dist/bcrypt')
const {promisify} = require('util')
const crypto = require('crypto')

const signToken = (id) => {
  return JWT.sign({ id}, process.env.JWT_SECRET, 
    {expiresIn: process.env.JWT_EXPIRESIN}
  )
}

const createAndSendToken = (user, statusCode, res) => {
  const JWTToken = signToken(user._id)
  const cookieOpts = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPRIES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // secure: false (if set true, cookie will only work for https)
  }

  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true

  // removing password from response
  user.password = undefined

  res.cookie('jwt', JWTToken, cookieOpts)
  res.status(statusCode).json({
    status: 'success',
    message: 'password changed successfully',
    token: JWTToken,
    data: {
      user
    }
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    changedPasswordAt: req.body.changedPasswordAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetToken
  })
  const token = signToken(newUser._id)
  createAndSendToken (newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password} = req.body

  if (!email || !password) {
    return next(new AppError('please provide email and password', 400))
  }

  const user = await User.findOne({email}).select('+password')

  if(!user || !(await user.correctPassword(password, user.password))) return next(new AppError('please enter valid mail or password', 401))

  
  createAndSendToken (user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
  let token
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if(!token) return next(new AppError('you are not logged in, please login to get access.', 401))

  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET)
  /*
  decoded: {
    data: 12345,
    iat: ,
    end Date: 
  }
  */
  // console.log(decoded, "is JWT payload")

  // check if user still exists
  const user = await User.findById(decoded.id)
  if (!user) {
    return next(new AppError('this token no longer belong to any user', 401))
  }
  // check if user password has been changed after the token has been issued
  if(user.changedPasswordAfter(decoded.iat)) return next(new AppError('password has been changed, please login again',401))
  req.user = user
  return next()
})

exports.restrictTo = (...roles) => { // any no.of arguements
  // roles is an array
  return ((req, res, next)=>{
    if (!roles.includes(req.user.role)) return next(new AppError('you dont have permission to perform this action', 403))
    next()
  })
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. check user
  let user = await User.findOne({email: req.body.email})
  if (!user) {
    return next(new AppError('There is no user with that email', 404))
  }
  //2. create reset token
  const resetToken = user.createPasswordResetToken()
  user.save({validateBeforeSave: false}, (err, doc) => {
    if (err) return console.log('error while saving')
  })
  //3. send reset token via mail
  //https://domain:port/endpoint/:token
  const resetURI = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

  const message = `forgot your password? submit a patch request with new password and confirm password to ${resetURI}`
  try {
    await sendEmail({
      mail: user.email,
      subject: 'your reset password token (valid only for 10 min)',
      text: message
    })

    res.status(200).json({
      status: 'success',
      message: 'token sent to mail'
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({validateBeforeSave: false})
    return next(new AppError('There was a problem sending mail. Try again later.',500))
  }
  
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. get user based on the token
  const passwordResetToken = req.params.token
  const hashedpasswordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex')
  const user = await User.findOne({
    passwordResetToken: hashedpasswordResetToken,
     passwordResetExpires: {$gte: Date.now()}
  })
  //2. if token not expired and user exists then change the password
  if (!user) {
    return next(new AppError('token is invalid or expired', 400))
  }
  //3. update changedPasswordAt
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()
  //4. log the user in and send JWT
  createAndSendToken (user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get the user from collection
  const user = await User.findById(req.user._id).select('+password')

  // check if posted password is correct
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError('please enter the correct password', 401))
  }

  // update password
  user.password = req.body.newPassword
  user.passwordConfirm = req.body.newPasswordConfirm
  //User.findByIdAndUpdate will not work as intended
  await user.save()

  // log user in, send JWT
  createAndSendToken(user, 200, res)
})