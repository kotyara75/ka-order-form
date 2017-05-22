/**
 * Created by alexander on 22/5/17.
 */
import React, { Component } from 'react';
import {Panel, Form, FormGroup, ControlLabel, FormControl, Col, HelpBlock, Well } from 'react-bootstrap';
import $ from 'jquery';

class AddressForm extends Component {
    constructor(){
        super();
        this.state = {
          location: null
      };
    }

    componentDidMount() {
        if (!this.props.address)
            navigator.geolocation.getCurrentPosition((l) => this.setLocation(l));
    }

    setLocation(l) {
        if (l) {
            this.setState({location: l});

            const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
                l.coords.latitude + ',' + l.coords.longitude +
                    '&result_type=street_address|locality|administrative_area_level_1|postal_code|country' +
                '&key=AIzaSyDGa4mgGaPfpbeIuL-VcVs6sOIuzzoQinQ';

            $.getJSON(url, {}, (data) => this.setAddress(data));
        }
    }

    setAddress(GEOdata) {
        if (GEOdata && GEOdata.results.length > 0) {
            const acs = GEOdata.results[0].address_components;
            const street_number = this.getGEOAddressComponentField(acs, 'street_number', 'short_name');
            const route = this.getGEOAddressComponentField(acs, 'route', 'long_name');
            const locality = this.getGEOAddressComponentField(acs, 'locality', 'long_name');
            const region = this.getGEOAddressComponentField(acs, 'administrative_area_level_1', 'short_name');
            const postal_code = this.getGEOAddressComponentField(acs, 'postal_code', 'short_name');
            const country = this.getGEOAddressComponentField(acs, 'country', 'short_name');
            console.log(street_number, route, locality, region, postal_code, country);
            if (this.props.onAddressChanged)
                this.props.onAddressChanged(
                    {
    //                    recipient_name: "Brian Robinson",
    //                     phone: "011862212345678",
                        line1: street_number + ' ' + route,
                        line2: '',
                        city: locality,
                        country_code: country,
                        postal_code: postal_code,
                        state: region
                    }
                );
        }
    }

    getGEOAddressComponent(address_components, component) {
        return address_components.find(function (a) {
                return a.types.find(function (t) {
                    return t === component;
                });
        });
    }

    getGEOAddressComponentField(address_components, component, field) {
        const c = this.getGEOAddressComponent(address_components, component);
        return c ? c[field] : '';
    }

    handleAddressChange(e) {
        const field = e.target.id;
        const value = e.target.value;
        const original_address = this.props.address;
        let changed_field = {}; changed_field[field] = value;
        const a = Object.assign({}, original_address, changed_field);

        const app_handler = this.props.onAddressChanged;
        if (app_handler) app_handler(a);
    }

    render() {
        const location = this.state.location;
        const address = this.props.address;
        const address_check = validateAddress(address);
        const location_title = (
            <h3>{this.props.title}</h3>
        );
        return (
                <Panel header={location_title}>
                    { !location ?
                        (<p>One moment, we are locating you</p>):
                        (
                        <Form horizontal>
                            <FormGroup>
                              <Col componentClass={ControlLabel} sm={2}>Your Coordinates</Col>
                              <Col sm={10}>
                                  <FormControl.Static>{location.coords.latitude}, {location.coords.longitude}</FormControl.Static>
                              </Col>
                            </FormGroup>
                            { !address ?
                                (<Well>Getting your address, it won't take long ...</Well>):
                                (<div>
                                    <AddressField errors={address_check} fieldId="line1" label='Address line 1'
                                                  type="text" value={address.line1}
                                                  onChange={(e) => this.handleAddressChange(e)} />
                                    <AddressField errors={address_check} fieldId="line2" label='Address line 2'
                                                  type="text" value={address.line2}
                                                  onChange={(e) => this.handleAddressChange(e)} />
                                    <AddressField errors={address_check} fieldId="city" label='City'
                                                  type="text" value={address.city}
                                                  onChange={(e) => this.handleAddressChange(e)} />
                                    <AddressField errors={address_check} fieldId="postal_code" label='Postal code'
                                                  type="text" value={address.postal_code}
                                                  onChange={(e) => this.handleAddressChange(e)} />
                                    <AddressField errors={address_check} fieldId="state" label='Region/State'
                                                  type="text" value={address.state}
                                                  onChange={(e) => this.handleAddressChange(e)} />
                                    <AddressField errors={address_check} fieldId="country_code" label='Country'
                                                  type="text" value={address.country_code}
                                                  onChange={(e) => this.handleAddressChange(e)} />
                                </div>)
                            }
                        </Form>
                        )
                    }
                </Panel>
            );
    }
}

function getFieldState(fieldId, errors) {
    const e = errors.find(function (t) {return t.field === fieldId});
    return e ? e: {field: fieldId, result: null, message: null}
}

function AddressField(props) {
    const e = getFieldState(props.fieldId, props.errors);
    return (<FormGroup controlId={props.fieldId} validationState={e.result}>
                <Col componentClass={ControlLabel} sm={2}>{props.label}</Col>
                <Col sm={10}>
                    <FormControl type={props.type} value={props.value}
                                          onChange={props.onChange}/>
                    <FormControl.Feedback />
                    {e.message?(<HelpBlock>{e.message}</HelpBlock>):(<div/>)}
                </Col>
            </FormGroup>);
}

const _addressFieldsMeta = {
        line1: {minLength: 10, description: 'address line'},
        line2: {minLength: 0, description: 'address line'},
        city: {minLength: 3, description: 'city'},
        postal_code: {minLength: 4, description: 'postal or zip code'},
        state: {minLength: 3, description: 'state or region name'},
        country_code: {minLength: 2, description: 'country code'}
    };

function validateAddress(a) {
    let errors = [];
    if (!a) errors.push({field: 'line1', result: 'error', message: 'Please enter valid address.'});
    else
        for (var field in a) {
            const c = _addressFieldsMeta[field];
            if (c) {
                const f = a[field];
                const length = f.length;
                if (length >= c.minLength && field === 'line1')
                    errors.push({field: field, result: 'success', message: 'Please update delivery address if required.'});
                else if (length < c.minLength)
                    errors.push({field: field, result: 'error', message: 'Please enter valid ' + c.description + '.'});
            }
        }
    return errors;
}

export default AddressForm;