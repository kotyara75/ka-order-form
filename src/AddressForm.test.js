/**
 * Created by alexander on 22/5/17.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import AddressForm from './AddressForm.js';

let sample_location = {coords: {latitude: -37.8099583, longitude: 144.96041169999998}};
let sample_address = {line1: '125 A\'Beckett Street'};
let getCurrentPosition = jest.fn(cb => cb(sample_location));
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

global.navigator.geolocation = {
  getCurrentPosition: getCurrentPosition,
  watchPosition: jest.fn()
};

it('renders without crashing & location resolves to address', (done) => {
    expect.assertions(1);
    const div = document.createElement('div');
    ReactDOM.render(<AddressForm title="Delivery Address"
                                   address={null}
                                   onAddressChanged={(new_address) => {
                                       try{
                                           expect(new_address.line1).toBe(sample_address.line1);
                                           done();
                                       }catch(e){
                                           done.fail(e);
                                       }
                                   }}
                      />, div);
});


