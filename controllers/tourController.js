const fs = require('fs')
const Tour = require('./../models/tourModel')
const catchAsync = require('../utils/catchAysnc')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
  req.query = {
    sort: 'price,-ratingAverage',
    limit: 5,
    fields: 'name,duration,difficulty,price,ratingAverage'
  }
  next()
}



exports.getAllTours = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour, {path: 'reviews'})

exports.createTour = factory.createOne(Tour)

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour)

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {ratingAverage: {$gte: 4.5}} // stage 1
    },{
      $group: {
        _id: '$difficulty',
        // _id: '$ratingAverage',
        numTours: {$sum: 1},
        numRatings: {$sum: '$ratingQuantity'},
        avgRating: { $avg: '$ratingAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: { $min: '$price'},
        maxPrice: { $max: '$price'}
      }
    },{
      $sort: {
        avgPrice: -1// 1 for ascending, -1 for decending
      }
    }
    // ,{
    //   $match: {
    //     _id: { $ne: 'easy'}
    //   }
    // } can match multiple times
  ])
  res.status(200).json({
    status: 'success',
    stats
  })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    }, {
      $match : {
        startDates: {
          $gte: new Date(`${year}-1-1`), //year-month-date
          $lte: new Date(`${year}-12-1`)
        }
      }
    }, {
      $group: {
        _id: {
          $month: '$startDates'
        },
        numTours: {$sum: 1},
        tours: { $push: '$name'} //array 
      }
    }, {
      $sort: {
        numTours: -1,
        _id: 1
      }
    }, {
      $addFields: {
        month: '$_id'
      }
    }, {
      $project: {
        _id: 0 //remove this filed
      }
    }, {
      $limit: 3 //set limit to 3
    }
  ])
  res.status(200).json({
    status: 'success',
    data: plan
  })
})

/*
old code
exports.getTour = catchAsync(async (req, res, next) => {
  //req.params is an object, which stores all variables of url
  // console.log(req.params)
  // const id = Number(req.params.id)
  // const tour = tours.find((el) => el.id === id)
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour //actually tour : tour, but if key-value pair has same name, only specifying val is enough to create key-value pair
  //   }
  // })
  const tour = await Tour.findById(req.params.id).populate('reviews')

  if(!tour) return next(new AppError('No tour found with that ID',404))

  //Tour.findOne({_id: req.params.id})
  res.status(200).json({
    status: 'success',
    tour
  })
})

exports.createTour = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1
  const newTour = Object.assign({ id: newId }, req.body)
  tours.push(newTour)
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) return console.log('file not found')
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      })
    }
  )
  res.send('done');

  //first way of creating a new document
  newTour = new Tour({obj})
  newTour.save().then(()=>{}).catch(()=>{})

  //second way
  const newTour = await Tour.create(req.body)
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  })

})

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

exports.checkID = (req,res,next,val)=>{
  console.log(`tour id is ${val}`);
  if(val>=tours.length){
    return res.status(404).json({
      status : 'fail',
      message : 'invalidID'
    })
  }
  next();
}

exports.checkBody = (req,res,next)=>{
  console.log('checking body');
  if(!req?.body?.name || !req?.body?.price){
    console.log('body is not ok')
    return res.status(400).json({
      status : 'fail',
      message : 'missing name or price'
    })
  }
  console.log('body is ok');
  next();
}

exports.updateTour = catchAsync(async (req, res, next) => {
  const id = req.params.id * 1 //type coercion
  const data = req.body
  console.log(data)
  console.log(tours);
  for (let key in data) {
    console.log(key, data[key])
    tours[id][key] = data[key]
  }
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) return console.log('no file found')
      res.status(200).json({
        status: 'success',
        data: {
          tour: tours[id]
        }
      })
    }
  )
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if(!tour) return next(new AppError('No tour found with that ID',404))

  res.status(200).json({
    status: 'success',
    tour
  })
})

exports.deleteTour = (async (req, res, next) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: 'success',
      data: {}
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
})

other way

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)
  console.log(tour)
  if(!tour) return next(new AppError('No tour found with that ID',404))
  res.status(204).json({
    status: 'success',
    data: {}
  })
})
*/