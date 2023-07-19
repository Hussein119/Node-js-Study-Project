const path = require('path');
const express = require('express');
const morgan = require('morgan');
//npm i express-rate-limit
const rateLimit = require('express-rate-limit');
//npm i helmet
const helmet = require('helmet');
// npm i express-mongo-sanitize
const mongoSanitize = require('express-mongo-sanitize');
// npm i xss-clean
const xss = require('xss-clean');
// npm i hpp
const hpp = require('hpp');
const globalErrorHandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const AppError = require('./utils/appError');

const app = express();

// npm install pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL middlewares
// middleware : function that can modify the incoming request data
// called middleware because it is in the middle of the request and respond.

// Serving static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development looging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
// accepts 100 request form one IP in one hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json());
//app.use(express.json({limit: '10kb'}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Just Test Middeleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.headers);
//   next();
// });

// ROUTES
app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);

// this code be the last one after a routes
// all -> for all http methods
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// global error handeling
app.use(globalErrorHandler);

module.exports = app;
