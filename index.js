// index.js
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set. Please set it to your MongoDB connection string.');
    process.exit(1);
}

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB with Mongoose');
}).catch(error => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});
const express = require('express');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// Connect to MongoDB using mongoose
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB with Mongoose');
}).catch(console.error);

// Load commands
const commandFiles = fs.readdirSync('./Functions/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./Functions/commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Register slash commands
    const commands = client.commands.map(command => command.data.toJSON());
    try {
        await client.application.commands.set(commands);
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

const app = express();
const PORT = process.env.PORT || 10000;

// Simple health check endpoint for web service compatibility
app.get('/', (req, res) => {
    res.send('Discord bot is running');
});

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
