const { WebSocketServer, OPEN } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

// Permanent history array stored in server memory
let globalChatHistory = []; 

console.log(`WebSocket server listening globally on port ${PORT}`);

wss.on('connection', (ws) => {
    console.log('A new client connected.');

    // CRITICAL FIX: Immediately send the existing chat history to the newly connected user
    if (globalChatHistory.length > 0) {
        ws.send(JSON.stringify({
            type: 'HISTORY_LOAD',
            history: globalChatHistory
        }));
    }

    ws.on('message', (rawData) => {
        try {
            const parsedData = JSON.parse(rawData);
            
            // Format the new message package
            const messagePackage = {
                type: 'NEW_MESSAGE',
                text: parsedData.text,
                sender: parsedData.sender,
                timestamp: new Date().toLocaleTimeString()
            };

            // Save it to the server's history array
            globalChatHistory.push(messagePackage);

            // Keep only the last 100 messages so the server doesn't run out of memory
            if (globalChatHistory.length > 100) {
                globalChatHistory.shift(); 
            }

            // Broadcast the new single message to everyone
            wss.clients.forEach((client) => {
                if (client.readyState === OPEN) {
                    client.send(JSON.stringify(messagePackage));
                }
            });
        } catch (e) {
            console.error('Error handling message:', e);
        }
    });
});
