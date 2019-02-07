const mongoose = require('mongoose')

const pokeListSchema = new mongoose.Schema({
  poke_num: {
    type: Number,
    required: true,
    min: 1,
    max: 151
  },
  name: {
    type: String,
    required: true
  },
  img: {
    silhouette: {
      type: String,
      required: true
    },
    visible: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Poke_list', pokeListSchema)
