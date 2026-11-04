
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // Duplicate MongoDB record
    if (err.code === 11000) {
        statusCode = 409;

        const field = Object.keys(err.keyValue || {})[0];

        message = field
            ? `${field} already exists`
            : "Duplicate record already exists";
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;

        message = Object.values(err.errors)
            .map((error) => error.message)
            .join(", ");
    }

    // Invalid JSON request body
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        statusCode = 400;
        message = "Invalid JSON request body";
    }

    // Prevent exposing internal server details
    if (statusCode >= 500) {
        message = "Internal Server Error";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

export default errorHandler;
