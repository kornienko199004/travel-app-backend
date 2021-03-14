const express = require('express');
const Country = require('./country.schema');
const countryService = require('./country.service');
const { DEFAULT_LANG } = require('../../common/common-vars');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const lang = req.query.lang || DEFAULT_LANG;
      const data = await countryService.getAll(lang);
      res.status(200).json(data);
    } catch (e) {
      res.status(e.status).json({ message: e });
    }
  }
);

router.post('/add', async (req, res) => {
    try {
    const { imageUrl, videoUrl, currency, ISO, localizations, flagImageUrl, timeZone } = req.body;

    const country = new Country({
      imageUrl,
      videoUrl,
      flagImageUrl,
      currency,
      ISO,
      localizations,
      timeZone,
    });

    await country.save();
    res.status(201).json({ country });
    } catch (e) {
      res.status(e.status).json({ message: e });
    }
  }
);

router.get('/:id',
  async (req, res) => {
    try {
      const lang = req.query.lang || DEFAULT_LANG;
      const { id } = req.params;
      const data = await countryService.getOne(id, lang);
      res.status(200).json(data);
    } catch (e) {
      res.status(e.status).json({ message: e });
    }
  },
);

module.exports = router;
