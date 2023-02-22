const express = require('express')

const app = express()
const morgan = require('morgan')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoDBSanitize = require('express-mongo-sanitize')
const xssSantize = require('xss-clean')
const hpp = require('hpp')

console.log(`currently working on ${process.env.NODE_ENV} environment`)

//helmet function return a middleware
//helmet sets various http headers
app.use(helmet())

if(process.env.NODE_ENV === 'development'){
  console.log('using the middle ware morgan')
  app.use(morgan('dev'))
}

//limiter is middleware, (req, res, next) => {}
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, //1hr
  max: 60 * 12, //assuming we get a req in every 5s
  message: "Too many requests, please try again later.",
})

// when a route starts with /api, (req, res) objects goes through limiter middleware
app.use('/api',limiter)

// app.use((req,res,next)=>{
//   if(req.method === 'GET' && req.path === '/api/v1/tours'){
//     res.json({message : 'jai ketan 🔥'})
//   }
//   next()
// })

//use middle ware express.json() to add body property to req
//its good practise to limit amount data in req
app.use(express.json({limit : '10kb'}))

//morgan('dev') && express.json() returns a function which has (req,res,next) as parameters and calls next at the end

//data sanitization against NOSQL injection
app.use(mongoDBSanitize())

//data santization against xss
app.use(xssSantize())

//hpp helps in prevention of parameter pollution
app.use(hpp({
  whitelist: ['price', 'duration', 'difficuilty', 'maxGroupSize', 'ratingAverage', 'ratingQuantity']
}))

app.use(express.static(`${__dirname}/public`)) //serving static files
//public acts as 127.0.0.1:8000

//which ever middle ware comes first that is served
app.get('/overview.html',(req,res)=>{
  console.log('checking the preference of routing over the static serving')
  res.json({
    message : "checking the preference of routing over the static serving"
  })
})

app.use((req, res, next) => {
  console.log('hello from middleware')
  next()
})

app.use((req, res, next) => {
  req.startTime = new Date().toISOString()
  // console.log(req.headers)
  next()
})

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

app.use('/api/v1/tours',tourRouter);

app.use('/api/v1/users',userRouter);

app.use('/api/v1/reviews',reviewRouter);

app.all('*', (req, res, next) => { // all for all methods (get, post, put, patch, delete)
  // '*' is for all api end points
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`
  // })
  // const err = new Error(`Can't find ${req.originalUrl} on this server`)
  // err.statusCode = 404
  // err.status = 'fail'
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404)
  next(err) // if we pass an arguement in next() nodeJS will use global error handling middleware in next step
})

app.use(globalErrorHandler)

module.exports = app;
