const express = require('express');
const usercontroller = require('../controllers/userControllers');
const authControllers = require('../controllers/authControllers');

const router = express.Router();

// auth

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);

router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

router.patch(
  '/updateMyPassword',
  authControllers.protect,
  authControllers.updatePassword
);

router.patch('/updateMe', authControllers.protect, usercontroller.updateMe);
router.delete('/deleteMe', authControllers.protect, usercontroller.deleteMe);

// Users
router
  .route('/')
  .get(usercontroller.getAllUsers)
  .post(usercontroller.createUser);
router
  .route('/:id')
  .get(usercontroller.getUser)
  .patch(usercontroller.updateUser)
  .delete(usercontroller.deleteUser);

module.exports = router;
