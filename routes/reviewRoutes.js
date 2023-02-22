const router = require('express').Router({mergeParams: true})
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')
const cacheController = require('../controllers/cacheController')

router.use(authController.protect)

router.route('/')
  .get(reviewController.getAllReviews)
  .post(cacheController.removeHash, authController.restrictTo('user'), reviewController.setReqBodyFields, reviewController.createReview)

router.route('/:id')
  .get(reviewController.getReview)
  .delete(authController.restrictTo('user', 'admin'), cacheController.removeHash, reviewController.deleteReview)
  .patch(authController.restrictTo('user', 'admin'), cacheController.removeHash, reviewController.updateReview)
module.exports = router