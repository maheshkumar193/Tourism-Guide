class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const queryObj = { ...this.queryString } //destructering allows shallow copy
    //direct assignment allows deep copy
    const excludedFields = ['page', 'limit', 'sort', 'fields']
    excludedFields.forEach((el) => {
      delete queryObj[el]
    })
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
    this.query = this.query.find(JSON.parse(queryStr))
    console.log("parsed query string", JSON.parse(queryStr))
    return this
  }

  sort() {
    if (this.queryString.sort) {
      //?sort=price
      const sortBy = this.queryString.sort.split(',').join('')
      this.query = this.query.sort(sortBy)
      // sort('field1 field2')
    } else {
      this.query = this.query.sort('-price') //sort decending order
    }
    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields) //?fields=x,y,z selects x,y,z fields only
    } else {
      this.query = this.query.select('-__v') // '-' removes these fields
    }
    return this
  }

  paginate() {
    //?page=3&limit=19
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 25
    const skip = limit * (page - 1)
    console.log(page, limit, " page & limit in paginate")
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
};

module.exports = APIFeatures