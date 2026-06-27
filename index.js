const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');

process.on('unhandledRejection', err => {
  console.log('Error:', err);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const warns = new Map();

const LOG_CHANNEL_NAME = "reinlog";

// 🟢 Ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 🟢 لوق إيمبيد
async function sendLog(guild, title, desc, color = 0x2b2d31) {
  const channel = guild.channels.cache.find(c => c.name === LOG_CHANNEL_NAME);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(desc)
    .setColor(color)
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(() => {});
}

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const cmd = args.shift();
  const member = message.mentions.members.first();

  try {

    // 🛑 حماية الستاف (ADMIN فقط)
    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // 🟢 تست (الكل يقدر)
    if (cmd === 'تست') {
      return message.reply('Working ✅');
    }

    // 🚫 بان
    if (cmd === 'بان') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');
      if (!member) return message.reply('مين أبند؟');
      if (!member.bannable) return message.reply('ما أقدر أبنده');

      await member.ban();
      sendLog(message.guild, "🚫 Ban", `${member.user.tag} تم تبنيده`, 0xff0000);
      return message.channel.send('تم الباند 🚫');
    }

    // 👢 طرد
    if (cmd === 'طرد') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');
      if (!member) return message.reply('مين أطرد؟');
      if (!member.kickable) return message.reply('ما أقدر أطرده');

      await member.kick();
      sendLog(message.guild, "👢 Kick", `${member.user.tag} تم طرده`, 0xff9900);
      return message.channel.send('تم الطرد 👢');
    }

// ⏱ تايم
    if (cmd === 'تايم') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');
      if (!member) return message.reply('مين أعطيه تايم؟');

      const time = args[0];
      const unit = args[1];

      if (!time || !unit) return message.reply('!تايم @user 10 min');

      let ms;

      switch (unit.toLowerCase()) {
        case 'sec': case 's': ms = time * 1000; break;
        case 'min': case 'm': ms = time * 60 * 1000; break;
        case 'hour': case 'h': ms = time * 60 * 60 * 1000; break;
        case 'day': case 'd': ms = time * 24 * 60 * 60 * 1000; break;
        default: return message.reply('sec / min / hour / day');
      }

      await member.timeout(ms);
      sendLog(message.guild, "⏱ Timeout", `${member.user.tag} تايم`, 0x00aaff);
      return message.channel.send('تم التايم ⏱');
    }

    // 🔇 كتم
    if (cmd === 'كتم') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');
      if (!member) return message.reply('مين أكتمه؟');

      const time = args[0];
      const unit = args[1];

      if (!time || !unit) return message.reply('!كتم @user 10 min');

      let ms;

      switch (unit.toLowerCase()) {
        case 'sec': case 's': ms = time * 1000; break;
        case 'min': case 'm': ms = time * 60 * 1000; break;
        case 'hour': case 'h': ms = time * 60 * 60 * 1000; break;
        case 'day': case 'd': ms = time * 24 * 60 * 60 * 1000; break;
        default: return message.reply('sec / min / hour / day');
      }

      await member.timeout(ms);
      sendLog(message.guild, "🔇 Mute", `${member.user.tag} كتم`, 0x555555);
      return message.channel.send('تم الكتم 🔇');
    }

    // 🔒 قفل
    if (cmd === 'قفل') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      sendLog(message.guild, "🔒 Lock", `تم القفل`, 0xff0000);
      return message.channel.send('تم القفل 🔒');
    }

    // 🔓 فتح
    if (cmd === 'فتح') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null
      });

      sendLog(message.guild, "🔓 Unlock", `تم الفتح`, 0x00ff00);
      return message.channel.send('تم الفتح 🔓');
    }

    // 🏷 نك
    if (cmd === 'نك') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');
      if (!member) return message.reply('مين أغير اسمه؟');

      const newNick = args.join(' ');
      if (!newNick) return message.reply('اكتب الاسم');

      await member.setNickname(newNick);

      sendLog(message.guild, "🏷 Nick", `${member.user.tag} صار: ${newNick}`, 0xaaaaaa);
      return message.channel.send('تم تغيير النك 🏷');
    }

    // 🎭 رول
    if (cmd === 'رول') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');
      if (!member) return message.reply('مين أعطيه رول؟');

      const roleName = args.join(' ');
      const role = message.guild.roles.cache.find(r => r.name === roleName);

      if (!role) return message.reply('الرول غير موجود');

      await member.roles.add(role);

      sendLog(message.guild, "🎭 Role", `${member.user.tag} أخذ ${roleName}`, 0x00ffcc);
      return message.channel.send('تم إعطاء الرول 🎭');
    }

    // ⚠ تحذير
    if (cmd === 'تحذير') {
      if (!isAdmin) return message.reply('ما عندك صلاحية ❌');
      if (!member) return message.reply('مين أحذره؟');

      const reason = args.join(' ') || 'بدون سبب';

      if (!warns.has(member.id)) warns.set(member.id, []);
      warns.get(member.id).push(reason);

      sendLog(message.guild, "⚠ Warn", `${member.user.tag}: ${reason}`, 0xffff00);
      return message.channel.send('تم التحذير ⚠');
    }

  } catch (err) {
    console.log(err);
    return message.reply('صار خطأ 👍');
  }
});

client.login(process.env.TOKEN);