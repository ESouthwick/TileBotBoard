import { useState, useEffect, useMemo } from 'react';
import { Box, CssBaseline, IconButton, ThemeProvider, createTheme, AppBar, Toolbar, Typography, ToggleButton, ToggleButtonGroup, useMediaQuery, Paper } from '@mui/material';
import './App.css';
import Board from './components/board';
import TeamTable from './components/table';
import Settings from './components/settings';
import {
    SpaceDashboard,
    TableChart,
    ViewModule,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import io from 'socket.io-client';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Create a default theme
const defaultTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
});

// Theme configuration function
const getTheme = (mode: 'light' | 'dark') => createTheme({
    palette: {
        mode,
        primary: mode === 'light' ? {
            main: '#1976d2',
        } : {
            main: '#90caf9',
        },
        background: mode === 'light' ? {
            default: '#f5f5f5',
            paper: '#ffffff',
        } : {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
});

type ViewMode = 'board' | 'table' | 'both';

interface TeamRoll {
    channelId: string;
    channelName: string;
    roll: number;
    timestamp: number;
}

interface TeamTileTime {
    channelId: string;
    position: number;
    time: number;
}

interface DiscordTeam {
    channelId: string;
    channelName: string;
    position: number;
}

function App() {
    const isMobile = useMediaQuery(defaultTheme.breakpoints.down('sm'));
    const [title, setTitle] = useState(() => {
        const savedTitle = localStorage.getItem('title');
        return savedTitle || 'Soulbane Tile Race 2025';
    });
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const savedViewMode = localStorage.getItem('viewMode');
        return (savedViewMode as ViewMode) || 'both';
    });
    const [teams, setTeams] = useState<DiscordTeam[]>(() => {
        const savedTeams = localStorage.getItem('teams');
        return savedTeams ? JSON.parse(savedTeams) : [];
    });
    const [finishedTeams, setFinishedTeams] = useState<string[]>(() => {
        const savedFinishedTeams = localStorage.getItem('finishedTeams');
        return savedFinishedTeams ? JSON.parse(savedFinishedTeams) : [];
    });
    const [teamSort, setTeamSort] = useState<'asc' | 'desc' | null>(() => {
        return localStorage.getItem('teamSort') as 'asc' | 'desc' | null || null;
    });
    const [positionSort, setPositionSort] = useState<'asc' | 'desc' | null>(() => {
        return localStorage.getItem('positionSort') as 'asc' | 'desc' | null || null;
    });
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [stops, setStops] = useState<number[]>(() => {
        const savedStops = localStorage.getItem('stops');
        return savedStops ? JSON.parse(savedStops) : [];
    });
    const [chutes, setChutes] = useState<{ position: number; distance: number }[]>(() => {
        const savedChutes = localStorage.getItem('chutes');
        return savedChutes ? JSON.parse(savedChutes) : [];
    });
    const [ladders, setLadders] = useState<{ position: number; distance: number }[]>(() => {
        const savedLadders = localStorage.getItem('ladders');
        return savedLadders ? JSON.parse(savedLadders) : [];
    });
    const [tileImages, setTileImages] = useState<{ position: number; image: string }[]>(() => {
        const savedTileImages = localStorage.getItem('tileImages');
        return savedTileImages ? JSON.parse(savedTileImages) : [];
    });
    const [teamRolls, setTeamRolls] = useState<{ [key: string]: number[] }>(() => {
        const savedRolls = localStorage.getItem('teamRolls');
        return savedRolls ? JSON.parse(savedRolls) : {};
    });
    const [teamTileTimes, setTeamTileTimes] = useState<{ [key: string]: { [key: number]: number } }>(() => {
        const savedTimes = localStorage.getItem('teamTileTimes');
        return savedTimes ? JSON.parse(savedTimes) : {};
    });
    const [teamTileStartTimes, setTeamTileStartTimes] = useState<{ [key: string]: number }>(() => {
        const savedStartTimes = localStorage.getItem('teamTileStartTimes');
        return savedStartTimes ? JSON.parse(savedStartTimes) : {};
    });
    const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [mode, setMode] = useState<'light' | 'dark'>('dark');
    const theme = useMemo(() => getTheme(mode), [mode]);

    // Load persisted data
    useEffect(() => {
        const loadPersistedData = () => {
            try {
                const savedTeams = localStorage.getItem('teams');
                const savedFinishedTeams = localStorage.getItem('finishedTeams');
                const savedTeamRolls = localStorage.getItem('teamRolls');
                const savedTeamTileTimes = localStorage.getItem('teamTileTimes');
                const savedTeamTileStartTimes = localStorage.getItem('teamTileStartTimes');

                if (savedTeams) {
                    const parsedTeams = JSON.parse(savedTeams);
                    console.log('Loading saved teams:', parsedTeams);
                    setTeams(parsedTeams);
                }
                if (savedFinishedTeams) {
                    const parsedFinishedTeams = JSON.parse(savedFinishedTeams);
                    console.log('Loading saved finished teams:', parsedFinishedTeams);
                    setFinishedTeams(parsedFinishedTeams);
                }
                if (savedTeamRolls) {
                    const parsedTeamRolls = JSON.parse(savedTeamRolls);
                    console.log('Loading saved team rolls:', parsedTeamRolls);
                    setTeamRolls(parsedTeamRolls);
                }
                if (savedTeamTileTimes) {
                    const parsedTeamTileTimes = JSON.parse(savedTeamTileTimes);
                    console.log('Loading saved team tile times:', parsedTeamTileTimes);
                    setTeamTileTimes(parsedTeamTileTimes);
                }
                if (savedTeamTileStartTimes) {
                    const parsedTeamTileStartTimes = JSON.parse(savedTeamTileStartTimes);
                    console.log('Loading saved team tile start times:', parsedTeamTileStartTimes);
                    setTeamTileStartTimes(parsedTeamTileStartTimes);
                }
            } catch (error) {
                console.error('Error loading persisted data:', error);
            }
        };

        loadPersistedData();
    }, []);

    // Save data changes to localStorage
    useEffect(() => {
        const saveData = () => {
            try {
                console.log('Saving teams:', teams);
                localStorage.setItem('teams', JSON.stringify(teams));
                console.log('Saving finished teams:', finishedTeams);
                localStorage.setItem('finishedTeams', JSON.stringify(finishedTeams));
                console.log('Saving team rolls:', teamRolls);
                localStorage.setItem('teamRolls', JSON.stringify(teamRolls));
                console.log('Saving team tile times:', teamTileTimes);
                localStorage.setItem('teamTileTimes', JSON.stringify(teamTileTimes));
                console.log('Saving team tile start times:', teamTileStartTimes);
                localStorage.setItem('teamTileStartTimes', JSON.stringify(teamTileStartTimes));
            } catch (error) {
                console.error('Error saving data:', error);
            }
        };

        saveData();
    }, [teams, finishedTeams, teamRolls, teamTileTimes, teamTileStartTimes]);

    useEffect(() => {
        const newSocket = io('http://localhost:3001', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
            autoConnect: true
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            // Request initial state when connected
            newSocket.emit('requestInitialState');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            const socket = newSocket as any;
            if (socket.io?.opts?.transports?.[0] === 'websocket') {
                socket.io.opts.transports = ['polling', 'websocket'];
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        newSocket.on('teamsUpdate', (updatedTeams: [string, number][]) => {
            console.log('Received teamsUpdate:', updatedTeams);
            setTeams(prevTeams => {
                const newTeams = updatedTeams.map(([channelId, position]) => {
                    const existingTeam = prevTeams.find(t => t.channelId === channelId);
                    return {
                        channelId,
                        channelName: existingTeam?.channelName || channelId,
                        position
                    };
                });
                console.log('Updated teams:', newTeams);
                return newTeams;
            });
        });

        newSocket.on('teamRoll', (data: { channelId: string; roll: number; newPosition: number }) => {
            console.log('Received teamRoll:', data);
            
            // Update team position
            setTeams(prevTeams => {
                const updatedTeams = prevTeams.map(team => 
                    team.channelId === data.channelId 
                        ? { ...team, position: data.newPosition }
                        : team
                );
                console.log('Updated teams after roll:', updatedTeams);
                return updatedTeams;
            });

            // Update team rolls
            setTeamRolls(prev => {
                const updatedRolls = {
                    ...prev,
                    [data.channelId]: [...(prev[data.channelId] || []), data.roll]
                };
                console.log('Updated team rolls:', updatedRolls);
                return updatedRolls;
            });
        });

        newSocket.on('teamName', (data: { channelId: string; channelName: string }) => {
            console.log('Received teamName:', data);
            setTeams(prevTeams => {
                const updatedTeams = prevTeams.map(team => 
                    team.channelId === data.channelId 
                        ? { ...team, channelName: data.channelName }
                        : team
                );
                console.log('Updated teams after name change:', updatedTeams);
                return updatedTeams;
            });
        });

        newSocket.on('teamTileTime', (timeData: TeamTileTime) => {
            console.log('Received teamTileTime:', timeData);
            setTeamTileTimes(prev => {
                const updatedTimes = {
                    ...prev,
                    [timeData.channelId]: {
                        ...(prev[timeData.channelId] || {}),
                        [timeData.position]: timeData.time
                    }
                };
                console.log('Updated team tile times:', updatedTimes);
                return updatedTimes;
            });
        });

        newSocket.on('teamTileStartTime', (timeData: TeamTileTime) => {
            console.log('Received teamTileStartTime:', timeData);
            setTeamTileStartTimes(prev => {
                const updatedTimes = {
                    ...prev,
                    [timeData.channelId]: {
                        ...(prev[timeData.channelId] || {}),
                        [timeData.position]: timeData.time
                    }
                };
                console.log('Updated team tile start times:', updatedTimes);
                return updatedTimes;
            });
        });

        newSocket.on('teamFinish', (data: { channelId: string }) => {
            console.log('Received teamFinish:', data);
            setFinishedTeams(prev => {
                const updatedFinishedTeams = [...prev, data.channelId];
                console.log('Updated finished teams:', updatedFinishedTeams);
                return updatedFinishedTeams;
            });
        });

        newSocket.on('initialState', (data: {
            teams: [string, number][];
            finishedTeams: string[];
            teamRolls: { [key: string]: number[] };
            teamTileTimes: { [key: string]: { [key: number]: number } };
            teamTileStartTimes: { [key: string]: { [key: number]: number } };
        }) => {
            console.log('Received initialState:', data);
            
            // Update teams
            const updatedTeams = data.teams.map(([channelId, position]) => ({
                channelId,
                channelName: channelId,
                position
            }));
            console.log('Setting initial teams:', updatedTeams);
            setTeams(updatedTeams);

            // Update other state
            console.log('Setting initial finished teams:', data.finishedTeams);
            setFinishedTeams(data.finishedTeams);
            
            console.log('Setting initial team rolls:', data.teamRolls);
            setTeamRolls(data.teamRolls);
            
            console.log('Setting initial team tile times:', data.teamTileTimes);
            setTeamTileTimes(data.teamTileTimes);
            
            console.log('Setting initial team tile start times:', data.teamTileStartTimes);
            setTeamTileStartTimes(data.teamTileStartTimes);
        });

        return () => {
            console.log('Cleaning up socket connection');
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('title', title);
        } catch (error) {
            console.warn('Failed to save title to localStorage:', error);
        }
    }, [title]);

    useEffect(() => {
        try {
            localStorage.setItem('viewMode', viewMode);
        } catch (error) {
            console.warn('Failed to save view mode to localStorage:', error);
        }
    }, [viewMode]);

    useEffect(() => {
        try {
            localStorage.setItem('teams', JSON.stringify(teams));
        } catch (error) {
            console.warn('Failed to save teams to localStorage:', error);
        }
    }, [teams]);

    useEffect(() => {
        try {
            localStorage.setItem('finishedTeams', JSON.stringify(finishedTeams));
        } catch (error) {
            console.warn('Failed to save finished teams to localStorage:', error);
        }
    }, [finishedTeams]);

    useEffect(() => {
        try {
            localStorage.setItem('teamSort', JSON.stringify(teamSort));
        } catch (error) {
            console.warn('Failed to save team sort to localStorage:', error);
        }
    }, [teamSort]);

    useEffect(() => {
        try {
            localStorage.setItem('positionSort', JSON.stringify(positionSort));
        } catch (error) {
            console.warn('Failed to save position sort to localStorage:', error);
        }
    }, [positionSort]);

    useEffect(() => {
        try {
            localStorage.setItem('stops', JSON.stringify(stops));
        } catch (error) {
            console.warn('Failed to save stops to localStorage:', error);
        }
    }, [stops]);

    useEffect(() => {
        try {
            localStorage.setItem('chutes', JSON.stringify(chutes));
        } catch (error) {
            console.warn('Failed to save chutes to localStorage:', error);
        }
    }, [chutes]);

    useEffect(() => {
        try {
            localStorage.setItem('ladders', JSON.stringify(ladders));
        } catch (error) {
            console.warn('Failed to save ladders to localStorage:', error);
        }
    }, [ladders]);

    useEffect(() => {
        try {
            localStorage.setItem('tileImages', JSON.stringify(tileImages));
        } catch (error) {
            console.warn('Failed to save tile images to localStorage:', error);
        }
    }, [tileImages]);

    const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newViewMode: ViewMode | null) => {
        if (newViewMode !== null) {
            setViewMode(newViewMode);
            try {
                localStorage.setItem('viewMode', newViewMode);
            } catch (error) {
                console.warn('Failed to save view mode to localStorage:', error);
            }
        }
    };

    const handleTeamSort = () => {
        const newSort = teamSort === 'asc' ? 'desc' : teamSort === 'desc' ? null : 'asc';
        setTeamSort(newSort);
        setPositionSort(null);
        try {
            localStorage.setItem('teamSort', newSort || '');
        } catch (error) {
            console.warn('Failed to save team sort to localStorage:', error);
        }
    };

    const handlePositionSort = () => {
        const newSort = positionSort === 'asc' ? 'desc' : positionSort === 'desc' ? null : 'asc';
        setPositionSort(newSort);
        setTeamSort(null);
        try {
            localStorage.setItem('positionSort', newSort || '');
        } catch (error) {
            console.warn('Failed to save position sort to localStorage:', error);
        }
    };

    const sortedTeams = [...teams].sort((a, b) => {
        if (teamSort) {
            if (!a.channelName || !b.channelName) return 0;
            return teamSort === 'desc' 
                ? b.channelName.localeCompare(a.channelName) 
                : a.channelName.localeCompare(b.channelName);
        }
        if (positionSort) {
            if (typeof a.position !== 'number' || typeof b.position !== 'number') return 0;
            return positionSort === 'desc' 
                ? b.position - a.position 
                : a.position - b.position;
        }
        return 0;
    });

    // Force single view on mobile
    useEffect(() => {
        if (isMobile && viewMode === 'both') {
            setViewMode('board');
        }
    }, [isMobile, viewMode]);

    const handleTeamMove = (channelId: string, newPosition: number) => {
        setTeams(prevTeams => 
            prevTeams.map(team => 
                team.channelId === channelId 
                    ? { ...team, position: newPosition }
                    : team
            )
        );
    };

    const handleTeamFinish = (channelId: string) => {
        setFinishedTeams(prev => [...prev, channelId]);
    };

    const toggleColorMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100vh',
                width: '100vw',
                overflow: 'hidden'
            }}>
                <AppBar position="static" sx={{ width: '100%' }}>
                    <Toolbar sx={{ 
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: { xs: 1, sm: 2 }
                    }}>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                flexGrow: 1,
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton 
                                onClick={toggleColorMode} 
                                color="inherit"
                                sx={{ mr: 1 }}
                            >
                                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                            <IconButton 
                                onClick={() => setSettingsOpen(true)} 
                                color="inherit"
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                {!isMobile && (
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            py: 1,
                            backgroundColor: 'background.paper'
                        }}
                    >
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            aria-label="view mode"
                            size="small"
                            color="primary"
                        >
                            <ToggleButton value="board" aria-label="board view">
                                <SpaceDashboard />
                            </ToggleButton>
                            <ToggleButton value="table" aria-label="table view">
                                <TableChart />
                            </ToggleButton>
                            <ToggleButton value="both" aria-label="both views">
                                <ViewModule />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Paper>
                )}

                <Box sx={{ 
                    flexGrow: 1, 
                    p: { xs: 1, sm: 2 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: 2,
                    width: '100%',
                    overflow: 'auto',
                    boxSizing: 'border-box',
                    position: 'relative',
                    pb: isMobile ? '60px' : 0
                }}>
                    <Box sx={{ 
                        display: 'flex',
                        gap: 2,
                        flexDirection: viewMode === 'both' ? 'row' : 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: viewMode === 'both' ? '1800px' : '900px',
                        height: '100%'
                    }}>
                        {(viewMode === 'board' || viewMode === 'both') && (
                            <Box sx={{ 
                                flex: viewMode === 'both' ? 1 : 'none',
                                minWidth: viewMode === 'both' ? 0 : 'auto',
                                width: '100%',
                                height: '100%',
                                position: 'relative'
                            }}>
                                <Board
                                    teams={teams}
                                    finishedTeams={finishedTeams}
                                    stops={stops}
                                    chutes={chutes}
                                    ladders={ladders}
                                    tileImages={tileImages}
                                    onTeamMove={handleTeamMove}
                                    onTeamFinish={handleTeamFinish}
                                />
                            </Box>
                        )}
                        {(viewMode === 'table' || viewMode === 'both') && (
                            <Box sx={{ 
                                flex: viewMode === 'both' ? 1 : 'none',
                                minWidth: viewMode === 'both' ? 0 : 'auto',
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                overflow: 'auto'
                            }}>
                                <TeamTable
                                    teams={sortedTeams}
                                    finishedTeams={finishedTeams}
                                    teamSort={teamSort}
                                    positionSort={positionSort}
                                    onTeamSort={handleTeamSort}
                                    onPositionSort={handlePositionSort}
                                    teamRolls={teamRolls}
                                    teamTileTimes={teamTileTimes}
                                    teamTileStartTimes={teamTileStartTimes}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>

                {isMobile && (
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            py: 1,
                            backgroundColor: 'background.paper',
                            zIndex: 1000
                        }}
                    >
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            aria-label="view mode"
                            size="small"
                            color="primary"
                        >
                            <ToggleButton value="board" aria-label="board view">
                                <SpaceDashboard />
                            </ToggleButton>
                            <ToggleButton value="table" aria-label="table view">
                                <TableChart />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Paper>
                )}

                <Settings
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    title={title}
                    setTitle={setTitle}
                    stops={stops}
                    setStops={setStops}
                    chutes={chutes}
                    setChutes={setChutes}
                    ladders={ladders}
                    setLadders={setLadders}
                    tileImages={tileImages}
                    setTileImages={setTileImages}
                />
            </Box>
        </ThemeProvider>
    );
}

export default App;