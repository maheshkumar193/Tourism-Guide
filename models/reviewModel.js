// rating, createdAt, tour ref, user ref
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const reviewSchema = Schema({
  review: {
    type: String,
    required: [true, 'should have a review field']
  },
  rating: {
    type: Number,
    min: [1.0, 'rating must above 1'],
    max: [5.0, 'must be below 5']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tours',
    required: [true, 'every review should belong a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    required: [true, 'every review should belong a user']
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})


reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  //   // model: 'Tours' if for some reason ref field in schema avoided
  //   // need to check, guides is also selected along with name
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // })
  
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  
  next()
})



const reviewModel = mongoose.model('Reviews', reviewSchema)

module.exports = reviewModel