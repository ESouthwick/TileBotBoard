import React, { useState } from 'react';

interface BoardInputProps {
    teams: { name: string; position: number }[];
    setTeams: React.Dispatch<React.SetStateAction<{ name: string; position: number }[]>>;
}

const BoardInput: React.FC<BoardInputProps> = ({ teams, setTeams }) => {
    const [teamName, setTeamName] = useState('');
    const [position, setPosition] = useState<number | ''>('');

    const handleAddOrUpdateTeam = () => {
        if (!teamName || position === '' || position < 1 || position > 100) {
            alert('Please enter a valid team name and position (1-100).');
            return;
        }

        const existingTeamIndex = teams.findIndex((team) => team.name === teamName);
        if (existingTeamIndex !== -1) {
            // Update existing team
            const updatedTeams = [...teams];
            updatedTeams[existingTeamIndex].position = Number(position);
            setTeams(updatedTeams);
        } else {
            // Add new team
            setTeams([...teams, { name: teamName, position: Number(position) }]);
        }

        // Clear inputs
        setTeamName('');
        setPosition('');
    };

    return (
        <div className="input-section">
            <h2>Manage Teams</h2>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    style={{ margin: '5px', padding: '5px', width: '200px' }}
                />
                <input
                    type="number"
                    placeholder="Position (1-100)"
                    value={position}
                    onChange={(e) => setPosition(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    max="100"
                    style={{ margin: '5px', padding: '5px', width: '150px' }}
                />
                <button
                    onClick={handleAddOrUpdateTeam}
                    style={{ margin: '5px', padding: '5px 10px' }}
                >
                    Add/Update Team
                </button>
            </div>
        </div>
    );
};

export default BoardInput;