cconst {
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

// 🟢 TICKET STATES
const claimedTickets = new Map();
const closedTickets = new Set();

// 🟢 CATEGORY
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

  // 🟢 TEST (ALL)
  if (cmd === 'تست') {
    return message.reply('Working ✅');
  }

  // 🟢 SETUP TICKET (ADMIN ONLY)
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

    await member.ban();
    return message.channel.send('تم الباند 🚫');
  }

  // 👢 KICK
  if (cmd === 'طرد') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');
    if (!member) return;

    await member.kick();
    return message.channel.send('تم الطرد 👢');
  }

// ⏱ TIME
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
      default: return;
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

  // 🏷 NICK
  if (cmd === 'نك') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');
    if (!member) return;

    const name = args.join(' ');
    await member.setNickname(name);

    return message.channel.send('تم تغيير النك 🏷');
  }

// 🎭 ROLE
  if (cmd === 'رول') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');

    const role = message.guild.roles.cache.find(r => r.name === args.join(' '));
    if (!role) return;

    await member.roles.add(role);
    return message.channel.send('تم إعطاء رول 🎭');
  }

  // ⚠ WARN
  if (cmd === 'تحذير') {
    if (!isStaff(message.member)) return message.reply('❌ ستاف فقط');
    return message.channel.send('تم التحذير ⚠');
  }

  // 🎧 VOICE JOIN
  if (cmd === 'دخول') {
    if (!isStaff(message.member)) return;

    const vc = message.member.voice.channel;
    if (!vc) return;

    joinVoiceChannel({
      channelId: vc.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    return message.channel.send('🎧 دخل الفويس');
  }

  // 🚪 VOICE LEAVE
  if (cmd === 'خروج') {
    if (!isStaff(message.member)) return;

    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return;

    connection.destroy();
    return message.channel.send('🚪 طلع من الفويس');
  }
});

// 🟢 BUTTON SYSTEM
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // 🎫 CREATE TICKET
  if (interaction.customId === 'create_ticket') {

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      parent: interaction.guild.channels.cache.find(c => c.name === CATEGORY_NAME)?.id,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        ...staffRoles.map(id => ({
          id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }))
      ]
    });

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("📌 Ticket Rules")
      .setDescription("اشرح مشكلتك هنا");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim 🎟').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('close_ticket').setLabel('Close 🔒').setStyle(ButtonStyle.Danger)
    );

    channel.send({
      content: `<@&${staffRoles[2]}>`,
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({ content: "تم فتح التكت 🎫", ephemeral: true });
  }

  // 🎟 CLAIM
  if (interaction.customId === 'claim_ticket') {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: '❌ ستاف فقط', ephemeral: true });

    if (claimedTickets.has(interaction.channel.id))
      return interaction.reply({ content: 'مستلم ❌', ephemeral: true });

    claimedTickets.set(interaction.channel.id, interaction.user.id);

    return interaction.reply({ content: 'تم الاستلام 🎟', ephemeral: true });
  }

  // 🔒 CLOSE
  if (interaction.customId === 'close_ticket') {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: '❌ ستاف فقط', ephemeral: true });

    closedTickets.add(interaction.channel.id);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('delete_ticket')
        .setLabel('Delete 🗑')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.channel.send("🔒 تم إغلاق التكت");
    await interaction.channel.send({ components: [row] });

    return interaction.reply({ content: 'تم القفل 🔒', ephemeral: true });
  }

// 🗑 DELETE
  if (interaction.customId === 'delete_ticket') {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: '❌ ستاف فقط', ephemeral: true });

    interaction.reply({ content: 'يتم الحذف...' });

    setTimeout(() => {
      interaction.channel.delete();
    }, 2000);
  }
});

client.login(process.env.TOKEN);