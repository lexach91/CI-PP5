
export class CountryService {

    getCountries() {
        const url = window.location.origin + '/api/countries';
        return fetch(url).then(res => res.json())
            .then(d => d);
    }
}
