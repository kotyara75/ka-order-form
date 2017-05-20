import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

global.navigator.geolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
};

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
