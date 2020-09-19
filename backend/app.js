const express = require("express");
const memcached = require("memcached");
const bodyParser = require("body-parser");
const request = require("request");
const dotenv = require('dotenv');
const app = express();
const cors = require('cors');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

var mc = new memcached();
mc.connect(process.env.MEMCACHIER_SERVERS, function (err, conn) {
  if (err) {
    console.log(conn.server, "error while memcached connection!!");
  } else {
    console.log("Memcached connection successful!");
  }
});

const apiKey = process.env.WEATHER_API;

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//emable CORS
app.use(cors());

/**
 * Index Route
 */
app.get("/", (req, res) => {
  res.status(200).send({
    code: "1",
    message: "TouchNote Backend Api Server.",
  });
});

var requestresult = function (url, callback) {
  request(url, function (err, res, body) {
    if (err) {
      return callback({
        weather: null,
        error: "Error, please try again.",
      });
    } else {
      let weather = JSON.parse(body);
      if (weather.main == undefined) {
        return callback({
          weather: null,
          error: "Please recheck the spelling of the city entered.",
        });
      } else {
        let temp_avg = `${weather.main.temp}`;
        let humidity = `${weather.main.humidity}`;
        let temp_min = `${weather.main.temp_min}`;
        let temp_max = `${weather.main.temp_max}`;
        let isDay = `${weather.dt}` < `${weather.sys.sunset}` ? "day" : "night";
        let chanceOfRain = `${weather.clouds.all}`
        let place_name = `${weather.name}`;
        let description = `${weather.weather[0].description}`;
        return callback({
          weather: {
            temp_avg,
            humidity,
            temp_min,
            temp_max,
            isDay,
            chanceOfRain,
            place_name,
            description,
          },
          error: null,
        });
      }
    }
  });
};

app.get("/result", (req, res) => {
  let lat = req.query.lat;
  let lon = req.query.lon;
  if (lat) {
    let url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    mc.get(url, function (err, val) {
      if (err == null && val != null) {
        val.data = "cache";
        res.status(200).send(val);
      } else {
        requestresult(url, (result) => {
          // expiry time in seconds set to 10
          mc.set(url, result, 10, (err) => {
            if (err) console.log(err);
          });
          result.data = "api";
          res.status(200).send(result);
        });
      }
    });
  }
});

module.exports = app;
