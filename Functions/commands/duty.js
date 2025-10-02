const { SlashCommandBuilder } = require('discord.js');
const DutyLog = require('../models/dutyLog');
const Staff = require('../models/staff');
const { hasAllowedRole } = require('../utils/roleCheck');

const ADMIN_ROLES = ['Admin', 'Manager']; // Roles allowed to use admin commands

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duty')
        .setDescription('Log staff duty')
        .addUserOption(option => option.setName('user').setDescription('Staff member').setRequired(true))
        .addStringOption(option => option.setName('duty').setDescription('Duty description').setRequired(true))
        .addStringOption(option => option.setName('notes').setDescription('Additional notes').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser('user');
        const duty = interaction.options.getString('duty');
        const notes = interaction.options.getString('notes') || '';

        // Check if user has admin role for admin commands
        const isAdmin = hasAllowedRole(interaction.member, ADMIN_ROLES);

        if (!isAdmin) {
            return interaction.editReply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            const staff = await Staff.findOne({ userId: user.id });
            if (!staff) {
                return interaction.editReply({ content: 'User is not a staff member.', ephemeral: true });
            }
            const dutyLog = new DutyLog({
                staffId: user.id,
                duty: duty,
                notes: notes
            });
            await dutyLog.save();
            return interaction.editReply(`Duty logged for ${user.username}: ${duty}`);
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: 'Error logging duty.', ephemeral: true });
        }
    }
};
