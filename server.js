const express = require ('express')
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

//Load env vars
dotenv.config({path:'./config/config.env' });

//Connect to database
connectDB();

//Route files
const restaurants = require('./routes/restaurants');
const auth = require('./routes/auth');
const reservations = require("./routes/reservations");

const app=express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 10000
  });
  
app.use(limiter);

// Set security headers
app.use(helmet());

// Body parser
app.use(express.json());

// Prevent XSS attacks
app.use(xss());

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Use CORS
app.use(cors());



//Mount routers
app.use('/api/v1/restaurants',restaurants);
app.use('/api/v1/auth',auth);
app.use("/api/v1/reservations", reservations);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
})