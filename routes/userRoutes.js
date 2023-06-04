const express = require('express');
const usercontroller = require('./../controllers/userControllers');

const router = express.Router();
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
