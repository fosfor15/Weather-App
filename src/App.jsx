import { useState } from 'react';

import Header from './components/Header';
import AccountStatus from './components/AccountStatus';
import GetWeatherForm from './components/GetWeatherForm';
import WeatherDisplay from './components/WeatherDisplay';

import { API } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

import './styles/App.css';
import './styles/AmplifyUI.css';
import '@aws-amplify/ui-react/styles.css';


function App() {
    const [ city, setCity ] = useState({
        current: '',
        list: JSON.parse(localStorage.getItem('citylist')) || []
    });    

    const changeCurrentCity = (event) => {
        setCity({
            ...city,
            current: event.target.value
        });
    };

    const clearCurrentCityWeather = () => {
        setCity({
            ...city,
            current: ''
        });
        setWeatherOutput('');
    };


    const [ weatherOutput, setWeatherOutput ] = useState('');
    
    const getWeatherData = () => {
        if (!city.current) {
            setWeatherOutput('No city specified');
            setTimeout(() => setWeatherOutput(''), 2e3);
            return;
        }

        const cityRegexp = /^\p{L}[\p{L}\d\- ]*/u;
        if (!cityRegexp.test(city.current)) {
            setWeatherOutput('The city name should start/ consist only of letters and may also contain numbers, spaces and hyphens');
            setTimeout(() => setWeatherOutput(''), 2e3);
            return;
        }

        const config = {
            response: true,
            queryStringParameters: {
                city: city.current
            }
        };
        
        API.get('getCurrentWeather', '/getCurrentWeather', config)
            .then(response => {
                console.log('Response :>> ', response);

                if (response.status == 200) {
                    displayWeatherData(response.data);
                } else if (response.status == 204) {
                    setWeatherOutput(response.data.response);
                }
            })
            .catch(error => {
                console.log('Error :>> ', error);
                setWeatherOutput('Network error. Try again a few minutes later.');
            });

        setWeatherOutput('Loading...');

        if (!city.list.includes(city.current)) {
            const _cityList = [ ...city.list, city.current ].sort();

            setCity({
                ...city,
                list: _cityList
            });

            localStorage.setItem('citylist', JSON.stringify(_cityList));
            console.log('localStorage :>> ', localStorage);
        }
    };

    const handleKeyDown = (event) => {
        if (event.code == 'Enter') {
            getWeatherData();
        }
        else if (event.ctrlKey && event.code == 'KeyL') {
            event.preventDefault();

            if (city.current) {
                setCity({
                    ...city,
                    current: ''
                });
                setWeatherOutput('City input is cleared');

            } else {
                setCity({
                    ...city,
                    list: []
                });
                localStorage.clear();
                setWeatherOutput('City list is cleared');
            }

            setTimeout(() => setWeatherOutput(''), 2e3);
        }
    };

    const displayWeatherData = (responseData) => {
        const weatherData = JSON.parse(responseData.response);

        let _weatherOutput = `Weather for city ${city.current}\n`;
        
        const time = new Date(weatherData.time).toLocaleString();
        _weatherOutput += `Date, time: ${time}\n\n`;

        _weatherOutput += `Weather conditions: ${weatherData.weatherCondition.type}\n`;
        _weatherOutput += `Temperature: ${weatherData.temperature}°C\n`;
        _weatherOutput += `Wind: ${weatherData.wind.speed} km/h\n`;

        _weatherOutput += `Wind direction: ${weatherData.wind.direction
            .replace(/(\w)(\w)?/, (match, l1, l2) => {
                let output = match;

                switch (l1) {
                    case 'N':
                        output += ' (North';
                        break;
                    case 'E':
                        output += ' (East';
                        break;
                    case 'S':
                        output += ' (South';
                        break;
                    case 'W':
                        output += ' (West';
                        break;
                    }

                switch (l2) {
                    case 'E':
                        output += ' East)';
                        break;
                    case 'W':
                        output += ' West)';
                        break;
                    default:
                        output += ')';
                }

                return output;
            })}\n`;

        _weatherOutput += `Pressure: ${weatherData.weatherCondition.pressure} Pa\n`;
        _weatherOutput += `Humidity: ${weatherData.weatherCondition.humidity}%\n\n`;

        if (responseData.isCityCached) {
            _weatherOutput += 'Cached weather data\n';
        } else {
            _weatherOutput += 'New weather data\n';
        }

        const processTime = responseData.processTime
            .reduce((sum, comp) => sum * 1e3 + comp / 1e6).toFixed(2);
        _weatherOutput += `Process time: ${processTime} ms`;

        setWeatherOutput(_weatherOutput);
    };
    

    return (
        <div className="app">
            <Authenticator
                components={{ Header }}
            >{ account => (
                <>
                    <Header />
                    <AccountStatus
                        { ...account }
                    />
                    <GetWeatherForm
                        city={city}
                        onChange={changeCurrentCity}
                        onClear={clearCurrentCityWeather}
                        onKeyDown={handleKeyDown}
                        onSubmit={getWeatherData}
                    />
                    <WeatherDisplay
                        weatherOutput={weatherOutput}
                    />
                </>
            )}</Authenticator>
        </div>
    );
}

export default App;
