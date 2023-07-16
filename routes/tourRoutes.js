const express = require('express');
const tourcontrollers = require('../controllers/tourcontrollers');
const authControllers = require('../controllers/authControllers');
//const reviewControllers = require('../controllers/reviewControllers');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// nested routes
// Post /tour/sd5566(tour id)/reviews
// Get /tour/sd5566(tour id)/reviews
// Get /tour/sd5566(tour id)/reviews/dsG655(review id)

// router
//   .route('/:tourId/reviews')
//   .post(
//     authControllers.protect,
//     authControllers.restrictTo('user'),
//     reviewControllers.createReview
//   );

router.use('/:tourId/reviews', reviewRouter);

// Create a checkBody middleware function
// Check if the body contains the name and price property
// If not, send back 400 (bad request)
// Add it to the post handler stack
//router.param('body', tourcontrollers.checkBody);

// Tours

router
  .route('/top-5-cheap')
  .get(tourcontrollers.aliasTopTours, tourcontrollers.getAllTours);

router.route('/tour-stats').get(tourcontrollers.getTourStats);
router.route('/monthly-plan/:year').get(tourcontrollers.getMonthlyPlan);

router
  .route('/')
  .get(authControllers.protect, tourcontrollers.getAllTours)
  .post(tourcontrollers.createTour);
//.post(tourcontrollers.checkBody, tourcontrollers.createTour);

router
  .route('/:id')
  .get(tourcontrollers.getTour)
  .patch(tourcontrollers.updateTour)
  .delete(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourcontrollers.deleteTour
  );

module.exports = router;
