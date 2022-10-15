const jwt = require('jsonwebtoken');
const _ = require('lodash');
//const crypto = require('crypto');

const Users = require('../models/user');
const config = require('../setting/config');

function generateToken(user) {
  return jwt.sign(user, config.secret, { expiresIn: Math.pow(99, 99)});
};

function prepareUserInfo(user) {
  return {
    ..._.pick(user, 'receivedAmount', 'sentAmount'),
    id: user._id,
    fullName: user.profile.fullName,
    logo: user.profile.logo || null,
  };
};

exports.login = function(req, res, next) {
  try {
    console.log('here234234')
    const userInfo = prepareUserInfo(req.user);

    res.status(200).json({
      token: generateToken(userInfo),
      user: userInfo
    });
  } catch (err) {
    next(err);
  }
}


exports.register = async function(req, res, next) {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
    } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'You must enter an email address.'});
    }

    if (!firstName || !lastName) {
      return res.status(400).send({ error: 'You must enter your full name.'});
    }

    if (!password) {
      return res.status(400).send({ error: 'You must enter a password.' });
    }

    const existingUser =await Users.findOne({ email });

    if (existingUser) {
      return res.status(422).send({ error: 'That email address is already in use.' });
    }

    const user = new Users({
      email,
      password,
      profile: {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
      },
    });
    const createdUser = prepareUserInfo(await user.save());

    res.status(201).json({
      token: generateToken(createdUser),
      user: createdUser,
    });
  } catch (err) {
    next(err);
  }
};

function getUserByToken (req) {
  const token = req.headers.authorization.split(' ')[1];

  return jwt.verify(token, config.secret);
};

exports.getUsers = async function(req, res, next) {
  try {
    const {id: currentUserId} = getUserByToken(req);

    const { name } = req.query || {}
    const users = await Users.find({
      _id: {$ne: currentUserId},
      'profile.fullName': {
        $regex: name || '',
        $options: 'i'
      }
    }).limit(5);

    res.status(200).json(users.map(prepareUserInfo))
  } catch (err) {
    console.log(err);
    next(err);
  }
}
