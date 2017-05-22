import React, { Component } from 'react';
import { Navbar, Jumbotron, Grid, Row, Panel,
    FormControl, Col, Accordion, Well } from 'react-bootstrap';
import $ from 'jquery';
import logo from './logo.svg';
import './App.css';
import PaymentBtn from './PayPal.js';
import AddressForm from './AddressForm.js';

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

class ItemsSelector extends Component {

    render() {
        const shipping_address = this.props.parsed_address;
        const note_to_payer = this.props.note_to_payer;
        const itemsMap = this.props.items;
        let paymentItems = [];
        var total = 0.00;
        var total_items = 0;

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
                    total_items += item.quantity;
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
                        <Col sm={6} md={3}><p className="Prompt">Items Selected: {total_items}</p></Col>
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
        return (
                                <Row key={id}>
                                    <Col sm={12} md={6}>
                                        <p className="Item-header">{item.name}</p>
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
        const q = parseInt(e.target.value,10);
        if (q >= 0) {
            const oitem = this.props.items[e.target.id];
            const item = Object.assign({}, oitem, {quantity: q});
            onUpdate(item);
        }
    }
}

export default App;
