// backend/tools/ws-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5010, path: '/ws' });

let kiosks = [];

wss.on('connection', (ws, req) => {
  const kioskId = req.url.split('?id=')[1] || `Kiosk-${kiosks.length + 1}`;
  kiosks.push(ws);
  console.log(`[${kioskId}] connected`);

  ws.on('message', (msg) => {
    console.log(`[${kioskId}] says: ${msg}`);
  });

  ws.on('close', () => {
    console.log(`[${kioskId}] disconnected`);
    kiosks = kiosks.filter(k => k !== ws);
  });
});

function broadcastAlert(alert) {
  kiosks.forEach((kiosk) => {
    if (kiosk.readyState === WebSocket.OPEN) {
      kiosk.send(JSON.stringify(alert));
    }
  });
  console.log("Broadcasted alert to all kiosks:", alert);
}

// Export the broadcaster (optional if you want backend to use it directly)
module.exports = { broadcastAlert };

console.log("✅ WebSocket server running at ws://localhost:5010/ws");

