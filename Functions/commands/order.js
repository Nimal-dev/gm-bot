const { SlashCommandBuilder } = require('discord.js');
const OrderTicket = require('../models/orderTicket');
const Staff = require('../models/staff');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('order')
        .setDescription('Create a bulk order ticket')
        .addStringOption(option => option.setName('customer').setDescription('Customer name').setRequired(true))
        .addStringOption(option => option.setName('items').setDescription('Items in format: name:qty:price;name:qty:price').setRequired(true))
        .addStringOption(option => option.setName('notes').setDescription('Additional notes').setRequired(false)),
    async execute(interaction) {
        const customer = interaction.options.getString('customer');
        const itemsString = interaction.options.getString('items');
        const notes = interaction.options.getString('notes') || '';

        try {
            const staff = await Staff.findOne({ userId: interaction.user.id });
            if (!staff) {
                return interaction.reply({ content: 'You are not a staff member.', ephemeral: true });
            }

            // Parse items: name:qty:price;name:qty:price
            const items = [];
            let total = 0;
            const itemParts = itemsString.split(';');
            for (const part of itemParts) {
                const [name, qty, price] = part.split(':');
                if (!name || !qty || !price) {
                    return interaction.reply({ content: 'Invalid item format. Use name:qty:price;name:qty:price', ephemeral: true });
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
            return interaction.reply(`Order ticket created for ${customer}. Total: $${total.toFixed(2)}`);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Error creating order ticket.', ephemeral: true });
        }
    }
};
