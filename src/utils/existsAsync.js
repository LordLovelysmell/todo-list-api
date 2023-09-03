const fs = require("fs");

// Wrap fs.existsSync in promise to not block the stream
module.exports = function existsAsync(path) {
  return new Promise((resolve) => {
    resolve(fs.existsSync(path));
  });
};
