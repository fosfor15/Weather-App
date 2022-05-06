import { useState, useEffect } from 'react';

import Header from './components/Header';
import AccountStatus from './components/AccountStatus';
import GetWeatherForm from './components/GetWeatherForm';
import WeatherDisplay from './components/WeatherDisplay';

import { API } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

import './styles/App.css';
import './styles/AmplifyUI.css';
import '@aws-amplify/ui-react/styles.css';


function PrimaryInterface() {
    const { user, signOut } = useAuthenticator(context => [ context.user ]);

    const [ city, setCity ] = useState({
        current: '',
        list: JSON.parse(user.storage.cityList || '[]')
    });

    useEffect(() => {
        localStorage.setItem('cityList', JSON.stringify(city.list));
    }, [ city.list ]);


    const changeCurrentCity = (event) => {
        setCity({
            ...city,
            current: event.target.value
        });
    };

    const clearCurrentCity = () => {
        setCity({
            ...city,
            current: ''
        });

        if (weatherOutput) {
            setWeatherOutput('City and weather display is cleared');
            setTimeout(() => setWeatherOutput(''), 2e3);
        }
    };

    const clearCityList = () => {
        setCity({
            ...city,
            list: []
        });
        setWeatherOutput('City list is cleared');
        setTimeout(() => setWeatherOutput(''), 2e3);
    };


    const [ weatherOutput, setWeatherOutput ] = useState('');

    const getWeatherData = () => {
        if (!city.current) {
            setWeatherOutput('No city specified');
            setTimeout(() => setWeatherOutput(''), 2e3);
            return;
        }

        if (city.current == 'clear') {
            setCity({
                current: '',
                list: []
            });
            setWeatherOutput('City, weather display and list is cleared');
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
            headers: {
                'Authorization': user.signInUserSession.idToken.jwtToken
            },
            queryStringParameters: {
                'city': city.current
            }
        };
        
        API.get('getCurrentWeather', '/getCurrentWeather', config)
            .then(response => {
                if (response.data.status == 200) {
                    displayWeatherData(response.data);
                } else {
                    const { name, description } = response.data.error;
                    setWeatherOutput(`${name}:\n${description}`);
                }
            })
            .catch(error => setWeatherOutput(error));

        setWeatherOutput('Loading...');

        if (!city.list.includes(city.current)) {
            setCity({
                ...city,
                list: [ ...city.list, city.current ].sort()
            });
        }
    };

    const displayWeatherData = (responseData) => {
        const weatherData = JSON.parse(responseData.payload);

        let _weatherOutput = '';

        _weatherOutput = `Weather for city ${city.current}\n`;        
        _weatherOutput += `Date, time: ${ new Date(weatherData.time).toLocaleString() }\n\n`;

        _weatherOutput += `Weather conditions: ${weatherData.weatherCondition.type}\n`;
        _weatherOutput += `Temperature: ${weatherData.temperature}°C\n`;
        _weatherOutput += `Wind: ${weatherData.wind.speed} km/h\n`;

        const windDirection = weatherData.wind.direction
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
            })
        _weatherOutput += `Wind direction: ${windDirection}\n`;

        _weatherOutput += `Pressure: ${weatherData.weatherCondition.pressure} Pa\n`;
        _weatherOutput += `Humidity: ${weatherData.weatherCondition.humidity}%\n\n`;

        _weatherOutput += `${ responseData.isCached ? 'Cached' : 'New' } weather data\n`;

        const processTime = responseData.processTime
            .reduce((sum, comp) => sum * 1e3 + comp / 1e6).toFixed(2);
        _weatherOutput += `Process time: ${processTime} ms`;

        setWeatherOutput(_weatherOutput);
    };

    const handleKeyDown = (event) => {
        if (event.code == 'Enter') {
            getWeatherData();
        }
        else if (event.ctrlKey && event.code == 'KeyL') {
            event.preventDefault();

            if (city.current) {
                clearCurrentCity();
            } else {
                clearCityList();
            }
        }
    };
    

    return (
        <Authenticator.Provider>
            <Header />
            <AccountStatus
                user={user}
                signOut={signOut}
            />
            <GetWeatherForm
                city={city}
                onChange={changeCurrentCity}
                onClear={clearCurrentCity}
                onKeyDown={handleKeyDown}
                onSubmit={getWeatherData}
            />
            <WeatherDisplay
                weatherOutput={weatherOutput}
            />
        </Authenticator.Provider>
    );
}

function App() {
    return (
        <div className="app">
            <Authenticator
                components={{ Header }}
            >
                <PrimaryInterface />
            </Authenticator>
        </div>
    );
}

export default App;
