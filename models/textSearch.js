const mongoose = require('mongoose')
//creating a schema
const searchSchema = new mongoose.Schema({
    description : String,
    tags: [String],
    name: String
})

searchSchema.index({description: 'text'})

const searchModel = mongoose.model('Search', searchSchema)

module.exports = searchModel

