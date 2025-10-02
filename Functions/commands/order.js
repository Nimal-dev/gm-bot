const { SlashCommandBuilder } = require('discord.js');
const OrderTicket = require('../models/orderTicket');
const Staff = require('../models/staff');
const { hasAllowedRole } = require('../utils/roleCheck');

const ADMIN_ROLES = ['Admin', 'Manager']; // Roles allowed to use admin commands

module.exports = {
    data: new SlashCommandBuilder()
        .setName('order')
        .setDescription('Create a bulk order ticket')
        .addStringOption(option => option.setName('customer').setDescription('Customer name').setRequired(true))
        .addStringOption(option => option.setName('items').setDescription('Items in format: name:qty:price;name:qty:price').setRequired(true))
        .addStringOption(option => option.setName('notes').setDescription('Additional notes').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        const customer = interaction.options.getString('customer');
        const itemsString = interaction.options.getString('items');
        const notes = interaction.options.getString('notes') || '';

        // Check if user has admin role for admin commands
        const isAdmin = hasAllowedRole(interaction.member, ADMIN_ROLES);

        if (!isAdmin) {
            return interaction.editReply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            const staff = await Staff.findOne({ userId: interaction.user.id });
            if (!staff) {
                return interaction.editReply({ content: 'You are not a staff member.', ephemeral: true });
            }

            // Parse items: name:qty:price;name:qty:price
            const items = [];
            let total = 0;
            const itemParts = itemsString.split(';');
            for (const part of itemParts) {
                const [name, qty, price] = part.split(':');
                if (!name || !qty || !price) {
                    return interaction.editReply({ content: 'Invalid item format. Use name:qty:price;name:qty:price', ephemeral: true });
                }
                const quantity = parseInt(qty);
                const itemPrice = parseFloat(price);
                items.push({ name, quantity, price: itemPrice });
                total += quantity * itemPrice;
            }

            const order = new OrderTicket({
                customer,
                items,
                total,
                createdBy: interaction.user.id,
                notes
            });
            await order.save();
            return interaction.editReply(`Order ticket created for ${customer}. Total: $${total.toFixed(2)}`);
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: 'Error creating order ticket.', ephemeral: true });
        }
    }
};
