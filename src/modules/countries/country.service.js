const countryRepo = require('./country.repository');

const getAll = async (lang) => {
  const countries = await countryRepo.getAllByLang(lang);
  return countries;
};

const getOne = async (isoCountry, lang) => {
  const country = await countryRepo.getOneByLang(isoCountry, lang);
  return country;
};

module.exports = {
  getAll,
  getOne,
};