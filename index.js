// [x] FIXME: Don't search on SCCP line for SIP result, we loop over the each line and we don't care about the type of line. If for a user we have a sccp line we don't need to make an http GET to get his SIP line because it's an sccp line. (needed)
// [x] FIXME: There is no documentation for onCardCanceled (needed)
// [x] FIXME: Tooltip seems not working everywhere to get information for debugging. Exemple on icon, there is only tooltip on the first icon. (needed)
// [?] FIXME: When i use the click to call, the call is not launched now (needed)
// [x] FIXME: Calllog seems not updated after a call, need to reload the page (needed)
// [x] FIXME if we use loginWithToken, the method onAuthenticate is call twice. (needed)

// FIXME: Permit to support CTI instead webrtc lines (not now) (not needed)
// FIXME: UX/UI, make a connection page with all information for login a user. Like add a connection and use it for the authentication. (exemple with okta, no a priority, but good idea for the end user) (not needed)

import softphone from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@0.0.3/lib/esm/softphone.js';
import 'https://cdn.jsdelivr.net/npm/@wazo/sdk';

const button = document.getElementById('toggle-softphone-button');
const status = document.getElementById('status');
const result = document.getElementById('result');

const wazoServer = 'wazoglobal.wazo.io';
const domainNameLdap = 'wazo.io';
const debug = false;

button.disabled = true;

button.addEventListener('click', (e) => {
  e.preventDefault();
  softphone.toggleSoftphoneDisplay();
});

if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

const getSessionOnStorage = () => JSON.parse(localStorage.getItem('session'));

const setSessionOnStorage = session => {
  localStorage.setItem('session', JSON.stringify(session));
};

const removeSessionOnStorage = () => {
  localStorage.clear();
};

const openLogin = () => {
  $('#authentication').show();
  $('#app').hide();

  $('#login-form').on('submit', async e => {
    e.preventDefault();

    $('.login-txt').html('loading...');
    $('#submit-login').prop('disabled', true);

    authenticate($('#email').val(), $('#password').val());
  });
};

const checkJson = item => {
  try {
    const message = JSON.parse(item);
    return message.reason || item;
  } catch (_) {
    return item;
  }
};

const displayAuthError = error => {
  $('.auth-error').html('');
  $('.serv-error').html('');
  $('.login').removeClass('onalert');
  $('label').removeClass('onerror');

  const message = checkJson(error.message);

  if (message[0].includes('Authentication')) {
    $('.auth-error').html('Authentication failed, please verify you typed your authentication details right');
    $('#password').addClass('onalert');
    $('#email').addClass('onalert');
    $('.auth-lab').addClass('onerror');
  } else {
    $('.serv-error').html('Couldn\'t reach server, please verify its name and your internet connection');
    $('#server').addClass('onalert');
    $('.serv-lab').addClass('onerror');
  }

  $('#submit-login').prop('disabled', false);
  $('.login-txt').html('login');
};

// This should not be in `app` because it's fired after `softphone.init`.
softphone.onIFrameLoaded = () => {
  button.disabled = false;
};

const app = () => {
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
        type: 'string',
        enum: [
          'DE',
          'IT',
          'JP',
          'US',
          'RU',
          'Other',
        ],
      },
    },
  }, {
    note: { 'ui:widget': 'textarea' },
    clientId: { 'ui:field': 'autocomplete' },
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

  softphone.onAuthenticated = async (session) => {
    console.log('onAuthenticated', session);
    status.innerHTML = `Hello ${session.profile.firstName}`;

    Wazo.Auth.setHost(wazoServer);
    Wazo.Auth.setApiToken(session.token);

    // const callLogs = await Wazo.api.callLogd.listCallLogs();
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
    console.log('onCardCanceled');
  };

  softphone.onCallLogCreated = cdr => {
    console.log('onCallLogCreated');
    console.log(cdr);
  };

  softphone.onWebsocketMessage = (message) => {
    console.log('onWebsocketMessage', message);
  };

  softphone.onSearchOptions = (fieldId, query) => {
    console.log(fieldId);
    console.log(query);
    const results = [
      { label: 'Tutu', id: '0123' },
    ];
    softphone.onOptionsResults(fieldId, results);
  };
};

const onLogin = () => {
  $('#authentication').hide();
  $('#app').show();
  $('#logout').on('click', () => {
    removeSessionOnStorage();
    window.location.reload(false);
  });

  app();
};

const authenticate = async (username, password) => {
  try {
    const session = await Wazo.Auth.logIn(username, password).catch();
    setSessionOnStorage(session);

    onLogin();
  } catch (e) {
    displayAuthError(e);
  }
};

(async () => {
  Wazo.Auth.init('wazo-softphone-demo');
  Wazo.Auth.setHost(wazoServer);

  const rawSession = getSessionOnStorage();
  if (!rawSession) {
    return openLogin();
  }

  // We should call `init` even if we don't have a session.
  softphone.init({ url: 'http://localhost:3000', server: wazoServer, domainName: domainNameLdap, debug, disableAutoLogin: true });

  const session = await Wazo.Auth.validateToken(rawSession.token, rawSession.refreshToken);
  if (session) {
    softphone.loginWithToken(session.token, rawSession.refreshToken);
  }

  return onLogin();
})();
