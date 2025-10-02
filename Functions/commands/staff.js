const { SlashCommandBuilder } = require('discord.js');
const Staff = require('../models/staff');
const { hasAllowedRole } = require('../utils/roleCheck');

const ADMIN_ROLES = ['Admin', '🌟 GM MANAGER 🌟']; // Roles allowed to use admin commands

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('Manage staff members')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new staff member')
                .addUserOption(option => option.setName('user').setDescription('User to add').setRequired(true))
                .addStringOption(option => option.setName('role').setDescription('Role of the staff').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a staff member')
                .addUserOption(option => option.setName('user').setDescription('User to remove').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all staff members')
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        // Check if user has admin role for admin commands
        const isAdmin = hasAllowedRole(interaction.member, ADMIN_ROLES);

        if (!isAdmin && (subcommand === 'add' || subcommand === 'remove')) {
            return interaction.editReply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getString('role');

        try {
            if (subcommand === 'add') {
                const existing = await Staff.findOne({ userId: user.id });
                if (existing) {
                    return interaction.editReply({ content: 'This user is already a staff member.', ephemeral: true });
                }
                const staff = new Staff({
                    userId: user.id,
                    name: user.username,
                    role: role,
                });
                await staff.save();
                return interaction.editReply(`Added ${user.username} as ${role}.`);
            } else if (subcommand === 'remove') {
                const removed = await Staff.findOneAndDelete({ userId: user.id });
                if (!removed) {
                    return interaction.editReply({ content: 'Staff member not found.', ephemeral: true });
                }
                return interaction.editReply(`Removed ${user.username} from staff.`);
            } else if (subcommand === 'list') {
                const staffList = await Staff.find({ isActive: true });
                if (staffList.length === 0) {
                    return interaction.editReply('No active staff members found.');
                }
                const listString = staffList.map(s => `${s.name} - ${s.role}`).join('\n');
                return interaction.editReply(`Active Staff Members:\n${listString}`);
            }
        } catch (error) {
            console.error('Error processing staff command:', error);
            return interaction.editReply({ content: 'Error processing staff command.', ephemeral: true });
        }
    }
};
