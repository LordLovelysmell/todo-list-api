// Helper function to facade try-catch block
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
