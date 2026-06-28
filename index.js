const express = require('express');

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

process.on('unhandledRejection', err => {
  console.log('Error:', err);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// 🔥 FIX RENDER PORT
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(3000, () => console.log('Server alive'));

// 🟢 STAFF ROLES
const staffRoles = [
  "1520518573460688999",
  "1520518072937480344",
  "1520518922019803216"
];

// 🟢 HELPERS
function isStaff(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator) ||
    member.roles.cache.some(r => staffRoles.includes(r.id));
}

// 🟢 STATES
const claimedTickets = new Map();
const closedTickets = new Set();

const CATEGORY_NAME = "─── ❖ SUPPORT & HELP ───";

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 🟢 MESSAGE COMMANDS
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const cmd = args.shift();
  const member = message.mentions.members.first();

  // 🟢 TEST
  if (cmd === 'تست') return message.reply('Working ✅');

  // 🎫 SETUP (ADMIN ONLY)
  if (cmd === 'setup') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply('❌ للأدمن فقط');

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("🎫 Ticket System")
      .setDescription("اضغط الزر لفتح تكت");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Open Ticket 🎫')
        .setStyle(ButtonStyle.Success)
    );

    return message.channel.send({ embeds: [embed], components: [row] });
  }

  // 🚫 BAN
  if (cmd === 'بان') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');
    if (!member) return;

    if (!member.bannable) return message.reply('ما أقدر أبنده');

    await member.ban();
    return message.channel.send('تم الباند 🚫');
  }

  // 👢 KICK
  if (cmd === 'طرد') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');
    if (!member) return;

    if (!member.kickable) return message.reply('ما أقدر أطرده');

    await member.kick();
    return message.channel.send('تم الطرد 👢');
  }

// ⏱ TIMEOUT
  if (cmd === 'تايم') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');
    if (!member) return;

    const time = args[0];
    const unit = args[1];

    let ms;
    switch (unit?.toLowerCase()) {
      case 'sec': ms = time * 1000; break;
      case 'min': ms = time * 60000; break;
      case 'hour': ms = time * 3600000; break;
      case 'day': ms = time * 86400000; break;
      default: return message.reply('sec / min / hour / day');
    }

    await member.timeout(ms);
    return message.channel.send('تم التايم ⏱');
  }

  // 🔒 LOCK
  if (cmd === 'قفل') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false
    });

    return message.channel.send('🔒 تم القفل');
  }

  // 🔓 UNLOCK
  if (cmd === 'فتح') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: null
    });

    return message.channel.send('🔓 تم الفتح');
  }
});

// 🟢 BUTTON SYSTEM
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // 🎫 CREATE TICKET
  if (interaction.customId === 'create_ticket') {

    let category = interaction.guild.channels.cache.find(
      c => c.name === CATEGORY_NAME && c.type === ChannelType.GuildCategory
    );

    if (!category) {
      category = await interaction.guild.channels.create({
        name: CATEGORY_NAME,
        type: ChannelType.GuildCategory
      });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        },
        ...staffRoles.map(id => ({
          id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }))
      ]
    });

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("📌 Support Ticket")
      .setDescription("اكتب مشكلتك هنا");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel('Claim 🎟')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close 🔒')
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@&${staffRoles[2]}>`,
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({ content: 'تم فتح التكت 🎫', ephemeral: true });
  }

// 🎟 CLAIM
  if (interaction.customId === 'claim_ticket') {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: '❌ ستاف فقط', ephemeral: true });

    return interaction.reply({ content: 'تم الاستلام 🎟', ephemeral: true });
  }

  // 🔒 CLOSE
  if (interaction.customId === 'close_ticket') {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: '❌ ستاف فقط', ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('delete_ticket')
        .setLabel('Delete 🗑')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.channel.send('🔒 تم إغلاق التكت');
    await interaction.channel.send({ components: [row] });

    return interaction.reply({ content: 'تم القفل 🔒', ephemeral: true });
  }

  // 🗑 DELETE
  if (interaction.customId === 'delete_ticket') {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: '❌ ستاف فقط', ephemeral: true });

    await interaction.reply({ content: 'يتم الحذف...' });

    setTimeout(() => {
      interaction.channel.delete();
    }, 2000);
  }
});

client.login(process.env.TOKEN);