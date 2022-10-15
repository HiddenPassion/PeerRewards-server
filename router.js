const express = require('express');
const passport = require('passport');

const UserController = require('./controllers/users');
const RewardsController = require('./controllers/rewards');
require('./setting/passportSetting');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  const apiRoutes = express.Router();
  const authRoutes = express.Router();
  const workWithBooksData = express.Router();
  const rewardsRoute = express.Router();


  apiRoutes.use('/auth', authRoutes);
  apiRoutes.use('/rewards', rewardsRoute);
  authRoutes.post('/signin', requireLogin, UserController.login);
  authRoutes.post('/signup', UserController.register); //+
  // rewardsRoute.post('/create', RewardsController.createRewards)
  // rewardsRoute.get('/lookup', RewardsController.getRewards)
  // apiRoutes.get('/users', UserController.getUsers)
  rewardsRoute.post('/create', requireAuth, RewardsController.createRewards)
  rewardsRoute.get('/lookup', requireAuth, RewardsController.getRewards)
  apiRoutes.get('/users', requireAuth, UserController.getUsers)
  app.use('/api', apiRoutes);

  app.use((err, req, res, next) => {
    if (err.name === 'MongoError' && err.code === 11000){
      res.status(422).json({message : "User with  this email is yet exist", status: 422});
    } else {
      res.status(500).json(err);
    }
  });



  app.use((req, res) => {
    res.sendStatus(404);
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
};
