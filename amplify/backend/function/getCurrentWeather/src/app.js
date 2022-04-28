const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());


// Enabling CORS for all methods
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});


app.get('/v1/getCurrentWeather/*', async function(req, res) {
    if (req.apiGateway.event.queryStringParameters) {
        const { city } = req.apiGateway.event.queryStringParameters;
        
        try {
            const weatherResponse = await getWeatherRequest(city);
            const weatherData = processWeatherData(weatherResponse);
            res.status(200).json({ response: JSON.stringify(weatherData) });
        } catch (error) {
            res.status(400).json({ response: error.message });
        }
    } else {
        res.status(200).json({ response: 'No city is specified' });
    }
});

function getWeatherRequest(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=42f86ded5372a4d4c8d2a8aab4e8f649`;

    return new Promise((resolve, reject) => {
        const req = https.get(url, res => {
            let rawData = '';

            res.on('data', chunk => {
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                } catch (err) {
                    reject(new Error(err));
                }
            });
        });

        req.on('error', err => {
            reject(new Error(err));
        });
    });
}

function processWeatherData(weatherResponse) {
    const weatherData = {
        city: weatherResponse.name,
        temperature: weatherResponse.main.temp - 273.15,
        weatherCondition: {
            type: weatherResponse.weather[0].main,
            pressure: weatherResponse.main.pressure,
            humidity: weatherResponse.main.humidity
        },
        wind: {
            speed: weatherResponse.wind.speed,

            convertDirection() {
                if (weatherResponse.wind.deg >= 338 && weatherResponse.wind.deg <= 22) {
                    return 'N';
                } else if (weatherResponse.wind.deg >= 23 && weatherResponse.wind.deg <= 67) {
                    return 'NE'
                } else if (weatherResponse.wind.deg >= 68 && weatherResponse.wind.deg <= 112) {
                    return 'E'
                } else if (weatherResponse.wind.deg >= 113 && weatherResponse.wind.deg <= 157) {
                    return 'SE'
                } else if (weatherResponse.wind.deg >= 158 && weatherResponse.wind.deg <= 202) {
                    return 'S'
                } else if (weatherResponse.wind.deg >= 203 && weatherResponse.wind.deg <= 247) {
                    return 'SW'
                } else if (weatherResponse.wind.deg >= 248 && weatherResponse.wind.deg <= 292) {
                    return 'W'
                } else if (weatherResponse.wind.deg >= 293 && weatherResponse.wind.deg <= 337) {
                    return 'NW'
                }
            },
            direction: this.convertDirection()
        }
    };

    return weatherData;
}


app.listen(3000, function () {
    console.log('App started');
});

module.exports = app;
