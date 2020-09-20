import { Component, EventEmitter, Output } from '@angular/core';
import { Feature, ForecastService } from './forecast.service';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import { Weather } from './weather.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css'],
})
export class ForecastComponent {
  result: Weather;
  input: string;
  lat: number;
  lng: number;
  searchPress: boolean = false;
  features: Feature[];
  // inputControl: FormControl = new FormControl();

  @Output() onSelection: EventEmitter<any> = new EventEmitter<any>();
  constructor(public forecastService: ForecastService) {}

  search(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm && searchTerm.length > 0) {
      this.forecastService
        .search_word(searchTerm)
        .subscribe((features: Feature[]) => {
          this.features = features.map((features) => features);
        });
    } else {
      this.features = [];
    }
  }

  submit(event: MatAutocompleteSelectedEvent) {
    this.onSelect(event.option.value);
  }

  onSelect(feature: Feature) {
    this.searchPress = true;
    this.result = null;
    this.forecastService
      .getResult(feature.center[0], feature.center[1])
      .subscribe((data) => {
        this.result = data.weather;
      });
    this.lat = feature.center[1];
    this.lng = feature.center[0];
    this.features = [];
  }

  getOptionText(option) {
    return option ? option.place_name : "";
  }
}
