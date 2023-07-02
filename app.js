const express = require('express');
const morgan = require('morgan');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');

const app = express();

// middlewares
// middleware : function that can modify the incoming request data
// called middleware because it is in the middle of the request and respond.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Createing middleware // worjing with every request
// app.use((req, res, next) => {
//   console.log('Hello from middleware 😍');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// this code be the last one after a routes
// all -> for all http methods
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// global error handeling
app.use(globalErrorHandler);

module.exports = app;
