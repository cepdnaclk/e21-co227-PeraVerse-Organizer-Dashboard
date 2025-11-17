const WebSocket = require('ws');

const KIOSK_URL = 'ws://localhost:5010/ws';

let ws;

function initWS() {
  ws = new WebSocket(KIOSK_URL);

  ws.on('open', () => {
    console.log('Connected to kiosk simulator at', KIOSK_URL);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected, retrying in 3s...');
    setTimeout(initWS, 3000); // reconnect automatically
  });
}

initWS();

function sendToKiosk(alert) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(alert), (err) => {
      if (err) console.error('Failed to send alert:', err.message);
    });
  } else {
    console.warn('WebSocket not connected. Cannot send alert:', alert);
  }

  console.log('Alert sent to kiosk (simulation):', alert);
}

module.exports = { sendToKiosk };

