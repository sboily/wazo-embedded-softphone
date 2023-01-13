import softphone from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@0.0.3/lib/esm/softphone.js';

const button = document.getElementById('toggle-softphone-button');
const status = document.getElementById('status');
const result = document.getElementById('result');

const wazoServer = 'quintana.wazo.community';
const domainNameLdap = 'quintana.wazo.community';

// FIXME: Tooltip seems not working everywhere to get information for debugging.
const debug = false;

button.disabled = true;

button.addEventListener('click', (e) => {
  e.preventDefault();
  softphone.toggleSoftphoneDisplay();
});

softphone.init({server: wazoServer, domainName: domainNameLdap, debug: debug});

// FIXME: session seems undefined but documented on README.
softphone.onIFrameLoaded = () => {
  button.disabled = false;
};

// FIXME: There is not documentation for this method on the README.
softphone.optionsFetched('clientId', [
  { label: 'Manu', id: 'test' },
  { label: 'Bob', id: '123' },
]);

softphone.customizeAppearance({
  primary: '#2e5',
}, {
  en: {
    user: {
      ldapConnection: 'LDAP !!',
      ldapLogin: 'LOGIN WITH LDAP !!',
    },
  },
}, {
  logo: 'https://www.ytel.com/hubfs/ytel_update_2021/ytel_logo.svg',
});

softphone.setFormSchema({
  type: 'object',
  required: ['title', 'phoneNumber'],
  properties: {
    title: { type: 'string', title: 'Title' },
    phoneNumber: { type: 'string', title: 'Phone' },
    note: { type: 'string', title: 'Note' },
    clientId: { type: 'object', title: 'Client ID' },
    vegetarian: { type: 'boolean' },
    nationality: {
      "type": "string",
      "enum": [
        "DE",
        "IT",
        "JP",
        "US",
        "RU",
        "Other"
      ]
    },
  },
}, {
  note: { 'ui:widget': 'textarea' },
  clientId :{ 'ui:field': 'autocomplete'},
});

softphone.onCallEstablished = (call) => {
  console.log(call);
  result.innerHTML = 'onCallEstablished';
};

softphone.onCallRejected = (call) => {
  console.log(`reject ${call}`);
  result.innerHTML = 'Reject';
};

softphone.onCardSaved = card => {
  result.innerHTML = JSON.stringify(card);
};

softphone.onLinkEnabled = link => {
  link.style.textDecorationStyle = 'dotted';
};

softphone.onCallIncoming = call => {
  status.innerHTML = `Call incoming from ${call.displayName}`;
  softphone.displaySoftphone();
};

softphone.onCallEnded = (call, card) => {
  status.innerHTML = `Call with ${call.displayName} ended`;
  result.innerHTML = `Call with ${call.displayName} ended, card: ${JSON.stringify(card)}`;
  softphone.setCardValue('cardId', 'some-card-id');
};

softphone.onOutgoingCallMade = call => {
  result.innerHTML = `<code>${JSON.stringify(call)}</code>`;
  status.innerHTML = `Call made with ${call.displayName}`;
  setTimeout(() => {
    softphone.setCardValue('title', 'URGENT');
    softphone.setCardValue('note', 'Un Homme pressé!');
    softphone.setCardValue('vegetarian', true);
    softphone.setCardValue('nationality', 'US');
    softphone.setCardValue('clientId', {label: 'Bob', id: '123'});
  }, 3000);

  setTimeout(() => {
    softphone.setCardValue('vegetarian', false);
  }, 4000);
};

softphone.onAuthenticated = session => {
  status.innerHTML = `Hello ${session.profile.firstName}`;
  let refreshToken = session.refreshToken;
  const token = session.token;
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  refreshToken = localStorage.getItem('refreshToken');
};

softphone.onDtmfSent = tone => {
  console.log(tone);
  result.innerHTML = tone;
};

softphone.onLoggedOut = session => {
  console.log(session);
  result.innerHTML = session;
};

softphone.onStartRecording = () => {
  console.log('START RECORD');
};

softphone.onStopRecording = () => {
  console.log('STOP RECORD');
};

softphone.onAgentLoggedIn = () => {
  console.log('Agent Logged in');
};

softphone.onAgentLoggedOut = () => {
  console.log('Agent Logged out');
};

softphone.onAgentPaused = () => {
  console.log('Agent Pause');
};

// FIXME: Missing, this method do nothing.
softphone.onAgentUnPaused = () => {
  console.log('Agent UnPause');
};

softphone.onLanguageChanged = (language) => {
  console.log(language);
};


// FIXME: When we use held button call is hangup
softphone.onCallHeld = () => {
  console.log('Call Held');
};

softphone.onCallResumed = () => {
  console.log('Call resumed');
};

softphone.onCallMuted = () => {
  console.log('Call muted');
};

softphone.onCallUnMuted = () => {
  console.log('Call unmuted');
};

// FIXME: When you search a contact on dialer, after the popup is opened, the search continue to make search if you have less than 3 characters
// FIXME: In contact page there is no restriction, any characters launch the search, and when you erase all characters, it continue to search.
softphone.onWazoContactSearch = (query) => {
  console.log(`Searching contact... ${query}`);
};

// FIXME: There is no onCardCancelled to catch if the user wants to don't save the card.
// FIXME: There is no onNewCDREntry or something like that.
// FIXME: Probably a websocket forward would be a good idea. onWebsocketEvent and probably a websocket subscribe? There is no reason to have multiple websocket...
// FIXME: Probably have a method for make generic API request would be also great.
// FIXME: Missed a DND and forward information like desktop or web application
// FIXME: Missed page for call forward
// FIXME: Permit to support CTI instead webrtc lines
// FIXME: Don't search on SCCP line for SIP result
// FIXME: Add tenantId input to login page (support for domain_name new version)
// FIXME: Inject refreshToken / Token for autologin. Ex. User is logged on another web page.
// FIXME: UX/UI, make a connection page with all information for login a user. Like add a connection and use it for the authentication.
// FIXME: Notification (browser) for incoming call.
// FIXME: Add information about the first time, there is no ringing sound. Check on google link warning for example.
// FIXME: Add license page dependancies like we have on other product.
// FIXME: Add capacity for configuration like TURN, debug etc... Same as our applications.

softphone.onSearchOptions = (fieldId, query) => {
  console.log(fieldId);
  console.log(query);
  const results = [
    { label: 'Tutu', id: '0123' },
  ]
  softphone.onOptionsResults(fieldId, results);
};
