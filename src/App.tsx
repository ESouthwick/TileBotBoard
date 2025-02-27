import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
    const [teams, setTeams] = useState<{ name: string; position: number }[]>([]);
    const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [teamSort, setTeamSort] = useState<'asc' | 'desc' | null>(null);
    const [positionSort, setPositionSort] = useState<'asc' | 'desc' | null>(null);
    const [logFilter, setLogFilter] = useState<string>('');

    useEffect(() => {
        const timer = setTimeout(() => {
            const newSocket = io('http://localhost:3001', {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });
            newSocket.on('teamsUpdate', (updatedTeams) => {
                console.log('Received teamsUpdate:', updatedTeams);
                const teamArray = Array.from(updatedTeams).map(([name, position]: [string, number]) => ({
                    name,
                    position,
                }));
                console.log('Processed team array:', teamArray);
                setTeams(teamArray);
            });
            newSocket.on('logsUpdate', (logData) => {
                console.log('Received logsUpdate:', logData);
                setLogs(logData);
            });
            newSocket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });
            newSocket.on('reconnect', (attempt) => {
                console.log('Reconnected after', attempt, 'attempts');
            });
            newSocket.on('disconnect', () => {
                console.log('Disconnected from WebSocket server');
            });

            return () => {
                newSocket.disconnect();
            };
        }, 500);

        return () => {
            clearTimeout(timer);
            if (socket) socket.disconnect();
        };
    }, []);

    const refreshData = () => {
        if (socket) {
            console.log('Requesting data refresh');
            socket.emit('requestTeams');
            socket.emit('requestLogs');
        }
    };

    const startBot = () => {
        console.log('Starting bot (placeholder)');
        if (socket) {
            socket.emit('startBot');
        }
    };

    const toggleTeamSort = () => {
        setPositionSort(null);
        setTeamSort(teamSort === 'desc' ? 'asc' : 'desc');
    };

    const togglePositionSort = () => {
        setTeamSort(null);
        setPositionSort(positionSort === 'desc' ? 'asc' : 'desc');
    };

    const sortedTeams = [...teams].sort((a, b) => {
        if (teamSort) {
            return teamSort === 'desc'
                ? b.name.localeCompare(a.name)
                : a.name.localeCompare(b.name);
        }
        if (positionSort) {
            return positionSort === 'desc'
                ? b.position - a.position
                : a.position - b.position;
        }
        return 0;
    });

    const filteredLogs = logs.filter((log) =>
        log.toLowerCase().includes(logFilter.toLowerCase())
    );

    console.log('Current teams state:', teams);
    console.log('Current logs state:', logs);

    return (
        <div className="app">
            <h1>Soulbane Tile Race 2025</h1>
            <div className="controls">
                <button onClick={startBot}>Start Bot</button>
                <button onClick={refreshData}>Refresh Data</button>
            </div>
            <div className="main-container">
                <div className="board">
                    {Array.from({ length: 10 }, (_, row) => (
                        <div key={row} className="row">
                            {Array.from({ length: 10 }, (_, col) => {
                                const tileNum = row * 10 + col + 1;
                                const isStart = tileNum === 1;
                                const isEnd = tileNum === 100;
                                return (
                                    <div
                                        key={tileNum}
                                        className={`tile ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
                                    >
                                        {tileNum}
                                        {teams
                                            .filter((team) => team.position === tileNum)
                                            .map((team) => (
                                                <div key={team.name} className="team-marker">
                                                    {team.name}
                                                </div>
                                            ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="team-list">
                    <h2>Team Positions</h2>
                    {sortedTeams.length > 0 ? (
                        <table className="team-table">
                            <thead>
                            <tr>
                                <th>
                                    <div className="header-content">
                                        Team Name
                                        <button onClick={toggleTeamSort} className="sort-btn">
                                            {teamSort === 'desc' ? '↓' : teamSort === 'asc' ? '↑' : '↕'}
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className="header-content">
                                        Position
                                        <button onClick={togglePositionSort} className="sort-btn">
                                            {positionSort === 'desc' ? '↓' : positionSort === 'asc' ? '↑' : '↕'}
                                        </button>
                                    </div>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedTeams.map((team) => (
                                <tr key={team.name}>
                                    <td>{team.name}</td>
                                    <td>{team.position}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No teams available.</p>
                    )}
                </div>
            </div>
            <div className="logs-section">
                <h2>Command Logs</h2>
                <div className="filters">
                    <input
                        type="text"
                        placeholder="Filter logs"
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value)}
                        style={{ margin: '5px', padding: '5px', width: '90%' }}
                    />
                </div>
                {filteredLogs.length > 0 ? (
                    <table className="logs-table">
                        <thead>
                        <tr>
                            <th>Log Entry</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredLogs.map((log, index) => (
                            <tr key={index}>
                                <td>{log}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No logs match the filter.</p>
                )}
            </div>
        </div>
    );
}

export default App;