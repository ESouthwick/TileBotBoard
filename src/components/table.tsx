import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';

interface TeamTableProps {
    teams: {
        channelId: string;
        channelName: string;
        position: number;
    }[];
    finishedTeams: string[];
    teamSort: 'asc' | 'desc' | null;
    positionSort: 'asc' | 'desc' | null;
    onTeamSort: () => void;
    onPositionSort: () => void;
    teamRolls: { [key: string]: number[] };
    teamTileTimes: { [key: string]: { [key: number]: number } };
    teamTileStartTimes: { [key: string]: number };
}

const TeamTable: React.FC<TeamTableProps> = ({
    teams,
    finishedTeams,
    teamSort,
    positionSort,
    onTeamSort,
    onPositionSort,
    teamRolls,
    teamTileTimes,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getTeamStats = (channelName: string) => {
        const rolls = teamRolls[channelName] || [];
        const totalRolls = rolls.length;
        const averageRoll = totalRolls > 0
            ? (rolls.reduce((sum, roll) => sum + roll, 0) / totalRolls).toFixed(1)
            : '0.0';

        const tileTimes = teamTileTimes[channelName] || {};
        const totalTime = Object.values(tileTimes).reduce((sum, time) => sum + time, 0);
        const averageTime = Object.keys(tileTimes).length > 0
            ? (totalTime / Object.keys(tileTimes).length).toFixed(1)
            : '0.0';

        return {
            totalRolls,
            averageRoll,
            averageTime: `${averageTime}h`,
        };
    };

    return (
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
                <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                onClick={onTeamSort}
                                sx={{
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                            >
                                Team {teamSort === 'asc' ? '↑' : teamSort === 'desc' ? '↓' : ''}
                            </TableCell>
                            <TableCell
                                onClick={onPositionSort}
                                sx={{
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                            >
                                Position {positionSort === 'asc' ? '↑' : positionSort === 'desc' ? '↓' : ''}
                            </TableCell>
                            <TableCell>Total Rolls</TableCell>
                            <TableCell>Average Roll</TableCell>
                            <TableCell>Average Time/Tile</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.map((team) => {
                            const stats = getTeamStats(team.channelName);
                            return (
                                <TableRow
                                    key={team.channelId}
                                    sx={{
                                        bgcolor: finishedTeams.includes(team.channelName)
                                            ? 'success.dark'
                                            : 'inherit',
                                    }}
                                >
                                    <TableCell>{team.channelName}</TableCell>
                                    <TableCell>{team.position}</TableCell>
                                    <TableCell>{stats.totalRolls}</TableCell>
                                    <TableCell>{stats.averageRoll}</TableCell>
                                    <TableCell>{stats.averageTime}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TeamTable;