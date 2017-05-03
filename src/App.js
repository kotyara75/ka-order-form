import React, { Component } from 'react';
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

    render() {
        // const auth_required = this.state.auth_required;
        const location = this.state.location;
        const address = this.state.address;
        const location_text = (location? address + ' (' + location.coords.latitude + ',' + location.coords.longitude +')':
            'being determined ...');
        return (
          <div className="App">
              <div className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h2>Welcome to KiteArmada</h2>
              </div>
              <p className="Location">
                  Your location: {location_text}
              </p>
              <p className="Prompt">
                  Please select items you want us to deliver
              </p>

              <pre id="content"></pre>
          </div>
        );
    }
}

function loadData() {
      var url="https://spreadsheets.google.com/feeds/list/1GBabQ_MakwaQX0E1apd3A9HhPjNKhPYDHBf1r3uOAwo/od6/public/values?alt=json-in-script&callback=?";
      $.getJSON(url,{}, function (data) {
          if (data && data.feed.entry.length > 0) {
            appendPre('Item, Category, Price:');
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