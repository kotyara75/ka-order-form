import React, { Component } from 'react';
import { Navbar, Jumbotron, Grid, Row, Panel, Form, FormGroup, ControlLabel,
    FormControl, Col, HelpBlock, Accordion, InputGroup, Button, Glyphicon, ListGroup, ListGroupItem,
    Well, ButtonGroup} from 'react-bootstrap';
import $ from 'jquery';
import logo from './logo.svg';
import './App.css';

var priceFormatter = new Intl.NumberFormat('en-US',
                        { style: 'currency', currency: 'AUD',
                          minimumFractionDigits: 2 });

class App extends Component {
    constructor(){
      super();
      this.state = {
          // auth_required: false
          location: null,
          address: 'No address found',
          items: null
      };
    }

    setItems(data){
        if (data && data.feed.entry.length > 0) {
            var items = {};
            const entries = data.feed.entry;
            for (var i = 0; i < entries.length; i++) {
              const entry = entries[i];
              const category = entry.gsx$category.$t;
              const item = {
                  name: entry.gsx$itemname.$t,
                  price: entry.gsx$price.$t,
                  number: 0,
                  description: entry.gsx$description.$t
              };
              if (!items[category]) {
                  items[category] = [];
              }
              items[category].push(item);
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

    setAddress(GEOdata) {
        if (GEOdata && GEOdata.results.length > 0)
            this.setState({address: GEOdata.results[0].formatted_address});
    }

    setLocation(l) {
        if (l) {
            this.setState({location: l, address: '...getting your address...'});

            const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
                l.coords.latitude + ',' + l.coords.longitude + '&key=AIzaSyDGa4mgGaPfpbeIuL-VcVs6sOIuzzoQinQ';

            $.getJSON(url, {}, (data) => this.setAddress(data));
        }
    }

    handleAddressChange(e) {
        this.setState({ address: e.target.value });
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
                      <Col sm={12} md={6}><p className="Prompt">Please select items you want us to deliver</p></Col>
                      <Col sm={6} md={3}><p className="Prompt">Order Total: {priceFormatter.format(125.44)}</p></Col>
                  </Row>
                  <Row>
                      <ItemsSelector items={this.state.items}/>
                  </Row>
                  <Row>
                      <Col mdOffset={10} smOffset={5}>
                        <Button type="submit" className="text-align: right">Proceed to payment</Button>
                      </Col>
                  </Row>
              </Grid>
          </div>
        );
    }
}

class ItemsSelector extends Component {
        render() {
          const itemsMap = this.props.items;
          if (itemsMap) {
            const categoryRows = Object.keys(itemsMap).map((category) => {

              const items = itemsMap[category];
              const itemRows = items.map((item) => {
                return itemRow(item.name, item.description, item.number, item.price);
              });

              return (
                        <Panel header={category} eventKey={category} key={category}>
                                <Grid fluid>
                                    {itemRows}
                                </Grid>
                        </Panel>
              );
            });

            return (
            	<Accordion>
              		{categoryRows}
            	</Accordion>
          	);
          }
          return (<p>Loading Data...</p>);
        }
}


function itemRow(title, description, number, price) {
    return (
                            <Row key={title}>
                                <Col sm={12} md={6}>
                                    <p className="Item-header">{title}</p>
                                    <p>{description}</p>
                                </Col>
                                <Col sm={4} md={2}>
                                    <p className="Item-header">{priceFormatter.format(price)}</p>
                                </Col>
                                <Col sm={2} md={1}>
                                    <p className="Item-header">x {number}</p>
                                </Col>
                                <Col sm={2} md={1}>
                                    <p className="Item-header">{priceFormatter.format(number * price)}</p>
                                </Col>
                                <Col sm={4} md={2} >
                                    <Button><Glyphicon glyph="plus" /></Button>
                                    <Button><Glyphicon glyph="minus" /></Button>
                                </Col>
                            </Row>
    );
}

export default App;