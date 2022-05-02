// Imports
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const https = require('https');
const redis = require('redis');


// Processing with ElastiCache and Redis
const redisClient = redis.createClient({
    url: 'redis://weather-app-cache.blzsgd.ng.0001.euc1.cache.amazonaws.com:6379'
});
redisClient.connect();

redisClient.on('connect', () => console.log('Redis client is connecting!'));
redisClient.on('ready', () => console.log('Redis client is ready!'));
redisClient.on('error', (err) => console.log('Redis client error :>> ', err));


// Declaring a new express app
const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enabling CORS for all methods
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});


// Processing the GET-requests
app.get('/v1/getCurrentWeather/*', async (req, res) => {
    console.log('Have GET-request 😎👌');

    let processTime = process.hrtime();

    const queryParams = req.apiGateway.event.queryStringParameters;

    // If no city is specified
    if (!queryParams?.city) {
        processTime = process.hrtime(processTime);

        res.json({
            response: 'No city is specified',
            status: 204,
            processTime: JSON.stringify(processTime)
        });

        return;
    }

    // City name
    const city = queryParams.city;
    console.log('City :>> ', city);

    // Check is weather data for specified city exists
    console.time('Is key city exists');
    const isCityCached = await redisClient.exists(city);
    console.timeEnd('Is key city exists');
    console.log('Is key city exists :>> ', isCityCached);

    let weatherData = '';

    // If weather data for specified city exists
    if (isCityCached == 1) {
        // Get cached weather data
        console.time('Get cached weather data');
        weatherData = await redisClient.get(city);
        processTime = process.hrtime(processTime);
        console.timeEnd('Get cached weather data');
        console.log('Get cached weather data :>> ', weatherData);
    }
    // In other case
    else {
        // Get new weather data from OpenWeather
        console.time('Get new weather data from OpenWeather');
        const weatherResponse = await getWeatherDataRequest(city);
        processTime = process.hrtime(processTime);
        console.timeEnd('Get new weather data from OpenWeather');

        weatherData = convertWeatherData(weatherResponse);

        console.time('Save weather data to cache');
        const saveToCacheResponse = await saveToCache(city, weatherData);
        console.log('Save weather data to cache :>> ', saveToCacheResponse);
        console.timeEnd('Save weather data to cache');
    }
    
    res.json({
        response: weatherData,
        status: 200,
        processTime: JSON.stringify(processTime)
    });
});

// Server start
app.listen(3000);

module.exports = app;


// Utilities
function getWeatherDataRequest(city) {
    console.log('Make GET-request to OpenWeather 😎👌');
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=42f86ded5372a4d4c8d2a8aab4e8f649`;
    
    return new Promise((resolve, reject) => {
        console.log('Pre launch https.get');

        const req = https.get(url, res => {
            console.log('Launch https.get');

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

function convertWeatherData(weatherResponse) {
    const getWordDirection = (weatherResponse) => {
        const degDirection = Math.round(weatherResponse.wind.deg);

        switch (true) {
            case (degDirection >= 0 && degDirection <= 22 ||
                    degDirection >= 338 && degDirection <= 360):
                return 'N';
            case (degDirection >= 23 && degDirection <= 67):
                return 'NE';
            case (degDirection >= 68 && degDirection <= 112):
                return 'E';
            case (degDirection >= 113 && degDirection <= 157):
                return 'SE';
            case (degDirection >= 158 && degDirection <= 202):
                return 'S';
            case (degDirection >= 203 && degDirection <= 247):
                return 'SW';
            case (degDirection >= 248 && degDirection <= 292):
                return 'W';
            case (degDirection >= 293 && degDirection <= 337):
                return 'NW';
        }
    }

    const weatherData = {
        city: weatherResponse.name,
        time: new Date().toISOString(),

        temperature: (weatherResponse.main.temp - 273.15).toFixed(2),
        
        weatherCondition: {
            type: weatherResponse.weather[0].main,
            pressure: weatherResponse.main.pressure,
            humidity: weatherResponse.main.humidity
        },
        
        wind: {
            speed: weatherResponse.wind.speed,
            direction: getWordDirection(weatherResponse)
        }
    };

    return JSON.stringify(weatherData);
}

async function saveToCache(city, weatherData) {
    await redisClient.set(city, weatherData);
    return await redisClient.expire(city, 60);
}
