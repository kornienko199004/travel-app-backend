const { Schema, model } = require('mongoose');

const sightLocaleSchema = new Schema({
  _id: false,
  lang: {
    type: String,
    required: true,
  },
  name: String,
  description: String,
});

const sightSchema = new Schema({
  countryId: {
    type: Schema.Types.ObjectId,
    require: true,
  },
  imageUrl: {
    type: String,
    require: true,
  },
  scores: [
    {
      user: {
        type: Schema.Types.ObjectId,
        require: true,
      },
      score: {
        type: Number,
        require: true,
      },
    }
  ],
  localizations: [sightLocaleSchema],
});

const Sight = model('Sight', sightSchema);

module.exports = Sight;