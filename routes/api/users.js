const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

//Call Validation function
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// @route   GET api/users/test
//@desc     Tests users route
//@access   Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Users API works."
  })
);

// @route   POST api/users/register
//@desc     Register new user
//@access   Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors)
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      msg = 'Email already exists';
      return res.status(400).json(msg);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', // Size
        r: 'pg', // Rating
        d: 'mm' // Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   POST api/users/login
//@desc     Login user and get JWT token
//@access   Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors)
  }

  //Find User by Email
  User.findOne({ email }).then((user) => {
    //Check for User
    if (!user) {
      errors.email = 'User not found'
      return res.status(404).json(errors.email)
    }

    //Check for Password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        //Payload for JWT
        const payload = { id: user.id, name: user.name, avatar: user.avatar }

        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          })
        })
      } else {
        errors.password = "Password didn't match!"
        return res.status(400).json(errors.password)
      }
    })
  })
})

// @route   POST api/users/current
//@desc     Return current user
//@access   Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  })
})

module.exports = router;
