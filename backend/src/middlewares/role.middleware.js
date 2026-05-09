const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can access this route"
    });
  }

  next();
};

module.exports = {
  adminOnly
};