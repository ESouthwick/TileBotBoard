import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SettingsProps {
    open: boolean;
    onClose: () => void;
    stops: number[];
    setStops: React.Dispatch<React.SetStateAction<number[]>>;
    chutes: { position: number; distance: number }[];
    setChutes: React.Dispatch<React.SetStateAction<{ position: number; distance: number }[]>>;
    ladders: { position: number; distance: number }[];
    setLadders: React.Dispatch<React.SetStateAction<{ position: number; distance: number }[]>>;
    tileImages: { position: number; image: string }[];
    setTileImages: React.Dispatch<React.SetStateAction<{ position: number; image: string }[]>>;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
}

const Settings: React.FC<SettingsProps> = ({
    open,
    onClose,
    stops = [],
    setStops,
    chutes = [],
    setChutes,
    ladders = [],
    setLadders,
    tileImages = [],
    setTileImages,
    title,
    setTitle,
}) => {
    const [newStop, setNewStop] = useState('');
    const [newChute, setNewChute] = useState({ position: '', distance: '' });
    const [newLadder, setNewLadder] = useState({ position: '', distance: '' });
    const [selectedTile, setSelectedTile] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddStop = () => {
        const position = parseInt(newStop);
        if (!isNaN(position) && position >= 1 && position <= 100 && !stops.includes(position)) {
            setStops([...stops, position].sort((a, b) => a - b));
            setNewStop('');
        }
    };

    const handleRemoveStop = (position: number) => {
        setStops(stops.filter(stop => stop !== position));
    };

    const handleAddChute = () => {
        const position = parseInt(newChute.position);
        const distance = parseInt(newChute.distance);
        if (!isNaN(position) && !isNaN(distance) && position >= 1 && position <= 100 && distance > 0) {
            setChutes([...chutes, { position, distance }].sort((a, b) => a.position - b.position));
            setNewChute({ position: '', distance: '' });
        }
    };

    const handleRemoveChute = (position: number) => {
        setChutes(chutes.filter(chute => chute.position !== position));
    };

    const handleAddLadder = () => {
        const position = parseInt(newLadder.position);
        const distance = parseInt(newLadder.distance);
        if (!isNaN(position) && !isNaN(distance) && position >= 1 && position <= 100 && distance > 0) {
            setLadders([...ladders, { position, distance }].sort((a, b) => a.position - b.position));
            setNewLadder({ position: '', distance: '' });
        }
    };

    const handleRemoveLadder = (position: number) => {
        setLadders(ladders.filter(ladder => ladder.position !== position));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedTile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target?.result as string;
                setTileImages(prev => {
                    const existing = prev.find(ti => ti.position === selectedTile);
                    if (existing) {
                        return prev.map(ti => ti.position === selectedTile ? { ...ti, image: imageData } : ti);
                    }
                    return [...prev, { position: selectedTile, image: imageData }];
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (position: number) => {
        setTileImages(tileImages.filter(ti => ti.position !== position));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>General Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Game Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    fullWidth
                                />
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Chutes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        label="Position"
                                        type="number"
                                        value={newChute.position}
                                        onChange={(e) => setNewChute({ ...newChute, position: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        label="Distance"
                                        type="number"
                                        value={newChute.distance}
                                        onChange={(e) => setNewChute({ ...newChute, distance: e.target.value })}
                                        size="small"
                                    />
                                    <Button variant="contained" onClick={handleAddChute}>
                                        Add Chute
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        onClick={() => setChutes([])}
                                        disabled={!chutes || chutes.length === 0}
                                    >
                                        Delete All Chutes
                                    </Button>
                                </Box>
                                <List>
                                    {chutes && chutes.map((chute) => (
                                        <ListItem key={chute.position}>
                                            <ListItemText primary={`Position ${chute.position} (-${chute.distance})`} />
                                            <IconButton onClick={() => handleRemoveChute(chute.position)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Ladders</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        label="Position"
                                        type="number"
                                        value={newLadder.position}
                                        onChange={(e) => setNewLadder({ ...newLadder, position: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        label="Distance"
                                        type="number"
                                        value={newLadder.distance}
                                        onChange={(e) => setNewLadder({ ...newLadder, distance: e.target.value })}
                                        size="small"
                                    />
                                    <Button variant="contained" onClick={handleAddLadder}>
                                        Add Ladder
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        onClick={() => setLadders([])}
                                        disabled={!ladders || ladders.length === 0}
                                    >
                                        Delete All Ladders
                                    </Button>
                                </Box>
                                <List>
                                    {ladders && ladders.map((ladder) => (
                                        <ListItem key={ladder.position}>
                                            <ListItemText primary={`Position ${ladder.position} (+${ladder.distance})`} />
                                            <IconButton onClick={() => handleRemoveLadder(ladder.position)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Stops</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        label="Position"
                                        type="number"
                                        value={newStop}
                                        onChange={(e) => setNewStop(e.target.value)}
                                        size="small"
                                    />
                                    <Button variant="contained" onClick={handleAddStop}>
                                        Add Stop
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        onClick={() => setStops([])}
                                        disabled={!stops || stops.length === 0}
                                    >
                                        Delete All Stops
                                    </Button>
                                </Box>
                                <List>
                                    {stops && stops.map((stop) => (
                                        <ListItem key={stop}>
                                            <ListItemText primary={`Position ${stop}`} />
                                            <IconButton onClick={() => handleRemoveStop(stop)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Tile Images</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        label="Tile Position"
                                        type="number"
                                        value={selectedTile || ''}
                                        onChange={(e) => setSelectedTile(parseInt(e.target.value) || null)}
                                        size="small"
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={!selectedTile}
                                    >
                                        Upload Image
                                    </Button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                    />
                                </Box>
                                <List>
                                    {tileImages && tileImages.map((tileImage) => (
                                        <ListItem key={tileImage.position}>
                                            <ListItemText primary={`Tile ${tileImage.position}`} />
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <img
                                                    src={tileImage.image}
                                                    alt={`Tile ${tileImage.position}`}
                                                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                                                />
                                                <IconButton onClick={() => handleRemoveImage(tileImage.position)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default Settings; 