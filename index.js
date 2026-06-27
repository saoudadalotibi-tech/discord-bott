const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

process.on('unhandledRejection', err => {
  console.log('Unhandled error:', err);
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

async function log(guild, msg) {
  const channel = guild.channels.cache.find(c => c.name === LOG_CHANNEL_NAME);
  if (channel) channel.send(msg).catch(() => {});
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const cmd = args.shift();
  const member = message.mentions.members.first();

  try {

    // 🚫 بان
    if (cmd === 'بان') {
      if (!member) return message.reply('مين أبند؟');
      if (!member.bannable) return message.reply('ما أقدر أبنده');

      await member.ban();
      log(message.guild, `🚫 ${member.user.tag} تم تبنيده`);
      return message.channel.send('تم الباند 🚫');
    }

    // 👢 طرد
    if (cmd === 'طرد') {
      if (!member) return message.reply('مين أطرد؟');
      if (!member.kickable) return message.reply('ما أقدر أطرده');

      await member.kick();
      log(message.guild, `👢 ${member.user.tag} تم طرده`);
      return message.channel.send('تم الطرد 👢');
    }

    // ⏱ تايم أوت
    if (cmd === 'تايم') {
      if (!member) return message.reply('مين أعطيه تايم؟');

      const time = args[0];
      const unit = args[1];

      let ms;
      switch (unit?.toLowerCase()) {
        case 'sec': case 's': ms = time * 1000; break;
        case 'min': case 'm': ms = time * 60 * 1000; break;
        case 'hour': case 'h': ms = time * 60 * 60 * 1000; break;
        case 'day': case 'd': ms = time * 24 * 60 * 60 * 1000; break;
        default: return message.reply('sec / min / hour / day');
      }

      await member.timeout(ms);
      log(message.guild, `⏱ ${member.user.tag} تايم ${time} ${unit}`);
      return message.channel.send('تم التايم ⏱');
    }

    // 🧹 مسح الشات
    if (cmd === 'مسح') {
      const amount = parseInt(args[0]);
      if (!amount) return message.reply('حدد عدد الرسائل');

      await message.channel.bulkDelete(amount, true);
      log(message.guild, `🧹 تم مسح ${amount} رسائل بواسطة ${message.author.tag}`);
      return message.channel.send('تم المسح 🧹');
    }

// 🔒 قفل
    if (cmd === 'قفل') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('ما عندك صلاحية');

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      log(message.guild, `🔒 تم قفل الشات`);
      return message.channel.send('تم القفل 🔒');
    }

    // 🔓 فتح
    if (cmd === 'فتح') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('ما عندك صلاحية');

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: true
      });

      log(message.guild, `🔓 تم فتح الشات`);
      return message.channel.send('تم الفتح 🔓');
    }

    // 🏷 نك
    if (cmd === 'نك') {
      if (!member) return message.reply('مين أغير اسمه؟');

      const newNick = args.join(' ');
      if (!newNick) return message.reply('اكتب الاسم');

      await member.setNickname(newNick);
      log(message.guild, `🏷 ${member.user.tag} صار نك: ${newNick}`);
      return message.channel.send('تم تغيير النك 🏷');
    }

    // 🎭 رول
    if (cmd === 'رول') {
      if (!member) return message.reply('مين أعطيه رول؟');

      const roleName = args.join(' ');
      const role = message.guild.roles.cache.find(r => r.name === roleName);

      if (!role) return message.reply('الرول غير موجود');

      await member.roles.add(role);
      log(message.guild, `🎭 ${member.user.tag} أخذ رول ${roleName}`);
      return message.channel.send('تم إعطاء الرول 🎭');
    }

    // ⚠ تحذير
    if (cmd === 'تحذير') {
      if (!member) return message.reply('مين أحذره؟');

      const reason = args.join(' ') || 'بدون سبب';

      if (!warns.has(member.id)) warns.set(member.id, []);
      warns.get(member.id).push(reason);

      log(message.guild, `⚠ ${member.user.tag} تحذير: ${reason}`);
      return message.channel.send('تم التحذير ⚠');
    }

  } catch (err) {
    console.log(err);
    return message.reply('صار خطأ 👍');
  }
});

client.login(process.env.TOKEN);