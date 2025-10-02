const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');

        const staff = await Staff.findOne({ userId: user.id });
        if (!staff) {
            return interaction.editReply({ content: 'User is not a staff member.', ephemeral: true });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`time_${subcommand}_${user.id}`)
                    .setLabel(`Confirm Clock ${subcommand === 'in' ? 'In' : 'Out'}`)
                    .setStyle(ButtonStyle.Primary)
            );

        return interaction.editReply({ content: `Please confirm to clock ${subcommand} for ${user.username}`, components: [row] });
    }
};
