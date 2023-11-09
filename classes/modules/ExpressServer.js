const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');

const fs = require('fs')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
//const cors = require("cors")  // npm i cors
const uuid = require('uuid'); // Require the uuid library


// Apply rate limiting middleware to a specific endpoint
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Allow up to 3 requests per minute
    message: 'Too many requests from this IP, please try again later.'
  });
  
app.use('/generate', apiLimiter);


const session = require('express-session');
app.use(session({
    genid: function(req) {
        // Generate a random session ID using uuid
        return uuid.v4();
    },
    secret: 'akjsv890jfls980s24k3j4',
    resave: false,
    saveUninitialized: true
}));

const path = require('path');
const currentDir = process.cwd();
const PUBLIC_HTML_ABSOLUTE_PATH = path.join(currentDir, '/front/public_html');
console.log(PUBLIC_HTML_ABSOLUTE_PATH);


const protectedPaths = ["/orders.html"];
const checkSession = (req, res, next) => {

    if (stringToBoolean(process.env.SSL)) {
        //console.log('Redirecting to HTTPS connection');
        if(!req.secure)
        {
            res.redirect('https://' + req.headers.host + req.url)
             return;
        }
    }


   // console.log('Checking session: ');
    //console.log(req.path);
     if (protectedPaths.includes(req.path) && !req.session.authenticated) {
          return res.redirect('/login.html');

      }
      next();
  };
  


//Set up app endpoints
app.use('/', checkSession);
app.use('/', express.static(PUBLIC_HTML_ABSOLUTE_PATH));



const cors = require('cors');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
const fileUpload = require('express-fileupload');
app.use(fileUpload()); 
app.use(cors());
require('dotenv').config();
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

let PORT = process.env.PORT;
let hostname = process.env.HOSTNAME || 'localhost';
console.log('hostname: ',hostname);
if (currentDir.includes('/mnt/c') || currentDir.includes('C:') || hostname.includes("localhost")) {
    console.log('Starting localhost!');
    if (!PORT)
        PORT = 3000;
    app.listen(PORT);
    //rime = new Rime();
}
else {

    if (stringToBoolean(process.env.SSL) == false) {
        if(!PORT)
            PORT =80;
        console.log('Starting Server in Port: ', PORT);
        app.listen(PORT);
    }
    /*else if (PORT !== undefined && stringToBoolean(process.env.SSL) == true) {
        console.log('Starting Server in Port: ', PORT);
        const httpsServer = require('./HttpsServer.js')(app, PORT, hostname);
    }*/
    else {
        console.log('Starting SSL serverhost!');

        if(!PORT)
            PORT=443;
        const httpsServer = require('./HttpsServer.js')(app, PORT, hostname);
        //TO BE ABLE TO REDIRECT TO 443
        //app.listen(80);


        //REDIRECT http to https
        
        //app.enable('trust proxy')
        /*app.use('/',(req, res, next) => {
            console.log('HTTPS redirect')
            req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
        });*/
       
    }
}

function stringToBoolean(stringValue) {
    switch (stringValue?.toLowerCase()?.trim()) {
        case "true":
        case "yes":
        case "1":
            return true;

        case "false":
        case "no":
        case "0":
        case null:
        case undefined:
            return false;

        default:
            return JSON.parse(stringValue);
    }
}

module.exports = app;


