export default class errorHandler extends Error{
    public statusCode:number;
    constructor(statusCode:number,message:string){
        super(message)
        this.statusCode=statusCode

        Error.captureStackTrace(this,this.constructor)
    }
}

 