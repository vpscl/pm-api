const error = (err, req, res, next) => {
  if (!err.status) return res.status(500).json({ message: err.message });
  res.status(err.status).json({ message: err.message });
  next();
};

module.exports = error;
