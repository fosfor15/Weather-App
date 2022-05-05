import { TextAreaField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


function WeatherDisplay({ weatherOutput }) {
    return (
        <TextAreaField
            placeholder="The weather information will be placed here"
            value={weatherOutput}
            isReadOnly={true}
            whiteSpace="pre-wrap"
            rows="12"
        />
    );
}

export default WeatherDisplay;
