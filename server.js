const mongoose = require('mongoose')
const dotenv = require('dotenv')
// console.log(app.get('env'))

dotenv.config({path:'./config.env'})
//dotenv makes use of config.env to add env variables in process.env
// console.log(process.env)
//process is a global object in nodeJS
//process.env contains all env variables
const DB = process.env.MONGODBLINK.replace('<PASSWORD>',process.env.MONGODBPASSWORD)

process.on('uncaughtException', (err) => {
  console.log(err, err.name, err.message,"its an uncaught exception")
  process.exit(1)
})

mongoose.connect(DB,{
  useNewUrlParser : true,
  useCreateIndex : true,
  useFindAndModify : false,
  useUnifiedTopology: true 
})
.then((conn)=>{
  console.log(conn.connections)
  console.log('DB connection successfull')
})
// .catch((err)=>{
//   console.log('error occured while connecting to Data Base')
// })

const app = require('./app')


/*
creating a document (instance of class)

const testTour = new Tour({
  name: 'manali',
  rating : 4.8,
  price: 300
})

this document instance has access to some methods
ex: .save() to save in DB

testTour.save()
  .then((doc)=>{
    console.log('saved to DB ',doc)
  })
  .catch((err)=>{
    console.log('failed to save in DB ',err)
  })
*/


//start server
const port = process.env.PORT || 3000
const localhost = process.env.LOCALHOST
const server = app.listen(port,localhost, () => {
  console.log(`server running on port ${port} & host ${localhost}`)
})

process.on('unhandledRejection', err => {
  console.log(err.name, err.message,"its an unhandled promise rejection")
  //process.exit() shut down the server
  //0 means success
  //1 means uncaught expection occured
  //server.close grace fully completes the current requests and then closes
  server.close(()=>{
    process.exit(1) 
  })
})

// console.log(x)
