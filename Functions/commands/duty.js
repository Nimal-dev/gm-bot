const { SlashCommandBuilder } = require('discord.js');
const DutyLog = require('../models/dutyLog');
const Staff = require('../models/staff');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duty')
        .setDescription('Log staff duty')
        .addUserOption(option => option.setName('user').setDescription('Staff member').setRequired(true))
        .addStringOption(option => option.setName('duty').setDescription('Duty description').setRequired(true))
        .addStringOption(option => option.setName('notes').setDescription('Additional notes').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const duty = interaction.options.getString('duty');
        const notes = interaction.options.getString('notes') || '';

        try {
            const staff = await Staff.findOne({ userId: user.id });
            if (!staff) {
                return interaction.reply({ content: 'User is not a staff member.', ephemeral: true });
            }
            const dutyLog = new DutyLog({
                staffId: user.id,
                duty: duty,
                notes: notes
            });
            await dutyLog.save();
            return interaction.reply(`Duty logged for ${user.username}: ${duty}`);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Error logging duty.', ephemeral: true });
        }
    }
};
