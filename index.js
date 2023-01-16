// FIXME: Don't search on SCCP line for SIP result, we loop over the each line and we don't care about the type of line. If for a user we have a sccp line we don't need to make an http GET to get his SIP line because it's an sccp line. (needed)
// FIXME: When we use held button call we lost media (needed)
// FIXME: There is no documentation for onCardCanceled (needed)
// FIXME: Tooltip seems not working everywhere to get information for debugging. Exemple on icon, there is only tooltip on the first icon. (needed)
// FIXME: When i use the click to call, the call is not launched now (needed)
// FIXME: Calllog seems not updated after a call, need to reload the page (needed)
// FIXME: Add capacity for configuration like TURN, debug etc... Same as our applications. (no tested) Need https://github.com/TinxHQ/portal-ui/pull/1716

// FIXME: Permit to support CTI instead webrtc lines (not now) (not needed)
// FIXME: UX/UI, make a connection page with all information for login a user. Like add a connection and use it for the authentication. (exemple with okta, no a priority, but good idea for the end user) (not needed)


import softphone from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@0.0.3/lib/esm/softphone.js';
import { Wazo } from 'https://cdn.jsdelivr.net/npm/@wazo/sdk';

const button = document.getElementById('toggle-softphone-button');
const status = document.getElementById('status');
const result = document.getElementById('result');

const wazoServer = 'quintana.wazo.community';
const domainNameLdap = 'quintana.wazo.community';

const debug = false;

button.disabled = true;

button.addEventListener('click', (e) => {
  e.preventDefault();
  softphone.toggleSoftphoneDisplay();
});

if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

// softphone.loginWithToken(token, refreshToken);

softphone.init({server: wazoServer, domainName: domainNameLdap, debug: debug});

softphone.onIFrameLoaded = () => {
  button.disabled = false;
};

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
  new Notification(`Call incoming from ${call.displayName}`);
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
  
  Wazo.Auth.setHost(wazoServer);
  Wazo.Auth.setApiToken(session.token);
  
  const callLogs = await Wazo.api.callLogd.listCallLogs();
  console.log(callLogs);
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

softphone.onAgentResumed = () => {
  console.log('Agent Resumed');
};

softphone.onLanguageChanged = (language) => {
  console.log(language);
};


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

softphone.onWazoContactSearch = query => {
  console.log(`Searching contact... ${query}`);
};

softphone.onCardCanceled = () => {
  console.log('OncardCanceled');
}

softphone.onCallLogCreated = cdr => {
  console.log('onCallLogCreated');
  console.log(cdr);
}

softphone.onWebsocketMessage = (message) => {
  console.log(message);
}

softphone.onSearchOptions = (fieldId, query) => {
  console.log(fieldId);
  console.log(query);
  const results = [
    { label: 'Tutu', id: '0123' },
  ]
  softphone.onOptionsResults(fieldId, results);
};
