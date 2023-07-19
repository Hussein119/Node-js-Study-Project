const express = require('express');
const viewControllers = require('../controllers/viewsControllers');
const authControllers = require('../controllers/authControllers');

const router = express.Router();

router.use(authControllers.isLogedIn);

router.get('/', viewControllers.getOverview);
router.get('/tour/:slug', viewControllers.getTour);
router.get('/login', viewControllers.getLoginForm);

module.exports = router;
