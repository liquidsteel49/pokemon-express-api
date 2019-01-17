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
router.get('/pokeLists', requireToken, (req, res) => {
  PokeList.find()
    .then(pokeLists => {
      // `poke_lists` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return pokeLists.map(pokeList => pokeList.toObject())
    })
    // respond with status 200 and JSON of the poke_lists
    .then(pokeLists => res.status(200).json({ pokeLists: pokeLists }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// SHOW
// GET /poke_lists/5a7db6c74d55bc51bdf39793
router.get('/pokeLists/:id', requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  PokeList.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "poke_list" JSON
    .then(pokeList => res.status(200).json({ pokeList: pokeList.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// CREATE
// POST /pokeLists
router.post('/pokeLists', requireToken, (req, res) => {
  // set owner of new pokeList to be current user
  // req.body.pokeList.owner = req.user.id

  PokeList.create(req.body.poke_list)
    // respond to succesful `create` with status 201 and JSON of new "example"
    .then(poke_list => {
      res.status(201).json({ poke_list: poke_list.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res))
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/pokeLists/:id', requireToken, (req, res) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  // delete req.body.pokeList.owner

  console.log(req.params)
  PokeList.findById(req.params.id)
    .then(handle404)
    .then(pokeList => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      // requireOwnership(req, pokeList)

      // the client will often send empty strings for parameters that it does
      // not want to update. We delete any key/value pair where the value is
      // an empty string before updating
      console.log(req.body.pokeList)
      Object.keys(req.body.pokeList).forEach(key => {
        if (req.body.pokeList[key] === '') {
          delete req.body.pokeList[key]
        }
      })

      // pass the result of Mongoose's `.update` to the next `.then`
      return pokeList.update(req.body.pokeList)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/pokeLists/:id', requireToken, (req, res) => {
  PokeList.findById(req.params.id)
    .then(handle404)
    .then(pokeList => {
      // throw an error if current user doesn't own `example`
      // requireOwnership(req, pokeList)
      // delete the example ONLY IF the above didn't throw
      pokeList.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
