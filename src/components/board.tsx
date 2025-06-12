import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Image, Circle } from 'react-konva';
import { useMediaQuery, useTheme } from '@mui/material';
import useWindowSize from '../hooks/useWindowSize';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, CircularProgress } from '@mui/material';
import { Button } from '@mui/material';

interface BoardProps {
    teams: {
        channelId: string;
        channelName: string;
        position: number;
    }[];
    finishedTeams: string[];
    stops: number[];
    chutes: { position: number; distance: number }[];
    ladders: { position: number; distance: number }[];
    tileImages: { position: number; image: string }[];
    onTeamMove: (channelName: string, newPosition: number) => void;
    onTeamFinish: (channelName: string) => void;
}

const Board: React.FC<BoardProps> = ({
    teams,
    finishedTeams,
    stops,
    chutes,
    ladders,
    tileImages,
    onTeamMove,
    onTeamFinish
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { width, height } = useWindowSize();
    const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [editingTeam, setEditingTeam] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editPosition, setEditPosition] = useState<number | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<{ channelId: string; channelName: string; position: number } | null>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const [boardSize, setBoardSize] = useState({ width: 800, height: 800 });
    const [scale, setScale] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

    // Calculate board dimensions
    const tileSize = Math.min(width * 0.8 / 10, height * 0.8 / 10);
    const boardWidth = tileSize * 10;
    const boardHeight = tileSize * 10;

    // Load images
    useEffect(() => {
        const loadImages = async () => {
            setIsLoading(true);
            const loadedImages: { [key: string]: HTMLImageElement } = {};
            
            for (const tile of tileImages) {
                if (tile.image) {
                    const img = new window.Image();
                    img.src = tile.image;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });
                    loadedImages[tile.position.toString()] = img;
                }
            }
            
            setImages(loadedImages);
            setIsLoading(false);
        };

        loadImages().catch(console.error);
    }, [tileImages]);

    // Update board size
    useEffect(() => {
        const updateBoardSize = () => {
            if (boardRef.current) {
                const containerWidth = boardRef.current.offsetWidth;
                const containerHeight = boardRef.current.offsetHeight;
                const newWidth = Math.max(containerWidth, 800);
                const newHeight = Math.max(containerHeight, 800);
                setBoardSize({ width: newWidth, height: newHeight });
                
                // Center the stage
                setStagePosition({
                    x: (newWidth - boardWidth) / 2,
                    y: (newHeight - boardHeight) / 2
                });
            }
        };

        updateBoardSize();
        window.addEventListener('resize', updateBoardSize);
        return () => window.removeEventListener('resize', updateBoardSize);
    }, [width, height, boardWidth, boardHeight]);

    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        setScale(newScale);
    };

    const handleDragEnd = (e: any) => {
        setStagePosition({
            x: e.target.x(),
            y: e.target.y()
        });
    };

    const getTilePosition = (position: number) => {
        const row = Math.floor((position - 1) / 10);
        const col = (position - 1) % 10;
        const x = (row % 2 === 0 ? col : 9 - col) * tileSize;
        const y = (9 - row) * tileSize;
        return { x, y };
    };

    const handleTeamClick = (team: { channelId: string; channelName: string; position: number }) => {
        setSelectedTeam(team);
        setEditName(team.channelName);
        setEditPosition(team.position);
        setEditDialogOpen(true);
    };

    const handleEditSave = () => {
        if (selectedTeam && editPosition !== null) {
            onTeamMove(selectedTeam.channelId, editPosition);
            setEditDialogOpen(false);
            setSelectedTeam(null);
            setEditName('');
            setEditPosition(null);
        }
    };

    const handleEditCancel = () => {
        setEditDialogOpen(false);
        setSelectedTeam(null);
        setEditName('');
        setEditPosition(null);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditName(e.target.value);
    };

    const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPosition = parseInt(e.target.value);
        if (!isNaN(newPosition) && newPosition >= 1 && newPosition <= 100) {
            setEditPosition(newPosition);
        }
    };

        return (
        <>
            <div ref={boardRef} style={{ 
                width: '100%', 
                height: '100%', 
                    position: 'relative',
                backgroundColor: theme.palette.background.default
            }}>
                {isLoading ? (
                    <Box sx={{ 
                    display: 'flex',
                        justifyContent: 'center', 
                    alignItems: 'center',
                        height: '100%' 
                    }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stage
                        width={boardSize.width}
                        height={boardSize.height}
                        scaleX={scale}
                        scaleY={scale}
                        x={stagePosition.x}
                        y={stagePosition.y}
                        draggable
                        onWheel={handleWheel}
                        onDragEnd={handleDragEnd}
                    >
                        <Layer>
                            {/* Background */}
                            <Rect
                                width={boardSize.width}
                                height={boardSize.height}
                                fill={theme.palette.background.paper}
                            />

                            {/* Tiles */}
                            {Array.from({ length: 100 }, (_, i) => {
                                const position = i + 1;
                                const { x, y } = getTilePosition(position);
                                const image = images[position.toString()];
                                const isStop = stops.includes(position);
                                const chute = chutes.find(c => c.position === position);
                                const ladder = ladders.find(l => l.position === position);
                                
                                return (
                                    <Group key={`tile-${position}`} x={x} y={y}>
                                        <Rect
                                            width={tileSize}
                                            height={tileSize}
                                            fill={isStop ? theme.palette.error.main : theme.palette.background.default}
                                            stroke={theme.palette.divider}
                                            strokeWidth={1}
                                        />
                                        {image && (
                                            <Image
                                                image={image}
                                                width={tileSize}
                                                height={tileSize}
                                            />
                                        )}
                                        <Text
                                            text={position.toString()}
                                            fontSize={tileSize / 4}
                                            fill={theme.palette.text.primary}
                                            align="center"
                                            verticalAlign="middle"
                                            width={tileSize}
                                            height={tileSize}
                                        />
                                        {isStop && (
                                            <Text
                                                text="STOP"
                                                fontSize={tileSize / 4}
                                                fill={theme.palette.error.contrastText}
                                                align="center"
                                                verticalAlign="middle"
                                                width={tileSize}
                                                height={tileSize}
                                                y={tileSize / 2}
                                            />
                                        )}
                                        {chute && (
                                            <Text
                                                text={`CHUTES\n-${chute.distance}`}
                                                fontSize={tileSize / 4}
                                                fill={theme.palette.error.main}
                                                align="center"
                                                verticalAlign="middle"
                                                width={tileSize}
                                                height={tileSize}
                                                y={tileSize / 2}
                                            />
                )}
                {ladder && (
                                            <Text
                                                text={`LADDERS\n+${ladder.distance}`}
                                                fontSize={tileSize / 4}
                                                fill={theme.palette.success.main}
                                                align="center"
                                                verticalAlign="middle"
                                                width={tileSize}
                                                height={tileSize}
                                                y={tileSize / 2}
                                            />
                                        )}
                                    </Group>
                                );
                            })}

                            {/* Teams */}
                            {teams.map(team => {
                                const tile = getTilePosition(team.position);
                                if (!tile) return null;

                                const isFinished = finishedTeams.includes(team.channelId);
                                const teamColor = isFinished ? theme.palette.error.main : theme.palette.success.main;
                                const markerSize = Math.min(tileSize * 0.3, 30);
                                const markerOffset = markerSize * 0.2;

    return (
                                    <Group
                                        key={`team-${team.channelId}`}
                                        x={tile.x + (tileSize / 2)}
                                        y={tile.y + (tileSize / 2)}
                                        onClick={() => handleTeamClick(team)}
                                        onTap={() => handleTeamClick(team)}
                                    >
                                        <Circle
                                            radius={markerSize / 2}
                                            fill={teamColor}
                                            stroke={theme.palette.common.white}
                                            strokeWidth={2}
                                            shadowColor="black"
                                            shadowBlur={5}
                                            shadowOpacity={0.3}
                                            shadowOffset={{ x: 2, y: 2 }}
                                        />
                                        <Text
                                            text={team.channelName}
                                            fontSize={markerSize * 0.4}
                                            fill={theme.palette.common.white}
                                            align="center"
                                            width={markerSize * 2}
                                            x={-markerSize}
                                            y={markerSize / 2}
                                            shadowColor="black"
                                            shadowBlur={3}
                                            shadowOpacity={0.5}
                                            shadowOffset={{ x: 1, y: 1 }}
                                        />
                                    </Group>
                                );
                    })}
                </Layer>
            </Stage>
                )}
            </div>

            <Dialog 
                open={editDialogOpen} 
                onClose={handleEditCancel}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Edit Team</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Team Name"
                            value={editName}
                            onChange={handleNameChange}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Position"
                            type="number"
                            value={editPosition}
                            onChange={handlePositionChange}
                            fullWidth
                        size="small"
                            inputProps={{ min: 1, max: 100 }}
                        />
            </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditCancel}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Board;