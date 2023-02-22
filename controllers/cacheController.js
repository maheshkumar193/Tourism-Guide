const mongoose = require('mongoose')
const redis = require('redis')
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
const {promisify} = require('util')
client.hget = promisify(client.hget)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true
  this.hashKey = JSON.stringify(options.key || '')   
  return this 
}  

mongoose.Query.prototype.exec = async function () {   
  if (!this.useCache) return await exec.apply(this, arguments)   
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {collection: this.mongooseCollection.name}))   
  const hashKey = this.hashKey   // check if key is stored in cache   
  const cachedDoc = await client.hget(hashKey, key)   // if cachedDoc exists, do not make a mongoDB req   
  if (cachedDoc) {     
    console.log('serving from cache')     
    const parseDoc = JSON.parse(cachedDoc)     
    // need to check parseDoc is an array ([{res1}, {res2}, {res3}]), if it is an array     
    // then return array of model doc     
    const modelDoc = Array.isArray(parseDoc) ? parseDoc.map(d => this.model(d)) : this.model(parseDoc)     
    return modelDoc   
  }   
  // As we don't cachedBlog, make a req to mongoDB   
  console.log('serving from mongoDB')   
  // store result in cache      
  const doc = await exec.apply(this, arguments)   
  client.hset(hashKey, key, JSON.stringify(doc))   
  return doc 
}  

exports.removeHash = async function (req, res, next) {   
  await next()   
  client.del(JSON.stringify(req.user.id)) 
}