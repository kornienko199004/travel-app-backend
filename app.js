const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const mongoUrl = `${process.env.MONGO_URL}`;

const app = express();
app.use(cors());
app.use(helmet());

const PORT = process.env.PORT || 5000;

app.use(express.json());
const countryRouter = require('./src/modules/countries/country.router');
const sightsRouter = require('./src/modules/sights/sights.router');

app.use('/countries', countryRouter);
app.use('/sights', sightsRouter);

async function start() {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    app.listen(PORT, () =>
      console.log(`App has been started on port ${PORT}...`)
    );
  } catch (e) {
    console.log('Server Error', e.message);
    process.exit(1);
  }
}

start();
