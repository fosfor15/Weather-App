import { View, Flex, Heading, SearchField, TextAreaField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App() {
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
                />

                <TextAreaField
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
