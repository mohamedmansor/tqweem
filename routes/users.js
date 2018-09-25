var express = require('express');
const { check, validationResult } = require('express-validator/check');
var router = express.Router();
var User = require('../models/users')
var jwt = require('jwt-simple');
const moment = require('moment')
const authorizationMiddleWare = require('../middlewares/authentication-middleware').authorization;
const jwtEncoding = require('../middlewares/authentication-middleware').jwtEncoding;
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json({ "message": "Welcome to tqweem API" })
});

let middleWareChecker = [
  // username must be an email
  check('email').isEmail(),
  // password must be at least 6 chars long
  check('password').isLength({ min: 6 })
]

router.post('/register', middleWareChecker, function (req, res, next) {
  // check use is unique email
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let avatar = req.body.avatar;

  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  User.find({ "email": req.body.email }, function (err, user) {
    if (user.length > 0 && user[0].email == req.body.email) {
      console.log('[DEBUG] user', user)
      console.log("email already exsist ...!");
      res.status(400).json({ msg: 'The email address you have entered is already associated with another account.' })
    } else {

      let newUser = new User({
        username: username,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        avatar: avatar
      })
      // Create new user
      User.createUser(newUser, function (err, user) {
        if (err) throw errors
        res.status(201).json(user);
        console.log('[Create New User] ', user)
      });
    }
  });
});

router.post('/login', function (req, res, next) {
  // return JWT Toekn for login
  if (req.body.email && req.body.password) {
    User.find({ "email": req.body.email }, function (err, user) {
      if (err) {
        console.log(err);
      }
      else {
        if (user.length > 0) {
          User.comparePassword(req.body.password ,user[0].password , function (err, isMatch) {
            if (err) throw err
            const payload = {
              data: user[0],
              iat: moment().format('YYYY-MM-DD'),
              exp: moment().add(1, 'months').format('YYYY-MM-DD')
            }
            const Token = jwtEncoding(payload)
            res.status(200).json({ accessToken: Token });
          })
        } else {
          res.status(400).json("Invalid email or Password")
        }
      }
    });

  } else {
    res.status(400).json("Invalid_Paramters")
  }
});

router.put('/:userId', authorizationMiddleWare, function (req, res, next) {
  console.log("[Edit User]");

  User.findOneAndUpdate(req.param.id, req.body, { new: true }, function (err, user) {
    if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    res.status(200).json(user)
  });
});

router.delete('/:userId', authorizationMiddleWare, function (req, res, next) {
  console.log("[Delete user]", req.params.userId)
  User.remove({ "_id": req.params.userId }, function (err, user) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    else {
      let response = {
        message: "User Deleted Successfully",
      }
      return res.status(204).json(response)
    }
  });
});

module.exports = router;
