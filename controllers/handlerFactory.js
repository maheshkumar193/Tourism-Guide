const catchAsync = require('../utils/catchAysnc')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    // Model is can accessed because of lexical scope
    const doc = await Model.findByIdAndDelete(req.params.id)
    
    if(!doc) return next(new AppError('No doc found with that ID',404))
  
    res.status(204).json({
      status: 'success',
      data: {}
    })
  })
}

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if(!doc) return next(new AppError('No doc found with that ID',404))

  res.status(200).json({
    status: 'success',
    data: {
      doc
    }
  })
})

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        doc
      }  
    })  
  })
}

exports.getOne = (Model, popOps) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOps) query = query.populate(popOps).cache({key: req.user?.id})
    const doc = await query
  
    if(!doc) return next(new AppError('No doc found with that ID',404))
  
    res.status(200).json({
      status: 'success',
      data: doc
    })
  })
}

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = {tour: req.params.tourId}
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const docs = await features.query.cache({key: req.user?.id})
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs
      }
    })
  })
}