// Middleware to add a 4-second delay without sending an immediate response
export const delayMiddleware = (req, res, next) => {
  if (req.method !== "DELETE") {
    // Delay the request for 4 seconds
    setTimeout(() => next(), 4000);
  } else {
    next(); // No delay for DELETE requests
  }
};
