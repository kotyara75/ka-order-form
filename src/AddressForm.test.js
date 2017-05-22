/**
 * Created by alexander on 22/5/17.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import AddressForm from './AddressForm.js';

var sample_location;
var getCurrentPosition = jest.fn(cb => cb(sample_location));
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

global.navigator.geolocation = {
  getCurrentPosition: getCurrentPosition,
  watchPosition: jest.fn()
};

it('renders without crashing & location resolves to address', (done) => {
    expect.assertions(1);
    sample_location = {coords: {latitude: -37.8099583, longitude: 144.96041169999998}};
    const div = document.createElement('div');
    ReactDOM.render(<AddressForm title="Delivery Address"
                                   address={null}
                                   onAddressChanged={(new_address) => {
                                       try{
                                           expect(new_address.line1).toBe('125 A\'Beckett Street');
                                           done();
                                       }catch(e){
                                           done.fail(e);
                                       }
                                   }}
                      />, div);
});

it('barely defined addresses', (done) => {
    expect.assertions(1);
    sample_location = {coords: {latitude: -37.832454, longitude: 144.694569}};
    const div = document.createElement('div');
    ReactDOM.render(<AddressForm title="Delivery Address"
                                   address={null}
                                   onAddressChanged={(new_address) => {
                                       try{
                                           expect(new_address.line1).toBe('');
                                           done();
                                       }catch(e){
                                           done.fail(e);
                                       }
                                   }}
                      />, div);
});
