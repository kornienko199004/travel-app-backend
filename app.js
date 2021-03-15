const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser')
require('dotenv').config();

const mongoUrl = `${process.env.MONGO_URL}`;

const app = express();

let corsOptions = {
    credentials: true,
    origin: function(origin, callback) {
        callback(null, true)
    }
}

app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser())

const PORT = process.env.PORT || 5000;

app.use(express.json());
const countryRouter = require('./src/modules/countries/country.router');
const sightsRouter = require('./src/modules/sights/sights.router');
const userRouter = require('./src/modules/user/user.router')

app.use('/countries', countryRouter);
app.use('/sights', sightsRouter);
app.use('/user', userRouter);

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
