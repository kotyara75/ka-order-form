import React, { Component } from 'react';
import { Navbar, Jumbotron, Grid, Row, Panel, Form, FormGroup, ControlLabel,
    FormControl, Col, HelpBlock, Accordion, InputGroup, Button, Glyphicon, ListGroup, ListGroupItem,
    Well, ButtonGroup} from 'react-bootstrap';
import $ from 'jquery';
import logo from './logo.svg';
import './App.css';
import PaymentBtn from './PayPal.js';

// var priceFormatter = new Intl.NumberFormat('en-US',
//                         { style: 'currency', currency: 'AUD',
//                           minimumFractionDigits: 2 });

var PayPalConf = {
    env: 'sandbox', // Optional: specify 'production' environment
    style: { size: 'responsive' },
    client: {
        sandbox:    'Adeiy_rlEB8Jg8BrP3j1s3HG_QzO2bW0BIxxCfKU-S-EmqjJOZc2L1VOHL_jh2s_chdCjrtn5br5Gq36',
        production: 'xxxxxxxxx'
    }
};

class numberFormat {
    format(n){
        return 'A$'+(Math.round(n * 100) / 100).toFixed(2)
    }
}

var priceFormatter = new numberFormat();

class App extends Component {
    constructor(){
      super();
      this.state = {
          parsed_address: null,
          items: null,
          note_to_payer: null
      };
    }

    setItems(data){
        if (data && data.records.length > 0) {
            const entries = data.records;
            var items = {};
            for (var i = 0; i < entries.length; i++) {
              const entry = entries[i];
              const code = entry.Item_Code;
              items[code] = {
                  code: code,
                  name: entry.Item_Name,
                  price: entry.Price,
                  quantity: 0,
                  description: entry.Description,
                  category: entry.Category
              };
            }
            this.setState({items: items});
        }
    }

    setNote(data){
        if (data && data.records.length > 0) {
            this.setState({note_to_payer: data.records[0].Note_for_customer_orders_in_PayPal});
        }
    }

    loadData() {
        const export_script_url = "https://script.google.com/macros/s/AKfycby2-FuZ2QnrS1LALJKdbUdirykN3RuBPCYgtoDb-9KhW7msZgy3/exec?callback=?";
        const spreadsheet = "1GBabQ_MakwaQX0E1apd3A9HhPjNKhPYDHBf1r3uOAwo";
        const goods_params = {id: spreadsheet, sheet: 'Goods'};
        const note_params = {id: spreadsheet, sheet: 'Note'};
//      URL https://script.google.com/macros/s/AKfycby2-FuZ2QnrS1LALJKdbUdirykN3RuBPCYgtoDb-9KhW7msZgy3/exec?id=1GBabQ_MakwaQX0E1apd3A9HhPjNKhPYDHBf1r3uOAwo&sheet=Goods&callback=?
        $.getJSON(export_script_url,goods_params, (data) => this.setItems(data));
        $.getJSON(export_script_url,note_params, (data) => this.setNote(data));
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        return (
          <div >
              <Navbar inverse fixedTop>
                  <Grid>
                    <Navbar.Header>
                      <Navbar.Brand>
                        <a href="/">Order Delivery</a>
                      </Navbar.Brand>
                      <Navbar.Toggle />
                    </Navbar.Header>
                  </Grid>
              </Navbar>
              <Jumbotron className="App-jumbotron">
                  <Grid>
                      <Row >
                        <img src={logo} className="App-logo" alt="logo" />
                        <h2>Welcome to KiteArmada Convenience Shop</h2>
                        <p>
                            Order goods here and we will bring it to your KiteArmada accommodation.
                        </p>
                      </Row>
                  </Grid>
              </Jumbotron>
              <Grid>
                  <Row>
                      <ItemsSelector items={this.state.items}
                                     parsed_address={this.state.parsed_address}
                                     onUpdate={(item) => this.updateItem(item)}
                                     onPaymentReceived={() => this.loadData()}
                                     note_to_payer={this.state.note_to_payer}
                      />
                  </Row>
                  <Row>
                      <AddressForm title="Delivery Address"
                                   address={this.state.parsed_address}
                                   onAddressChanged={(new_address) => this.setState({ parsed_address: new_address })}
                      />
                  </Row>
              </Grid>
          </div>
        );
    }

    updateItem(item) {
        const oitems = this.state.items;
        const mitem = {}; mitem[item.code] = item;
        const items = Object.assign({}, oitems, mitem);
        this.setState({items: items});
    }
}

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
            const street_number = this.getGEOAddressComponent(acs, 'street_number').short_name;
            const route = this.getGEOAddressComponent(acs, 'route').long_name;
            const locality = this.getGEOAddressComponent(acs, 'locality').long_name;
            const region = this.getGEOAddressComponent(acs, 'administrative_area_level_1').short_name;
            const postal_code = this.getGEOAddressComponent(acs, 'postal_code').short_name;
            const country = this.getGEOAddressComponent(acs, 'country').short_name;
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

class ItemsSelector extends Component {
    constructor(){
      super();
    }

    render() {
        const shipping_address = this.props.parsed_address;
        const note_to_payer = this.props.note_to_payer;
        const itemsMap = this.props.items;
        let paymentItems = [];
        var total = 0.00;

        if (itemsMap) {
            var groupedRows = {};
            for (var code in itemsMap) {
                const item = itemsMap[code];
                const item_category = item.category;
                const itemRow = this.itemRow(item, this.props.onUpdate);
                if (groupedRows[item_category])
                    groupedRows[item_category].push(itemRow);
                else
                    groupedRows[item_category] = [itemRow];
                total += item.price * item.quantity;
                if (item.quantity > 0) {
                    paymentItems.push({
                        name: item.name,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        sku: item.code,
                        currency: "AUD"
                    });
                }
            }
            const categoryRows = Object.keys(groupedRows).map((category) => {
                const itemRows = groupedRows[category];
                return (
                    <Panel header={category} eventKey={category} key={category}>
                        <Grid fluid>
                            {itemRows}
                        </Grid>
                    </Panel>
                );
            });

            return (
                <Grid>
                    <Row>
                        <Col sm={12} md={6}><p className="Prompt">Please select items you want us to deliver</p></Col>
                        <Col sm={6} md={3}><p className="Prompt">Order Total: {priceFormatter.format(total)}</p></Col>
                    </Row>
                    <Row>
                        <Accordion>
                            {categoryRows}
                        </Accordion>
                    </Row>
                    { total > 0 && shipping_address ? (
                        <Row>
                            <Col mdOffset={10} smOffset={5}>
                                <PaymentBtn env={PayPalConf.env}
                                            style={{size: 'responsive'}}
                                            client={PayPalConf.client}
                                            commit={true}
                                            amount={{total: total, currency: 'AUD'}}
                                            items={paymentItems}
                                            shipping_address={shipping_address}
                                            note={note_to_payer}
                                            onPaymentReceived={() => this.onPaymentReceived()}
                                />
                            </Col>
                        </Row>
                    ) : (<div/>)}
                </Grid>
            );
        }
        return (<Well>Loading available items...</Well>);
    }

    itemRow(item, onUpdate) {
        const id = item.code;
        /* TODO: fix header rendering */
        return (
                                <Row key={id}>
                                    <Col sm={12} md={6}>
                                        <p className="Item-header">{item.title}</p>
                                        <p>{item.description}</p>
                                    </Col>
                                    <Col sm={4} md={2}>
                                        <p className="Item-header">{priceFormatter.format(item.price)}</p>
                                    </Col>
                                    <Col sm={2} md={1} >
                                        <FormControl type="number" id={id} value={item.quantity}
                                                     onChange={(e) => this.onQuantityChange(e, onUpdate)}/>
                                    </Col>
                                    <Col sm={2} md={1}>
                                        <p className="Item-header">{priceFormatter.format(item.quantity * item.price)}</p>
                                    </Col>
                                </Row>
        );
    }

    onPaymentReceived(){
        // Clear selected items list
        const onPaymentReceived = this.props.onPaymentReceived;
        if (onPaymentReceived) {
            onPaymentReceived();
        }
        alert('Your PayPal payment received, thank you!');
    }

    onQuantityChange(e, onUpdate){
        const oitem = this.props.items[e.target.id];
        const item = Object.assign({}, oitem, {quantity: e.target.value});
        onUpdate(item);
    }
}

export default App;