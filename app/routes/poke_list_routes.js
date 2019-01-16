// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for poke_lists
const PokeList = require('../models/poke_list')

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
/* const requireOwnership = customErrors.requireOwnership */

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /poke_lists
router.get('/poke_lists', requireToken, (req, res) => {
  PokeList.find()
    .then(poke_lists => {
      // `poke_lists` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return poke_lists.map(poke_list => poke_list.toObject())
    })
    // respond with status 200 and JSON of the poke_lists
    .then(poke_lists => res.status(200).json({ poke_lists: poke_lists }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// SHOW
// GET /poke_lists/5a7db6c74d55bc51bdf39793
router.get('/poke_lists/:id', requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  PokeList.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "poke_list" JSON
    .then(poke_list => res.status(200).json({ poke_list: poke_list.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
