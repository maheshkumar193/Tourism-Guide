const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const cacheController = require('../controllers/cacheController')

router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)

router.use(authController.protect)

router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.updateMe)
router.patch('/deleteMe', userController.deleteMe)
router.patch('/updateMyPassword',authController.updatePassword)

router.use(authController.restrictTo('admin'))

router.route('/')
  .get(userController.getAllUsers)
  .post(cacheController.removeHash, userController.createUser)

router.route('/:id')
  .get(userController.getUser)
  .patch(cacheController.removeHash, userController.updateUser)
  .delete(cacheController.removeHash, userController.deleteUser)

module.exports = router