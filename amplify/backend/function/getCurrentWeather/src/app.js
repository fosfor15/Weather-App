// Imports
const express = require('express');
const bodyParser = require('body-parser');

const https = require('https');

// Disabled due to paid service
// const redis = require('redis');

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// Disabled due to paid service
// const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');


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


// Processing of SecretsManager
// Disabled due to paid service
/* const secretManagerClient = new SecretsManagerClient({
    region: 'eu-central-1'
});
const getSecretValueCommand = new GetSecretValueCommand({
    SecretId: 'arn:aws:secretsmanager:eu-central-1:543295793859:secret:open-weather-api-key-JSODzJ'
}); */


// Processing of ElastiCache and Redis
// Disabled due to paid service
/* const redisClient = redis.createClient({
    url: 'redis://weather-app-cache.blzsgd.ng.0001.euc1.cache.amazonaws.com:6379'
});
redisClient.connect(); */


// Error class for describing server errors
class ServerError extends Error {
    constructor(status, description) {
        super(description);
        this.name = 'Server Error';
        this.status = status;
        this.description = description;
    }
}


// Processing the GET-request
app.get('/getCurrentWeather*', async (request, response) => {
    console.log('Have GET-request 😎👌');

    // City name
    const city = request.query?.city;
    // Weather data in needed structure
    let weatherData = '';
    
    // Main processing
    try {
        // If no city is specified
        if (!city) {
            throw new ServerError(204, 'No city is specified');
        }

        // Start point for measuring of request processing time
        let processTime = process.hrtime();

        // Check is weather data for specified city cached
        // Disabled due to paid service
        /* const isWeatherDataCached = await redisClient.exists(city);

        // If weather data for specified city cached
        if (isWeatherDataCached) {
            // Get cached weather data
            weatherData = await redisClient.get(city);
            processTime = process.hrtime(processTime);
        }
        // If needed to get new weather data from OpenWeather
        else {
        }
        // Saving to cache new weather data
        // redisClient.set(city, weatherData, { EX: 60, NX: true });
        */

        // Get and convert new weather data from OpenWeather
        const newWeatherData = await getNewWeatherData(city);
        weatherData = convertWeatherData(newWeatherData);
        processTime = process.hrtime(processTime);


        // Sending good response
        response.json({
            status: 200,
            payload: weatherData,
            // isCached: isWeatherDataCached,
            processTime
        });
    }
    // Processing in case of throwing ServerError
    catch (error) {
        response.json({
            status: error.status,
            error
        });
    }
});

// Server start
app.listen(3000);

module.exports = app;


// Async function for sending request to OpenWeather API for fetching new weather data
async function getNewWeatherData(city) {
    // Disabled due to paid service
    /* const secretManagerResponse = await secretManagerClient.send(getSecretValueCommand);
    const apiKey = JSON.parse(secretManagerResponse.SecretString).apiKey; */
    
    const apiKey = 'f3866bb65789d68f7aab7d65dae1dd5f';
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            if (response.statusCode != 200) {
                reject(new ServerError(response.statusCode,
                    'OpenWeather API request is failed'));
            }

            let rawData = '';
            response.on('data', chunk => {
                rawData += chunk;
            });

            response.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                } catch (error) {
                    reject(new ServerError(500, error.message));
                }
            });
        });

        request.on('error', error => {
            reject(new ServerError(500, error.message));
        });
    });
}

// Function for converting weather data to needed structure
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
    };

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
