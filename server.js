const { WebSocketServer, OPEN } = require('ws');

// Cloud providers assign a random port via process.env.PORT. Fallback to 8080 for local testing.
const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server listening globally on port ${PORT}`);

wss.on('connection', (ws) => {
    ws.on('message', (rawData) => {
        try {
            const parsedData = JSON.parse(rawData);
            wss.clients.forEach((client) => {
                if (client.readyState === OPEN) {
                    client.send(JSON.stringify({
                        text: parsedData.text,
                        sender: parsedData.sender,
                        timestamp: new Date().toLocaleTimeString()
                    }));
                }
            });
        } catch (e) {
            console.error(e);
        }
    });
});
