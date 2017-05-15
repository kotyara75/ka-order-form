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
          location: null,
          address: 'No address found',
          parsed_address: null,
          items: null
      };
    }

    setItems(data){
        if (data && data.feed.entry.length > 0) {
            const entries = data.feed.entry;
            var items = {};
            for (var i = 0; i < entries.length; i++) {
              const entry = entries[i];
              const code = entry.gsx$itemcode.$t;
              items[code] = {
                  code: code,
                  name: entry.gsx$itemname.$t,
                  price: entry.gsx$price.$t,
                  quantity: 0,
                  description: entry.gsx$description.$t,
                  category: entry.gsx$category.$t
              };
            }
            this.setState({items: items});
        }
    }

    loadData() {
      const url="https://spreadsheets.google.com/feeds/list/1GBabQ_MakwaQX0E1apd3A9HhPjNKhPYDHBf1r3uOAwo/od6/public/values?alt=json-in-script&callback=?";
      $.getJSON(url,{}, (data) => this.setItems(data));
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition((l) => this.setLocation(l));
        this.loadData();
    }

    getGEOAddressComponent(address_components, component) {
        return address_components.find(function (a) {
                return a.types.find(function (t) {
                    return t === component;
                });
        });
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
            this.setState({
                address: GEOdata.results[0].formatted_address,
                parsed_address: {
//                    recipient_name: "Brian Robinson",
//                     phone: "011862212345678",
                    line1: street_number + ' ' + route,
                    line2: '',
                    city: locality,
                    country_code: country,
                    postal_code: postal_code,
                    state: region
                }
            });
        }

    }

    setLocation(l) {
        if (l) {
            this.setState({location: l, address: '...getting your address...'});

            const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
                l.coords.latitude + ',' + l.coords.longitude +
                    '&result_type=street_address|locality|administrative_area_level_1|postal_code|country' +
                '&key=AIzaSyDGa4mgGaPfpbeIuL-VcVs6sOIuzzoQinQ';

            $.getJSON(url, {}, (data) => this.setAddress(data));
        }
    }

    handleAddressChange(e) {
        this.setState({ address: e.target.value });
        // TODO: Parse address into the component state 'parsed_address'
    }

    validateAddress(a) {
        const length = a.length;
        if (length > 10) return {result: 'success', message: 'Please update delivery address if required.'};
        else if (length > 5) return {result: 'warning', message: 'Please double check that entered address is valid.'};
        else if (length >= 0) return {result: 'error', message: 'Please enter valid address.'};
    }

    render() {
        const location = this.state.location;
        const address = this.state.address;
        const address_check = this.validateAddress(address);
        const location_title = (
            <h3>Your Location</h3>
        );
        const location_panel = location ?
            (
                <Panel header={location_title}>
                    <Form horizontal>
                        <FormGroup>
                          <Col componentClass={ControlLabel} sm={2}>Your Coordinates</Col>
                          <Col sm={10}>
                              <FormControl.Static>{location.coords.latitude}, {location.coords.longitude}</FormControl.Static>
                          </Col>
                        </FormGroup>
                        <FormGroup controlId="formAddress" validationState={address_check.result}>
                            <Col componentClass={ControlLabel} sm={2}>Delivery Address</Col>
                            <Col sm={10}>
                                <FormControl type="text" value={address}
                                                      onChange={(e) => this.handleAddressChange(e)}/>
                                <FormControl.Feedback />
                                <HelpBlock>{address_check.message}</HelpBlock>
                            </Col>

                        </FormGroup>
                    </Form>
                </Panel>
            ):
            (
               <Panel header={location_title}>
                    One moment, we are locating you ...
               </Panel>
            );

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
                      {location_panel}
                  </Row>
                  <Row>
                      <ItemsSelector items={this.state.items}
                                     parsed_address={this.state.parsed_address}
                                     onUpdate={(item) => this.updateItem(item)}/>
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

class ItemsSelector extends Component {
    constructor(){
      super();
    }

    render() {
        const shipping_address = this.props.parsed_address;

      const itemsMap = this.props.items;
      let paymentItems = [];

      var total = 0.00;
      if (itemsMap) {
        var groupedRows = {};
        for(var code in itemsMap) {
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
                { total > 0 && shipping_address? (
                    <Row>
                          <Col mdOffset={10} smOffset={5}>
                            <PaymentBtn env={PayPalConf.env}
                                        style={{ size: 'responsive' }}
                                        client={PayPalConf.client}
                                        commit={true}
                                        amount={{total: total, currency: 'AUD'}}
                                        items={paymentItems}
                                        shipping_address={shipping_address}
                                        note="Please call us at 123123123 for enquires"
                                        onPaymentRecieved={()=>this.onPaymentRecieved()}
                            />
                          </Col>
                      </Row>
                ): (<div/>)}
            </Grid>
        );
      }
      return (<Well>Loading Data...</Well>);
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

    onPaymentRecieved(){
        // Clear selected items list
        const items = this.props.items;
        const onUpdate = this.props.onUpdate;
        if (items) {
            for (var code in items) {
                const oitem = items[code];
                if (oitem.quantity) {
                    const item = Object.assign({}, oitem, {quantity: 0});
                    if (onUpdate)
                        onUpdate(item);
                }
            }
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