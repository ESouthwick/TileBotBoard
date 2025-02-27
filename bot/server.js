import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { teams } from './TileRaceBot.mjs'; // Import teams directly

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

app.use(express.static('public'));

// Server-wide listener for bot updates
io.on('teamsUpdate', (updatedTeams) => {
    console.log('Received teamsUpdate from bot:', updatedTeams);
    io.emit('teamsUpdate', updatedTeams); // Broadcast to all connected clients
});

// Client connection handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.emit('teamsUpdate', Array.from(teams.entries()));
    console.log('Sent initial teamsUpdate:', Array.from(teams.entries()));

    socket.on('requestTeams', () => {
        console.log('Client requested teams data');
        socket.emit('teamsUpdate', Array.from(teams.entries()));
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Server running on port 3001');
});

export { io };