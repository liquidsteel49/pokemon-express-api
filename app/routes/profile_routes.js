// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
const mongoose = require('mongoose')

// pull in Mongoose model for profiles
const Profile = require('../models/profile.js')
const Poke_list = require('../models/poke_list.js')

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require('../../lib/error_handler')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /profiles
router.get('/profile', requireToken, (req, res) => {
  Profile.find()
    .then(profiles => {
      // `examples` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return profiles.map(profile => profile.toObject())
    })
    // respond with status 200 and JSON of the examples
    .then(profiles => res.status(200).json({ profiles: profiles }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// SHOW
// GET /profiles/5a7db6c74d55bc51bdf39793
router.get('/profile/:owner', (req, res) => {
  console.log(req.params)
  // req.params.id will be set based on the `:id` in the route
  Profile.findOne({ owner: req.params.owner })
    // .then(handle404)
    // .then(profile =>
    //   Poke_list.findOne({ poke_num: profile.fav_poke_id })
    //     .then(poke => {
    //       profile.poke_name = poke.name
    //       return profile
    //     })
    // )
    // if `findById` is succesful, respond with 200 and "profile" JSON
    .then(profile => res.status(200).json({ body: profile.toObject() }))
    .then(console.log(res))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// CREATE
// POST /profiles
router.post('/profile', requireToken, (req, res) => {
  // set owner of new profile to be current user
  let id = mongoose.Types.ObjectId(req.user.id)
  req.body.owner = id

  Poke_list.findOne({ poke_num: req.body.fav_poke_id })
    .then(poke => {
      return poke._id
    })
    .then(pokeID => {
      req.body.fav_poke_id = pokeID
      return Profile.create(req.body)
      // respond to succesful `create` with status 201 and JSON of new "profile"
      // .then(profile => {
      //   res.status(201).json({ profile: profile.toObject() })
      // })
      // // if an error occurs, pass it off to our error handler
      // // the error handler needs the error message and the `res` object so that it
      // // can send an error message back to the client
      // .catch(err => console.log(err))
    })
    .then(profile => {
      res.status(201).json({ profile: profile.toObject() })
    })
    .catch(err => handle(err, res))
  // // let dave = Poke_list.findOne({ poke_num: req.body.fav_poke_id }).exec(function (err, poke) {
  // //   if (err) {
  // //     console.log(err)
  // //   } else if (poke) {
  // //     return poke
  // //   } else {
  // //     console.log('NOOOOO!')
  // //   }
  // // })
  // let dave = Poke_list.findOne({ poke_num: req.body.fav_poke_id }).toObject()

  // let poke = Poke_list.findOne({ poke_num: req.body.fav_poke_id })
  // // poke.then(function (doc) { req.body.fav_poke_id = doc._id })

  // req.body.fav_poke_id = Poke_list.findOne({ poke_num: req.user.fav_poke_id })._id
  // console.log(req.body)

  // Profile.create(req.body)
  //   // respond to succesful `create` with status 201 and JSON of new "profile"
  //   .then(profile => {
  //     res.status(201).json({ profile: profile.toObject() })
  //   })
  //   // if an error occurs, pass it off to our error handler
  //   // the error handler needs the error message and the `res` object so that it
  //   // can send an error message back to the client
  //   .catch(err => handle(err, res))
})

// UPDATE
// PATCH /profiles/5a7db6c74d55bc51bdf39793
router.patch('/profile/:id', requireToken, (req, res) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.profile.owner

  Profile.findOne({ owner: req.params.id })
    .then(handle404)
    .then(profile => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, profile)

      // the client will often send empty strings for parameters that it does
      // not want to update. We delete any key/value pair where the value is
      // an empty string before updating
      Object.keys(req.body.profile).forEach(key => {
        if (req.body.profile[key] === '') {
          delete req.body.profile[key]
        }
      })

      // pass the result of Mongoose's `.update` to the next `.then`
      return profile.update(req.body.profile)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// DESTROY
// DELETE /profiles/5a7db6c74d55bc51bdf39793
router.delete('/profile/:id', requireToken, (req, res) => {
  Profile.findOne({ owner: req.params.id })
    .then(handle404)
    .then(profile => {
      // throw an error if current user doesn't own `profile`
      requireOwnership(req, profile)
      // delete the profile ONLY IF the above didn't throw
      profile.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
