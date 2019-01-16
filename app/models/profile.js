const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  fav_poke_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Poke_list'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Profile', profileSchema)
