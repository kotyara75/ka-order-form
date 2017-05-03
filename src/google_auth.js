/**
 * Created by alexander on 27/4/17.
 */
import $script from 'scriptjs';

let _onGAPILoaded;
let _gapiLoaded;
let _onAuthRequired;

$script("https://apis.google.com/js/api.js", function () {
  _gapiLoaded = true;
  if (_onGAPILoaded)
    handleClientLoad();
});

// Client ID and API key from the Developer Console
  var CLIENT_ID = '261039335344-hfd5rr4has8lf800rv23e6tl4au0ijp1.apps.googleusercontent.com';

  // Array of API discovery doc URLs for APIs used by the quickstart
  var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

  /**
   *  On load, called to load the auth2 library and API client library.
   */
  function handleClientLoad() {
    window.gapi.load('client:auth2', () => initClient());
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
    window.gapi.client.init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      window.gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => updateSigninStatus(isSignedIn));

      // Handle the initial sign-in state.
      updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      if (_onGAPILoaded)
          _onGAPILoaded((event) => handleSignoutClick(event));
      listItems();
    } else {
      _onAuthRequired((event) => handleAuthClick(event))
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick(event) {
    window.gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
    window.gapi.auth2.getAuthInstance().signOut();
  }

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }

  /**
   * Print the names and majors of students in a sample spreadsheet:
   * https://docs.google.com/spreadsheets/d/1GBabQ_MakwaQX0E1apd3A9HhPjNKhPYDHBf1r3uOAwo/edit
   * https://spreadsheets.google.com/feeds/list/1GBabQ_MakwaQX0E1apd3A9HhPjNKhPYDHBf1r3uOAwo/od6/public/values?alt=json&callback=mk
   */
  function listItems() {
    window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1GBabQ_MakwaQX0E1apd3A9HhPjNKhPYDHBf1r3uOAwo',
      range: 'Goods!A2:C',
    }).then(function(response) {
      var range = response.result;
      if (range.values.length > 0) {
        appendPre('Item, Category, Price:');
        for (var i = 0; i < range.values.length; i++) {
          var row = range.values[i];
          // Print columns A to C, which correspond to indices 0 and 4.
          appendPre(row[0] + ', ' + row[1] + ', ' + row[2]);
        }
      } else {
        appendPre('No data found.');
      }
    }, function(response) {
      appendPre('Error: ' + response.result.error.message);
    });
  }

function setGoogleAPILoadedCallback(onGAPILoaded, onAuthorizationRequired) {
    _onGAPILoaded = onGAPILoaded;
    _onAuthRequired = onAuthorizationRequired;

    if (_gapiLoaded) {
        handleClientLoad();
    }
}

export default setGoogleAPILoadedCallback