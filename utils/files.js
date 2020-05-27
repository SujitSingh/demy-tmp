const fs = require('fs');
const path = require("path");
const rootDir = require('./paths');
const demyConfig = require('./config');

exports.createImgsFolderIfNotPresent = () => {
  // create uploaded images folder if not present
  const dirPath = path.join(rootDir, demyConfig.productImgsRoot);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

exports.deleteFile = (filePath) => {
  // search file from project root and delete
  fs.unlink(path.resolve(rootDir, filePath), (error) => {
    if (error) {
      console.log(error);
      // throw new Error(error);
    }
  });
};

exports.reqLoggerFileStream = fs.createWriteStream(
  // for writing request logs
  path.join(rootDir, 'requests.log'),
  { flags: 'a' }
); 