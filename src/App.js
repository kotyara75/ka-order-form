import React, { Component } from 'react';
import { Navbar, Jumbotron, Grid, Row, Panel, Form, FormGroup, ControlLabel,
    FormControl, Col, HelpBlock, Tab, Nav, NavItem } from 'react-bootstrap';
import $ from 'jquery';
import logo from './logo.svg';
import './App.css';


class App extends Component {
    constructor(){
      super();
      this.state = {
          // auth_required: false
          location: null,
          address: 'No address found'
      };
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition((l) => this.setLocation(l));
        loadData();
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
                      <p className="Prompt">
                              Please select items you want us to deliver
                      </p>
                      <Tab.Container id="products-list" defaultActiveKey="first">
                        <Row className="clearfix">
                          <Col sm={2}>
                            <Nav bsStyle="pills" stacked>
                              <NavItem eventKey="first">
                                Tabaco
                              </NavItem>
                              <NavItem eventKey="second">
                                Gentleman Set
                              </NavItem>
                            </Nav>
                          </Col>
                          <Col sm={10}>
                            <Tab.Content animation>
                              <Tab.Pane eventKey="first">
                                <pre id="content"></pre>
                              </Tab.Pane>
                              <Tab.Pane eventKey="second">
                                Tab 2 content
                              </Tab.Pane>
                            </Tab.Content>
                          </Col>
                        </Row>
                      </Tab.Container>
                  </Row>
              </Grid>
          </div>
        );
    }
}

function loadData() {
      var url="https://spreadsheets.google.com/feeds/list/1GBabQ_MakwaQX0E1apd3A9HhPjNKhPYDHBf1r3uOAwo/od6/public/values?alt=json-in-script&callback=?";
      $.getJSON(url,{}, function (data) {
          if (data && data.feed.entry.length > 0) {
            const entries = data.feed.entry;
            for (var i = 0; i < entries.length; i++) {
              const item = entries[i];
              // Print columns A to C, which correspond to indices 0 and 4.
              appendPre(item.gsx$itemname.$t + ', ' + item.gsx$category.$t + ', ' + item.gsx$price.$t);
            }
          } else {
              appendPre('No data found.');
          }
      });
}

function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }

export default App;