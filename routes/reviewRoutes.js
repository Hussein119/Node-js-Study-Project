const express = require('express');
const reviewControllers = require('../controllers/reviewControllers');
const authControllers = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });

// Post /tour/sd5566(tour id)/reviews
// GET /tour/sd5566(tour id)/reviews
// Post /reviews

router.route('/').get(reviewControllers.getAllReviews).post(
  authControllers.protect,
  authControllers.restrictTo('user'),
  reviewControllers.setTourUserIds,
  reviewControllers.createReview
);

router
  .route('/:id')
  .patch(reviewControllers.updateReview)
  .delete(reviewControllers.deleteReview);

module.exports = router;
