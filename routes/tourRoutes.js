const express = require('express')
const router = express.Router()
const Search = require('../models/textSearch')
const tourController = require('../controllers/tourController')
const authController = require('./../controllers/authController')
const reviewRouter = require('../routes/reviewRoutes')
const cacheController = require('../controllers/cacheController')

// router.param('id',tourController.checkID)
// nested route
// post /tours/1234/review
// get /tours/1234/review/4321

// router.route('/:tourId/review')
//   .post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

router.use('/:tourId/review', reviewRouter)

router.route('/tour-stats')
  .get(tourController.getTourStats)

router.route('/monthly-plan/:year')
  .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)

router.route('/top-5-cheap')
  .get(tourController.aliasTopTours,tourController.getAllTours)

router.route('/')
  .get(tourController.getAllTours)
  // .post(tourController.checkBody,tourController.createTour) // chaining middle ware. first checkBody middle ware is called && then createTour is called
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'),cacheController.removeHash, tourController.createTour)
router.route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), cacheController.removeHash, tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), cacheController.removeHash, tourController.deleteTour)

// need to explore search feature in mongoDB  
// router.route('/addSearch')
//   .post(async (req, res, next) => {
//   const newData = await Search.create({
//     description: "helo anna namaste",
//     tags: "CF LC CC TC",
//     name: "mahesh_193"
//   })
//   res.status(201).json({
//     data: newData    
//   })
// })

// router.route('/getSearch')
//   .post(async function(req, res, next) {
//     const docs = await Search.find({$or: [{name: { $regex: "raj", $options: "i"}}, {description: { $regex: "ma", $options: "i"}}, {tags: { $regex: "CF", $options: "i"}}]})
//     res.status(200).json({
//       data: docs
//     })
//   })

module.exports = router
