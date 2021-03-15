const Country = require('./country.schema');
const { NotFoundError } = require('../../common/errors/errors-list');
const { ENTITY_NAME } = require('./constants');
const {
  COLLECTION_NAME: SIGHTS_COLLECTION_NAME,
} = require('../sights/constants');
const { Types } = require('mongoose');
const User = require('../user/user.schema')

const countryExcludedFields = { _id: 0, __v: 0, lang: 0, localizations: 0 };
const placeExcludedFields = { countryId: 0, lang: 0, localizations: 0, __v: 0 };

const getAllByLang = async (lang) => {
  return await Country.aggregate()
    .match({ localizations: { $elemMatch: { lang } } })
    .unwind('localizations')
    .match({ 'localizations.lang': lang })
    .replaceRoot({
      $mergeObjects: [{ id: '$_id' }, '$localizations', '$$ROOT'],
    })
    .project(countryExcludedFields);
};

const getOneByLang = async (iso, lang) => {
  const countryByIso = await Country.findOne({ ISO: String(iso).toUpperCase() });
  if (!countryByIso) {
    throw new NotFoundError(ENTITY_NAME);
  }

  const id = countryByIso._id;
  const data = await Country.aggregate()
    .match({ _id: Types.ObjectId(id) })
    .unwind('localizations')
    .match({ 'localizations.lang': lang })
    .replaceRoot({
      $mergeObjects: [{ id: '$_id' }, '$localizations', '$$ROOT'],
    })
    .project(countryExcludedFields)
    .lookup({
      from: SIGHTS_COLLECTION_NAME,
      pipeline: [
        {
          $match: { countryId: Types.ObjectId(id) },
        },
        { $unwind: '$localizations' },
        {
          $match: { 'localizations.lang': lang },
        },
        {
          $replaceWith: { $mergeObjects: ['$localizations', '$$ROOT'] },
        },
        { $project: placeExcludedFields },
      ],
      as: 'sights',
    });

  let country = data[0];

  if (country) {
    if (country.sights.length > 0) {
      country.sights = await Promise.all(country.sights.map(async (sight) => {
        if (sight.scores.length > 0) {
          sight.scores = await Promise.all(sight.scores.map(async (record) => {
            const user = await User.findById(record.user);

            if (user) {
              return { ...record, img: user.img, name: user.login };
            }

            return record;
          }));
        }
        return sight;
      }));
    }
    return country;
  }
  throw new NotFoundError(ENTITY_NAME);
};

module.exports = {
  getAllByLang,
  getOneByLang,
};