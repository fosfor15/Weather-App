import { useState, useEffect, useRef } from 'react';
import { View, Flex, Heading, SearchField, TextAreaField } from '@aws-amplify/ui-react';
import { API } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

function App() {
    const [ weatherData, setWeatherData ] = useState(null);
    const inputRef = useRef(null);
    
    const getWeatherData = () => {
        const config = {
            response: true, 
            queryStringParameters: {
                city: inputRef.current.value
            }
        };
        
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
                    ref={inputRef}
                    onSubmit={getWeatherData}
                />

                <TextAreaField
                    value={weatherData}
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
