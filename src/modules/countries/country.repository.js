const Country = require('./country.schema');
const { NotFoundError } = require('../../common/errors/errors-list');
const { ENTITY_NAME } = require('./constants');
const {
  COLLECTION_NAME: SIGHTS_COLLECTION_NAME,
} = require('../sights/constants');
const { Types } = require('mongoose');

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

const getOneByLang = async (id, lang) => {
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

  const country = data[0];
  if (country) {
    return country;
  }
  throw new NotFoundError(ENTITY_NAME);
};

module.exports = {
  getAllByLang,
  getOneByLang,
};