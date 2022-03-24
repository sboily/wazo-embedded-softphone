const { Softphone } = Wazo;
const button = document.getElementById('toggle-softphone-button');
const status = document.getElementById('status');

button.addEventListener('click', (e) => {
  e.preventDefault();

  Softphone.toggleSoftphoneDisplay();
});

Softphone.init();

Softphone.onLinkEnabled = link => {
  link.style.textDecorationStyle = 'dotted';
};

Softphone.onCallIncoming = call => {
  status.innerHTML = `Call incoming from ${call.displayName}`;
};

Softphone.onCallEnded = call => {
  status.innerHTML = `Call with ${call.displayName} ended`;
};

Softphone.onCallMade = call => {
  status.innerHTML = `Call made with ${call.displayName}`;
};

Softphone.onAuthenticated = session => {
  status.innerHTML = `Hello ${session.profile.firstName}`;
};
