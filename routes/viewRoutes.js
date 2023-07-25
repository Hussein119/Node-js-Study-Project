const express = require('express');
const viewControllers = require('../controllers/viewsControllers');
const authControllers = require('../controllers/authControllers');
const bookingControllers = require('../controllers/bookingControllers');

const router = express.Router();

router.get('/me', authControllers.protect, viewControllers.getAccount);
router.get('/my-tours', authControllers.protect, viewControllers.getMyTours);

router.post(
  '/submit-user-data',
  authControllers.protect,
  viewControllers.updateUserData
);

router.use(authControllers.isLogedIn);

router.get(
  '/',
  bookingControllers.createBookingCheckout,
  viewControllers.getOverview
);
router.get('/tour/:slug', viewControllers.getTour);
router.get('/login', viewControllers.getLoginForm);

module.exports = router;
