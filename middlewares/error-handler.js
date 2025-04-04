const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(err.statusCode).send({ message: err.message });
  res.status(statusCode).send({
    message: statusCode === 500 ? "An error occurred on the server" : message,
  });
  next();
};

module.exports = { errorHandler };
