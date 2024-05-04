const fs = require('fs');
const http = require('http');
const https = require('https');

const downloadImage = (url, destPath) => {
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    protocol.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve(destPath));
      });
    }).on('error', err => {
      fs.unlink(destPath, () => reject(err));
    });
  });
};

module.exports = {
    downloadImage
  };