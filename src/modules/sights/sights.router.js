const express = require('express');
const Sight = require('./sights.schema');
const { DEFAULT_LANG } = require('../../common/common-vars');

const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const {
      countryId,
      imageUrl,
      localizations,
      lang = DEFAULT_LANG
    } = req.body;

    const sight = new Sight({
      countryId,
      imageUrl,
      localizations,
      lang
    });

    await sight.save();
    res.status(201).json({ sight });
  } catch (e) {
    res.status(e.status).json({ message: e });
  }
});

module.exports = router;
