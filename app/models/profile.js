const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  fav_poke_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poke_list',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Profile', profileSchema)
