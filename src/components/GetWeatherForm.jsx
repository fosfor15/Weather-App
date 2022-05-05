import { SearchField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


function GetWeatherForm({ city, ...eventHandlers }) {
    return (
        <div>
            <SearchField
                placeholder="Enter city name"
                list="city-list"
                value={city.current}
                { ...eventHandlers }
            />
            <datalist id="city-list">
                { city.list.length &&
                city.list.map((city, ind) =>
                    <option key={ind}>{city}</option>) }
            </datalist>
        </div>
    );
}

export default GetWeatherForm;
