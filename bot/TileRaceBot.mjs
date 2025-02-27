import { Client, ApplicationCommandType, ApplicationCommandOptionType, REST, Routes, IntentsBitField } from 'discord.js';
import { config } from 'dotenv';
import { io } from './server.js'; // Adjust the path if server.js is in a different directory

config();
const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages], // Required for message and guild access
});

export const teams = new Map(); // Store team positions: { teamName: position }
const logs = []; // Store detailed roll logs: { action, teamName, newName, position, timestamp, user, channel }

// Define slash commands (unchanged, but included for completeness)
const commands = [
    {
        name: 'create-team',
        description: 'Create a new team for the tile race',
        options: [
            {
                name: 'teamname',
                description: 'The name of the team',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    {
        name: 'roll',
        description: 'Roll a 6-sided die for a team to move forward',
    },
    {
        name: 'edit-team',
        description: 'Manually set a team\'s position',
        options: [
            {
                name: 'teamname',
                description: 'The name of the team',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'position',
                description: 'The position to set (1-100)',
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
    {
        name: 'edit-team-name',
        description: 'Rename a Team',
        options: [
            {
                name: 'teamname',
                description: 'The name of the team',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'newteamname',
                description: 'The new name of the team',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'position',
                description: 'The position to set (1-100)',
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
    {
        name: 'delete-team',
        description: 'Delete a team from the race',
        options: [
            {
                name: 'teamname',
                description: 'The name of the team',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    {
        name: 'logs',
        description: 'View the roll logs for all teams',
    },
];

client.once('ready', () => {
    console.log('Bot is ready!');

    // Register slash commands globally (or for a specific guild during development)
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            await rest.put(
                Routes.applicationCommands(client.user.id), // Global commands
                // OR for a specific guild: Routes.applicationGuildCommands(client.user.id, 'YOUR_GUILD_ID'),
                { body: commands }
            );
            console.log('Slash commands registered successfully.');
        } catch (error) {
            console.error('Error registering slash commands:', error);
        }
    })();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return; // Ensure it's a slash command

    const { commandName, options } = interaction;
    const user = interaction.user.tag; // Get the user who invoked the command (e.g., "User#1234")
    const channel = interaction.channel.name; // Get the channel name

    try {
        if (commandName === 'roll') {
            // Use the channel name as the team name
            const teamName = interaction.channel.name;
            if (!teams.has(teamName)) {
                await interaction.reply(`Team ${teamName} doesn't exist. Use /create-team to create it.`);
            }
            const roll = Math.floor(Math.random() * 6) + 1; // Roll a 6-sided die
            let currentPosition = teams.get(teamName);
            const newPosition = Math.min(100, currentPosition + roll); // Cap at 100
            teams.set(teamName, newPosition);
            await interaction.reply(
                `${teamName} rolled a ${roll}! New position: ${newPosition} (was at ${currentPosition})`
            );
            broadcastUpdate();
            // Log the successful command execution
            logs.push({
                action: 'command_executed',
                teamName,
                position: newPosition,
                timestamp: new Date().toISOString(),
                user,
                channel,
                details: `Roll command completed for ${teamName}`,
            });
        }

        // Admin-only commands (check for "Admin" role)
        // if (interaction.member.roles.cache.some(role => role.name === 'Admin')) {
        if (commandName === 'create-team') {
            const teamName = options.getString('teamname');
            if (teams.has(teamName)) {
                await interaction.reply(`Team ${teamName} already exists!`);
            } else {
                teams.set(teamName, 1); // Start at position 1
                await interaction.reply(`Created team ${teamName} at position 1.`);
                broadcastUpdate();
                // Log the successful command execution
                logs.push({
                    action: 'command_executed',
                    teamName,
                    position: 1,
                    timestamp: new Date().toISOString(),
                    user,
                    channel,
                    details: `Created team ${teamName} at position 1`,
                });
            }
        }

        if (commandName === 'edit-team') {
            const teamName = options.getString('teamname');
            const position = options.getInteger('position');
            if (!teams.has(teamName)) {
                await interaction.reply(`Team ${teamName} doesn't exist.`);
            } else if (position < 1 || position > 100) {
                await interaction.reply('Position must be between 1 and 100.');
            } else {
                teams.set(teamName, position);
                await interaction.reply(`Updated ${teamName} to position ${position}.`);
                broadcastUpdate();
                // Log the successful command execution
                logs.push({
                    action: 'command_executed',
                    teamName,
                    position,
                    timestamp: new Date().toISOString(),
                    user,
                    channel,
                    details: `Updated ${teamName} to position ${position}`,
                });
            }
        }

        if (commandName === 'edit-team-name') {
            const teamName = options.getString('teamname');
            const newTeamName = options.getString('newteamname');
            const position = options.getInteger('position');

            if (!teams.has(teamName)) {
                await interaction.reply(`Team ${teamName} doesn't exist.`);
            } else {
                teams.delete(teamName);
                teams.set(newTeamName, position);
                await interaction.reply(`Updated ${teamName} to ${newTeamName} at position: ${position}.`);
                broadcastUpdate();
                // Log the successful command execution
                logs.push({
                    action: 'command_executed',
                    teamName: newTeamName,
                    position,
                    timestamp: new Date().toISOString(),
                    user,
                    channel,
                    details: `Renamed ${teamName} to ${newTeamName} at position ${position}`,
                });
            }
        }

        if (commandName === 'delete-team') {
            const teamName = options.getString('teamname');
            if (!teams.has(teamName)) {
                await interaction.reply(`Team ${teamName} doesn't exist.`);
            } else {
                teams.delete(teamName);
                await interaction.reply(`Deleted team ${teamName}.`);
                broadcastUpdate();
                // Log the successful command execution
                logs.push({
                    action: 'command_executed',
                    teamName,
                    position: null,
                    timestamp: new Date().toISOString(),
                    user,
                    channel,
                    details: `Deleted team ${teamName}`,
                });
            }
        }

        if (commandName === 'logs') {
            const logMessage = logs
                .map((log) => {
                    let message = `[${log.timestamp}] `;
                    if (log.action === 'command_executed') {
                        message += `${log.user} in #${log.channel} - ${log.details}`;
                    } else if (log.action === 'roll' || log.action === 'edit_team' || log.action === 'edit_team_name' || log.action === 'delete_team') {
                        message += `${log.user} in #${log.channel} - ${log.action.replace('_', ' ')} for ${log.teamName}`;
                        if (log.position !== null) message += ` to position ${log.position}`;
                    } else if (log.action.endsWith('_failed')) {
                        message += `${log.user} in #${log.channel} - Failed to ${log.action.replace('_failed', '')} for ${log.teamName}`;
                        if (log.position !== null) message += ` (position: ${log.position})`;
                    }
                    return message;
                })
                .join('\n') || 'No logs available.';
            await interaction.reply(logMessage.length > 2000 ? logMessage.substring(0, 1997) + '...' : logMessage);
        }
        // } else {
        //     // If a non-admin tries to use an admin command, reply with an error
        //     if (['create-team', 'edit-team', 'edit-team-name', 'delete-team', 'logs'].includes(commandName)) {
        //         await interaction.reply('You need the "Admin" role to use this command.');
        //     }
        // }
    } catch (error) {
        console.error('Error handling interaction:', error);
        await interaction.reply('An error occurred while processing your command.');
    }
});

// Function to broadcast updates to the website (e.g., via WebSocket)
function broadcastUpdate() {
    const teamsArray = Array.from(teams.entries());
    console.log('Broadcasting updateTeams:', teamsArray);
    io.emit('updateTeams', teamsArray);
    console.log('Emit completed'); // Confirm emit runs
}

client.login(process.env.TOKEN); // Use environment variable for token