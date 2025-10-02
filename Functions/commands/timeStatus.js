const { SlashCommandBuilder } = require('discord.js');
const TimeLog = require('../models/timeLog');
const Staff = require('../models/staff');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timestatus')
        .setDescription('Show current clock-in status for a staff member')
        .addUserOption(option => option.setName('user').setDescription('Staff member').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const user = interaction.options.getUser('user');

        try {
            const staff = await Staff.findOne({ userId: user.id });
            if (!staff) {
                return interaction.editReply({ content: 'User is not a staff member.', ephemeral: true });
            }

            const timeLog = await TimeLog.findOne({ staffId: user.id, clockOut: null }).sort({ clockIn: -1 });
            if (!timeLog) {
                return interaction.editReply(`${user.username} is currently not clocked in.`);
            }

            const clockInTime = timeLog.clockIn.toLocaleString();
            return interaction.editReply(`${user.username} is currently clocked in since ${clockInTime}.`);
        } catch (error) {
            console.error('Error fetching time status:', error);
            return interaction.editReply({ content: 'Error fetching time status.', ephemeral: true });
        }
    }
};
