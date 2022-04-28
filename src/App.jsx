import { useState, useRef, useEffect } from 'react';
import { View, Flex, Heading, SearchField, TextAreaField } from '@aws-amplify/ui-react';
import { API } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

function App() {
    const [ weatherData, setWeatherData ] = useState(null);
    const cityNameInput = useRef(null);
    const weatherOutputTextarea = useRef(null);
    
    const getWeatherData = () => {
        const config = {
            response: true, 
            queryStringParameters: {
                city: cityNameInput.current.value
            }
        };

        cityNameInput.current.value = '';
        
        API.get('getCurrentWeather', '/v1/getCurrentWeather/', config)
            .then(response => {
                console.log('Response :>> ', response);

                const newWeatherData = JSON.parse(response.data.response);
                console.log('newWeatherData :>> ', newWeatherData);

                setWeatherData(newWeatherData);
            })
            .catch(error => {
                console.log('Error :>> ', error);
            });
    };

    useEffect(() => {
        if (!weatherData) return;

        let weatherOutput = `Weather for city ${weatherData.city}\n`;
        weatherOutput += `Temperature: ${weatherData.temperature}°C\n`;
        weatherOutput += `Weather conditions: ${weatherData.weatherCondition.type}\n`;
        weatherOutput += `Wind: ${weatherData.wind.speed} km/h\n`;
        weatherOutput += `Wind direction: ${weatherData.wind.direction}\n`;
            /* .replace(/(\w)(\w)?/, (match, l1, l2) => {
                if (l1 == 'N') {
                    'North'
                }
            }); */
        weatherOutput += `Pressure: ${weatherData.weatherCondition.pressure} Pa\n`;
        weatherOutput += `Humidity: ${weatherData.weatherCondition.humidity}%`;

        weatherOutputTextarea.current.value = weatherOutput;
    }, [ weatherData ]);


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
                    fontWeight="400"
                    textAlign="center"
                    style={styles.heading}
                >Weather App</Heading>

                <SearchField
                    placeholder="Enter city name"
                    ref={cityNameInput}
                    onSubmit={getWeatherData}
                />

                <TextAreaField
                    ref={weatherOutputTextarea}
                    placeholder="The weather data will be here"
                    isReadOnly={false}
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
        marginBottom: '30px'
    }
};
