export default class ApiFeatures{
    constructor(query,queryStr){
        this.query=query,
        this.queryStr=queryStr
    }
    search(){
        const keyword = this.queryStr.keyword
        if (!keyword) return this;
        const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        
        this.query = this.query.find({
            $or:[
                {name:{$regex:safeKeyword,$options:"i"}},
                {description:{$regex:safeKeyword,$options:"i"}},
                {address:{$regex:safeKeyword,$options:"i"}},
            ]
        })
        return this
    }
    filter(){
    const queryCopy = {...this.queryStr}

    const removeFeilds = ["keyword","page","limit"]
    removeFeilds.forEach((key)=> delete queryCopy[key])

    let queryStr = JSON.stringify(queryCopy)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key => `$${key}`)

    const parsedQuery = JSON.parse(queryStr)

    Object.keys(parsedQuery).forEach((field) => {
        const val = parsedQuery[field]
        if (val && typeof val === "object") {
            Object.keys(val).forEach((op) => {
                if (!isNaN(val[op])) val[op] = Number(val[op])
            })
        } else if (!isNaN(val) && val !== "" && val !== true && val !== false) {
            parsedQuery[field] = Number(val)
        }
    })

    this.query = this.query.find(parsedQuery)
    return this
}
    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1
        const skip = resultPerPage * (currentPage-1)
        this.query = this.query.limit(resultPerPage).skip(skip)
        return this
    }
}