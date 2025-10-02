const { Events, ButtonInteraction } = require('discord.js');
const TimeLog = require('../models/timeLog');
const Staff = require('../models/staff');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            const customId = interaction.customId;
            if (customId.startsWith('time_')) {
                const parts = customId.split('_');
                const action = parts[1]; // 'in' or 'out'
                const userId = parts[2];

                if (interaction.user.id !== userId) {
                    return interaction.reply({ content: 'You cannot confirm clock actions for other users.', ephemeral: true });
                }

                try {
                    const staff = await Staff.findOne({ userId: userId });
                    if (!staff) {
                        return interaction.reply({ content: 'User is not a staff member.', ephemeral: true });
                    }

                    if (action === 'in') {
                        const existingLog = await TimeLog.findOne({ staffId: userId, clockOut: null });
                        if (existingLog) {
                            return interaction.reply({ content: 'You are already clocked in.', ephemeral: true });
                        }
                        const timeLog = new TimeLog({
                            staffId: userId,
                            clockIn: new Date()
                        });
                        await timeLog.save();
                        return interaction.update({ content: 'You have successfully clocked in.', components: [] });
                    } else if (action === 'out') {
                        const timeLog = await TimeLog.findOne({ staffId: userId, clockOut: null }).sort({ clockIn: -1 });
                        if (!timeLog) {
                            return interaction.reply({ content: 'You are not currently clocked in.', ephemeral: true });
                        }
                        timeLog.clockOut = new Date();
                        const diffMs = timeLog.clockOut - timeLog.clockIn;
                        timeLog.totalHours = diffMs / (1000 * 60 * 60);
                        await timeLog.save();
                        return interaction.update({ content: `You have successfully clocked out. Total hours: ${timeLog.totalHours.toFixed(2)}`, components: [] });
                    }
                } catch (error) {
                    console.error('Error processing time button interaction:', error);
                    return interaction.reply({ content: 'Error processing time log.', ephemeral: true });
                }
            }
        }
    }
};
