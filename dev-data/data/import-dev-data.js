const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path:'../../config.env'})
const fs = require('fs')
const Tour = require('./../../models/tourModel')

// console.log(process.env)
const DB = process.env.MONGODBLINK.replace('<PASSWORD>',process.env.MONGODBPASSWORD)

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
.catch((err)=>{
  console.log('error occured while connecting to Data Base')
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))

const importData = async ()=>{
    try {
        await Tour.create(tours);
    } catch (err) {
        console.log('could not add tours data')
    }
    process.exit()
}

const deleteData = async ()=>{
    try {
        await Tour.deleteMany();
    } catch (err) {
        console.log('could not delete tours data')
    }
    process.exit() // stops the current server
}

console.log(process.argv)
// process.argv is an array which has all the commands from terminal

if (process.argv.includes('--import')) {
    importData()
} else if (process.argv.includes('--delete')){
    deleteData()
}