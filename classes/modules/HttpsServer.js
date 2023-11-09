/* global __dirname */

const path = require('path');
const fs = require('fs');
const https = require('https');

const sslChecker = require('ssl-checker')

const getSslDetails = async (hostname) => await sslChecker(hostname)


function getDirectoriesRecursively(dirPath) {
  let dirs = [];

  // Get all the files and directories within the specified path
  const files = fs.readdirSync(dirPath);

  // Loop through each file and directory
  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    // Check if the current item is a directory
    if (fs.statSync(filePath).isDirectory()) {
      dirs.push(filePath);

      // Recursively get the directories within the current directory
      const subDirs = getDirectoriesRecursively(filePath);
      dirs = dirs.concat(subDirs);
    }
  });

  return dirs;
}

function createServer(app, port,hostname) {
  try {

    const pathLetsencrypt = '/etc/letsencrypt/live/';
   
    let domain = pathLetsencrypt+hostname;
    let httpsServer;
    console.log("PATH: ",path, "DOMAIN: ",domain);
    const sslpath =  path.join(domain);
    console.log("SSLPATH: ", sslpath);

    const privateKey = fs.readFileSync(path.join(sslpath, 'privkey.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(sslpath, 'cert.pem'), 'utf8');
    const chainBundle = fs.readFileSync(path.join(sslpath, 'chain.pem'), 'utf8');

    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: chainBundle,
      ciphers: [
        "ECDHE-RSA-AES256-SHA384",
        "DHE-RSA-AES256-SHA384",
        "ECDHE-RSA-AES256-SHA256",
        "DHE-RSA-AES256-SHA256",
        "ECDHE-RSA-AES128-SHA256",
        "DHE-RSA-AES128-SHA256",
        "HIGH",
        "!aNULL",
        "!eNULL",
        "!EXPORT",
        "!DES",
        "!RC4",
        "!MD5",
        "!PSK",
        "!SRP",
        "!CAMELLIA"
      ].join(':')
    };
    const helmet = require('helmet');
    const ONE_YEAR = 31536000000;
    if (app) {
      app.use(helmet.hsts({
        maxAge: ONE_YEAR,
        includeSubDomains: true,
        force: true
      }));
      httpsServer = https.createServer(credentials, app);
    } else {
      httpsServer = https.createServer(credentials);
    }

  
    if (port) {
      httpsServer.listen(port);
      console.log('HTTPS iniciado en puerto ' + port);
    }


    return httpsServer;
  } catch (err) {
    console.error(err)
  }
}

module.exports = createServer;
