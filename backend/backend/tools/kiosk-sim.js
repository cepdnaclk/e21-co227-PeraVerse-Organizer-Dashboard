// kiosk-sim.js
const WebSocket = require('ws');

// Get kiosk ID and WebSocket URL from CLI args
const kioskId = process.argv[2] || 'Kiosk-1';
const url = process.argv[3] || 'ws://localhost:5010/ws';

const ws = new WebSocket(url);

// When connected
ws.on('open', () => {
  console.log(`✅ [${kioskId}] Connected to ${url}`);
});

// When a message (alert) is received
ws.on('message', (data) => {
  try {
    const alert = JSON.parse(data);
    console.log('\n==============================');
    console.log(`🖥️  [${kioskId}]`);
    console.log('🚨 New Alert Received!');
    console.log(`📢 Message: ${alert.alert}`);
    console.log(`🕒 Time: ${alert.sent_at}`);
    console.log('==============================\n');
  } catch (err) {
    console.error(`[${kioskId}] Error parsing alert:`, err.message);
  }
});

// When disconnected
ws.on('close', () => {
  console.log(`❌ [${kioskId}] Disconnected`);
});

// On connection error
ws.on('error', (err) => {
  console.error(`⚠️ [${kioskId}] Connection error:`, err.message);
});

