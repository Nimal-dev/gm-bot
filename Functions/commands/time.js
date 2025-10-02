const { SlashCommandBuilder } = require('discord.js');
const TimeLog = require('../models/timeLog');
const Staff = require('../models/staff');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('time')
        .setDescription('Clock in and out for staff')
        .addSubcommand(subcommand =>
            subcommand
                .setName('in')
                .setDescription('Clock in')
                .addUserOption(option => option.setName('user').setDescription('Staff member').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('out')
                .setDescription('Clock out')
                .addUserOption(option => option.setName('user').setDescription('Staff member').setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');

        try {
            const staff = await Staff.findOne({ userId: user.id });
            if (!staff) {
                return interaction.reply({ content: 'User is not a staff member.', ephemeral: true });
            }

            if (subcommand === 'in') {
                // Check if already clocked in without clock out
                const existingLog = await TimeLog.findOne({ staffId: user.id, clockOut: null });
                if (existingLog) {
                    return interaction.reply({ content: `${user.username} is already clocked in.`, ephemeral: true });
                }
                const timeLog = new TimeLog({
                    staffId: user.id,
                    clockIn: new Date()
                });
                await timeLog.save();
                return interaction.reply(`${user.username} clocked in.`);
            } else if (subcommand === 'out') {
                // Find the latest clock in without clock out
                const timeLog = await TimeLog.findOne({ staffId: user.id, clockOut: null }).sort({ clockIn: -1 });
                if (!timeLog) {
                    return interaction.reply({ content: `${user.username} is not currently clocked in.`, ephemeral: true });
                }
                timeLog.clockOut = new Date();
                const diffMs = timeLog.clockOut - timeLog.clockIn;
                timeLog.totalHours = diffMs / (1000 * 60 * 60);
                await timeLog.save();
                return interaction.reply(`${user.username} clocked out. Total hours: ${timeLog.totalHours.toFixed(2)}`);
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Error processing time log.', ephemeral: true });
        }
    }
};
