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
       return window.paypal.rest.payment.create(env, client, {
           transactions: [
               {
                   amount: {total: '1.00', currency: 'AUD'}
               }
           ]
       });
    }

    onAuthorize(data, actions) {
        // Optional: display a confirmation page here
        return actions.payment.execute().then(function () {
            // Show a success page to the buyer
            alert('Your PayPal payment received, thank you!');
            // TODO: clear selected items list by reloading data
        });
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