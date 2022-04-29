import { useState, useEffect } from 'react';

import { View, Flex, Heading, SearchField, TextAreaField } from '@aws-amplify/ui-react';
import { API } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';


function App() {
    const [ city, setCity ] = useState('');
    const [ weatherData, setWeatherData ] = useState(null);
    const [ weatherOutput, setWeatherOutput ] = useState('');

    const changeCity = (event) => {
        setCity(event.target.value);
    };

    const clearCity = () => {
        setCity('');
    };
    
    const getWeatherData = () => {
        const config = {
            response: true, 
            queryStringParameters: { city }
        };

        setWeatherOutput('');
        
        API.get('getCurrentWeather', '/v1/getCurrentWeather/', config)
            .then(response => {
                console.log('Response :>> ', response);

                const _weatherData = JSON.parse(response.data.response);
                console.log('Weather data :>> ', _weatherData);

                setWeatherData(_weatherData);
            })
            .catch(error => {
                console.log('Error :>> ', error);
            });
    };

    const displayWeatherData = () => {
        if (!weatherData) return;

        let _weatherOutput = `Weather for city ${city}\n\n`;

        _weatherOutput += `Weather conditions: ${weatherData.weatherCondition.type}\n`;
        _weatherOutput += `Temperature: ${weatherData.temperature}°C\n`;
        _weatherOutput += `Wind: ${weatherData.wind.speed} km/h\n`;

        if (weatherData.wind.direction) {
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
        } else {
            _weatherOutput += 'Wind direction: unknown\n'; 
        }

        _weatherOutput += `Pressure: ${weatherData.weatherCondition.pressure} Pa\n`;
        _weatherOutput += `Humidity: ${weatherData.weatherCondition.humidity}%`;

        setWeatherOutput(_weatherOutput);
    };

    useEffect(displayWeatherData, [ weatherData ]);


    return (
        <View>
            <Flex
                className="App"
                direction="column"
                gap="1rem"
                style={styles.app}
            >
                <Heading
                    level="1"
                    style={styles.heading}
                >Weather App</Heading>

                <SearchField
                    placeholder="Enter city name"
                    value={city}
                    onChange={changeCity}
                    onClear={clearCity}
                    onSubmit={getWeatherData}
                />

                <TextAreaField
                    placeholder="The weather information will be placed here"
                    value={weatherOutput}
                    isReadOnly={true}
                    whiteSpace="pre"
                    rows="10"
                />
            </Flex>
        </View>
    )
}

export default App;


const styles = {
    app: {
        width: '500px',
        margin: '40px auto'
    },
    heading: {
        marginBottom: '30px',
        fontWeight: '400',
        textAlign: 'center'
    }
};
