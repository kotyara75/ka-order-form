/**
 * Created by alexander on 27/4/17.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import paypal from './../../paypal-checkout/dist/checkout.js'

var PayPalConf = {
    env: 'sandbox', // Optional: specify 'production' environment
    style: { size: 'responsive' },
    client: {
        sandbox:    'AWUUZWbqdrOZ4diDulnRpRdHoNhmPSwhgWMtv3duBr5CTjzo3KwL9idrRW4hIbmJ7kSthh3GTK9ioSPa',
        production: 'xxxxxxxxx'
    }
};

const ReactButton = window.paypal.Button.driver('react', {
    React,
    ReactDOM,
});

class PaymentBtn extends Component {
    render() {
        let opts = {
            env: PayPalConf.env,
            style: { size: 'responsive' },
            client: PayPalConf.client,
            payment() {
                let env    = this.props.env;
                let client = this.props.client;
                return window.paypal.rest.payment.create(env, client, {
                    transactions: [
                        {
                            amount: { total: '1.00', currency: 'AUD' }
                        }
                    ]
                });
            },
            commit: true, // Optional: show a 'Pay Now' button in the checkout flow
            onAuthorize(data, actions) {
                // Optional: display a confirmation page here
                return actions.payment.execute().then(function() {
                    // Show a success page to the buyer
                    alert('Your PayPal payment received, thank you!');
                    // TODO: clear selected items list by reloading data
                });
            }
        };

        return (
            <div>
                <ReactButton env={opts.env} style={opts.style}
                                     client={opts.client} payment={opts.payment}
                                     commit={opts.commit} onAuthorize={opts.onAuthorize} />
            </div>
        );
    }

}

export default PaymentBtn;