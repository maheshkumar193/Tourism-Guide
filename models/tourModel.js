const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
//creating a schema
const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true,'tour should have a name'],//validator
      unique: true,
      maxLength: [40, 'a tour name must have less than 41 characters'],
      minLength: [10, 'a tour name must have more than 9 characters'],
      // validate: [validator.isAlpha, 'Tour name must be only contain alphabest']
    },
    slug: {
      type: String
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'rating must above 0'],
      max: [5.0, 'must be below 5']
    },
    ratingQuantity:{
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      required: [true,'tour should have duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true,'tour should have max group size']
    },
    difficulty: {
      type: String,
      required:  [true,'tour should have difficulty'],
      enum: { //enum for only strings
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult'
      }
    },
    price: {
      type: Number,
      required : [true,'tour should have a price']// if price is not mentioned, then validtor throws this error
    },
    // priceDiscount: Number,
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) { //just function defination is required
          //this point to current document
          return this.price >= val;
        },
        message: `priceDiscount{VALUE} can't be bigger than price itself 😂`
      }
      // validate: function (val) {
      //   return val < this.price
      // }
    },
    summary: {
      type: String,
      required: [true, 'tour should have a summary'],
      trim: true //removes starting and ending spaceses
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'tour should have an image cover']
    },
    images: [String], //array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: { //custom data type
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [ // array of custom objects, which will also contain _id field for each doc in this array
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users'
      }
    ]
  },
  {
    toJSON: {virtuals: true}, // giving options
    toObject: {virtuals: true} // when output is in JSON or object we get virtuals
    // providing these options loads most of the work to model
    // thus following fat model thin controller
  })

tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.virtual('durationInWeeks').get(function(){
  return this.duration/7;
})
//virtual properties are not stored in DB
//virtual properties also can't be queried as not present in DB

// virtual populate, replacement of child referencing
tourSchema.virtual('reviews', {
  ref: 'Reviews',
  foreignField: 'tour',
  localField: '_id'
})


//Document middle ware
//this will point to current document

tourSchema.pre('save', function (next) { //this middleware is called only before .save() && .create()
  this.slug = slugify(this.name, { lower: true})
  // console.log(`before saving\n ${this}`)
  next() // calling next middleware of save
  // if multiple middlewares are present, calling next() is compulsory for successful execution of req
  // its good practise to always call next()
})

tourSchema.pre('save', function (next) {
  // console.log('will next middleware for save')
  next()
})

tourSchema.post('save', function (doc, next) {
  console.log('after saving')
  next()
})

//query middleware
//this will point to query
tourSchema.pre(/^find/, function (next) { // all queries which start with find
  this.queryStartTime = Date.now()
  this.find({secretTour: {$ne: true}}) // need to know what's going on
  // console.log('query points to ',this)
  next()
})

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -changedPasswordAt'
  })
  next()
})

tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.queryStartTime}ms`)
  // console.log(docs);
  next();
})

//Aggregate middleware
//this will point to aggregate query (which is an object containing fields like _pipeline, options)
tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline().unshift({'$match' : { secretTour : {$ne : true}}}))
  next()
})
//creating a model
//name of collection in dbs is saved as 'Tours'
const Tour = mongoose.model('Tours',tourSchema)

module.exports = Tour