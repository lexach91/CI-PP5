
export class CountryService {

    getCountries() {
        // console log file's location
        console.log(__filename);
        return fetch('api/countries/').then(res => res.json())
            .then(d => d.data);
    }
}
