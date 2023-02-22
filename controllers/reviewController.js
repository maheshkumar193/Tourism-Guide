const Review = require("../models/reviewModel")
const catchAysnc = require("../utils/catchAysnc")
const factory = require('./handlerFactory')


exports.setReqBodyFields = (req, res, next) => {
  // setting fields for nested route /tours/tourId/review
  console.log("check this", req.params)
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id
  next()
}

exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)