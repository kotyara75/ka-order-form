import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

let sample_location = {coords: {latitude: -37.8099583, longitude: 144.96041169999998}};
let getCurrentPosition = jest.fn(cb => cb(sample_location));

global.navigator.geolocation = {
  getCurrentPosition: getCurrentPosition,
  watchPosition: jest.fn()
};

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});