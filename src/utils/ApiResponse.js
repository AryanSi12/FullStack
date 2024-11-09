class ApiResponse 
{
    constructor(Status , data ,message="Success")
    {
        this.status = Status,
        this.data = data,
        this.message = message,
        this.success = Status < 400
    }
}

export {ApiResponse}