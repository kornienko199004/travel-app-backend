const { Schema, model } = require('mongoose');

const localeSchema = new Schema({
  _id: false,
  lang: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  capital: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const countrySchema = new Schema({
  flagImageUrl: String,
  imageUrl: String,
  videoUrl: String,
  currency: {
    type: String,
    // required: true,
  },
  ISO: {
    type: String,
    uppercase: true,
    unique: true,
    required: true,
  },
  mapPoint: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  localizations: [localeSchema],
});

const Country = model('Country', countrySchema);

module.exports = Country;