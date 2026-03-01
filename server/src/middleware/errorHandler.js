const errorHandler = (err, req, res, next) => {
  if (err?.message) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = errorHandler;
