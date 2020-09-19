import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Weather } from './weather.model';

export interface MapBoxOutput {
  attribution: string;
  features: Feature[];
  query: [];
}

export interface Feature {
  place_name: string;
  center: Coords;
}

export interface Coords {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class ForecastService {
  apiUrl: string;

  access_token =
    'pk.eyJ1IjoiaGVtYW50aDUyNDciLCJhIjoiY2tmNnc4NnZnMG1hdzJ5bzdnNTUxMThvMCJ9.ohD5qUgX_ArjkVsjebFnRA';
  constructor(private http: HttpClient) {
    this.apiUrl = environment.API_URL;
  }

  getResult(longitude: number, latitude: number) {
    const url =
      this.apiUrl + '/result?lon=' + longitude + '&lat=' + latitude;
    return this.http.get<{ complete: JSON; weather: Weather }>(url);
  }

  search_word(query: string) {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    return this.http
      .get(url + query + '.json?types=place&access_token=' + this.access_token)
      .pipe(
        map((res: MapBoxOutput) => {
          return res.features;
        })
      );
  }
}
