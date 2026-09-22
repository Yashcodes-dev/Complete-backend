class ApiResponse {
    constructor(statusCode, data, message = "Sucess"){
        this.statusCode = statusCode
        this.data = data
        this.success = statusCode < 400
        this.message = message
    }
}

// const obj1 = new ApiResponse(404, null, "hi");
// console.log(obj1);


export {ApiResponse }