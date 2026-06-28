const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
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

const warns = new Map();
const LOG_CHANNEL_NAME = "reinlog";

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 🟢 لوق
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
  const perms = message.member.permissions;

  try {

    // 🟢 تست (الكل)
    if (cmd === 'تست') {
      return message.reply('Working ✅');
    }

    // 🚫 بان
    if (cmd === 'بان') {
      if (!perms.has(PermissionsBitField.Flags.BanMembers))
        return message.reply('ما عندك صلاحية بان ❌');

      if (!member) return message.reply('مين أبند؟');
      if (!member.bannable) return message.reply('ما أقدر أبنده');

      await member.ban();
      sendLog(message.guild, "🚫 Ban", `${member.user.tag}`, 0xff0000);
      return message.channel.send('تم الباند 🚫');
    }

    // 👢 طرد
    if (cmd === 'طرد') {
      if (!perms.has(PermissionsBitField.Flags.KickMembers))
        return message.reply('ما عندك صلاحية طرد ❌');

      if (!member) return message.reply('مين أطرد؟');
      if (!member.kickable) return message.reply('ما أقدر أطرده');

      await member.kick();
      sendLog(message.guild, "👢 Kick", `${member.user.tag}`, 0xff9900);
      return message.channel.send('تم الطرد 👢');
    }

    // ⏱ تايم
    if (cmd === 'تايم') {
      if (!perms.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply('ما عندك صلاحية تايم ❌');

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
      sendLog(message.guild, "⏱ Timeout", `${member.user.tag}`, 0x00aaff);
      return message.channel.send('تم التايم ⏱');
    }

// 🔇 كتم
    if (cmd === 'كتم') {
      if (!perms.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply('ما عندك صلاحية كتم ❌');

      if (!member) return message.reply('مين أكتمه؟');

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
      sendLog(message.guild, "🔇 Mute", `${member.user.tag}`, 0x555555);
      return message.channel.send('تم الكتم 🔇');
    }

    // 🔒 قفل
    if (cmd === 'قفل') {
      if (!perms.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('ما عندك صلاحية قفل ❌');

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      sendLog(message.guild, "🔒 Lock", `تم القفل`, 0xff0000);
      return message.channel.send('تم القفل 🔒');
    }

    // 🔓 فتح
    if (cmd === 'فتح') {
      if (!perms.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('ما عندك صلاحية فتح ❌');

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null
      });

      sendLog(message.guild, "🔓 Unlock", `تم الفتح`, 0x00ff00);
      return message.channel.send('تم الفتح 🔓');
    }

    // 🏷 نك
    if (cmd === 'نك') {
      if (!perms.has(PermissionsBitField.Flags.ManageNicknames))
        return message.reply('ما عندك صلاحية تغيير نك ❌');

      if (!member) return message.reply('مين أغير اسمه؟');

      const newNick = args.join(' ');
      if (!newNick) return message.reply('اكتب الاسم');

      await member.setNickname(newNick);
      sendLog(message.guild, "🏷 Nick", `${member.user.tag} → ${newNick}`, 0xaaaaaa);
      return message.channel.send('تم تغيير النك 🏷');
    }

    // 🎭 رول
    if (cmd === 'رول') {
      if (!perms.has(PermissionsBitField.Flags.ManageRoles))
        return message.reply('ما عندك صلاحية رول ❌');

      if (!member) return message.reply('مين أعطيه رول؟');

      const roleName = args.join(' ');
      const role = message.guild.roles.cache.find(r => r.name === roleName);

      if (!role) return message.reply('الرول غير موجود');

      await member.roles.add(role);
      sendLog(message.guild, "🎭 Role", `${member.user.tag} → ${roleName}`, 0x00ffcc);
      return message.channel.send('تم إعطاء الرول 🎭');
    }

// ⚠ تحذير
    if (cmd === 'تحذير') {
      if (!perms.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply('ما عندك صلاحية تحذير ❌');

      if (!member) return message.reply('مين أحذره؟');

      const reason = args.join(' ') || 'بدون سبب';

      if (!warns.has(member.id)) warns.set(member.id, []);
      warns.get(member.id).push(reason);

      sendLog(message.guild, "⚠ Warn", `${member.user.tag}: ${reason}`, 0xffff00);
      return message.channel.send('تم التحذير ⚠');
    }

// 🎧 دخول فويس
    if (cmd === 'دخول') {
      if (!perms.has(PermissionsBitField.Flags.Administrator))
        return message.reply('ما عندك صلاحية دخول فويس ❌');

      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) return message.reply('ادخل فويس أول ❌');

      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      return message.channel.send('تم دخول الفويس 🎧');
    }

    // 🚪 خروج فويس
    if (cmd === 'خروج') {
      if (!perms.has(PermissionsBitField.Flags.Administrator))
        return message.reply('ما عندك صلاحية خروج ❌');

      const connection = getVoiceConnection(message.guild.id);
      if (!connection) return message.reply('البوت مو داخل فويس ❌');

      connection.destroy();

      return message.channel.send('تم خروج البوت 🚪');
    }

  } catch (err) {
    console.log(err);
    return message.reply('صار خطأ 👍');
  }
});

client.login(process.env.TOKEN);