/**
 * Created by alexander on 27/4/17.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import paypal from './../../paypal-checkout/dist/checkout.js'

const ReactButton = window.paypal.Button.driver('react', {
    React,
    ReactDOM,
});

class PaymentBtn extends Component {
    payment() {
       const env = this.props.env;
       const client = this.props.client;
       const amount = this.props.amount;
       const description = "The payment transaction description.";
       const items = this.props.items;
       const shipping_address = this.props.shipping_address;
       const note = this.props.note;
       return window.paypal.rest.payment.create(env, client, {
           // intent: 'order',
           transactions: [
               {
                    amount: amount,
                    description: description,
                    item_list: {
                        items: items,
                        shipping_address: shipping_address
                    }
               }
           ],
           note_to_payer: note
       });
    }

    onPaymentRecieved() {
        if (this.props.onPaymentRecieved)
            this.props.onPaymentRecieved();
    }

    onAuthorize(data, actions) {
        // Optional: display a confirmation page here
        return actions.payment.execute().then(() => this.onPaymentRecieved());
    }

    render() {
        return (
            <div>
                <ReactButton env={this.props.env}
                             style={this.props.style}
                             client={this.props.client}
                             payment={() => this.payment()}
                             commit={this.props.commit}
                             onAuthorize={(data,actions) => this.onAuthorize(data,actions)} />
            </div>
        );
    }

}

export default PaymentBtn;