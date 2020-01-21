const fs = require('fs');
const path = require("path");
const rootDir = require('./paths');

exports.deleteFile = (filePath) => {
  // search file from project root and delete
  fs.unlink(path.resolve(rootDir, filePath), (error) => {
    if (error) {
      throw new Error(error);
    }
  });
}