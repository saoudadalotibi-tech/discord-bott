const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const warns = new Map();

client.once('clientReady', () => {
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
      return message.channel.send('تم الباند 🚫');
    }

    // 👢 طرد
    if (cmd === 'طرد') {
      if (!member) return message.reply('مين أطرد؟');
      if (!member.kickable) return message.reply('ما أقدر أطرده');

      await member.kick();
      return message.channel.send('تم الطرد 👢');
    }

    // ⏱ تايم أوت
    if (cmd === 'تايم') {
      if (!member) return message.reply('مين أعطيه تايم؟');
      if (!member.moderatable) return message.reply('رتبة الشخص أعلى من البوت');

      const time = args[1];
      const unit = args[2];
      if (!time || !unit) return message.reply('!تايم @user 10 sec');

      let ms;

      switch (unit.toLowerCase()) {
        case 'sec':
        case 's':
        case 'ثواني':
          ms = time * 1000;
          break;

        case 'min':
        case 'm':
        case 'دقائق':
          ms = time * 60 * 1000;
          break;

        case 'hour':
        case 'h':
        case 'ساعات':
          ms = time * 60 * 60 * 1000;
          break;

        case 'day':
        case 'd':
        case 'أيام':
          ms = time * 24 * 60 * 60 * 1000;
          break;

        default:
          return message.reply('sec / min / hour / day');
      }

      await member.timeout(ms);
      return message.channel.send('تم التايم ⏱');
    }

    // 🔇 ميوت (رول + وقت)
    if (cmd === 'ميوت') {
      if (!member) return message.reply('مين أكتمه؟');
      if (!member.moderatable) return message.reply('رتبة الشخص أعلى من البوت');

      const time = args[1];
      const unit = args[2];
      if (!time || !unit) return message.reply('!ميوت @user 10 min');

      let ms;

      switch (unit.toLowerCase()) {
        case 'sec':
        case 's':
        case 'ثواني':
          ms = time * 1000;
          break;

        case 'min':
        case 'm':
        case 'دقائق':
          ms = time * 60 * 1000;
          break;

        case 'hour':
        case 'h':
        case 'ساعات':
          ms = time * 60 * 60 * 1000;
          break;

        case 'day':
        case 'd':
        case 'أيام':
          ms = time * 24 * 60 * 60 * 1000;
          break;

        default:
          return message.reply('sec / min / hour / day');
      }

      let role = message.guild.roles.cache.find(r => r.name === "Muted");

      if (!role) {
        role = await message.guild.roles.create({
          name: "Muted",
          permissions: []
        });
      }

      await member.roles.add(role);

      setTimeout(async () => {
        try {
          await member.roles.remove(role);
        } catch {}
      }, ms);

      return message.channel.send('تم الميوت 🔇');
    }

    // 🔊 فك ميوت
    if (cmd === 'فك') {
      const role = message.guild.roles.cache.find(r => r.name === "Muted");
      if (!role) return message.reply('ما فيه ميوت');

      if (!member) return message.reply('مين أفك عنه؟');

      await member.roles.remove(role);
      return message.channel.send('تم فك الميوت 🔊');
    }

// ⚠ تحذير
    if (cmd === 'تحذير') {
      if (!member) return message.reply('مين أحذره؟');

      const reason = args.join(' ') || 'بدون سبب';

      if (!warns.has(member.id)) warns.set(member.id, []);
      warns.get(member.id).push(reason);

      return message.channel.send(`⚠ تم تحذير ${member.user.username}`);
    }

    // 🏷 نك
    if (cmd === 'نك') {
      if (!member) return message.reply('مين أغير اسمه؟');

      const newNick = args.join(' ');
      if (!newNick) return message.reply('اكتب الاسم الجديد');

      await member.setNickname(newNick);
      return message.channel.send('تم تغيير النك 🏷');
    }

    // 🎭 رول
    if (cmd === 'رول') {
      if (!member) return message.reply('مين أعطيه رول؟');

      const roleName = args.join(' ');
      const role = message.guild.roles.cache.find(r => r.name === roleName);

      if (!role) return message.reply('الرول غير موجود');

      await member.roles.add(role);
      return message.channel.send('تم إعطاء الرول 🎭');
    }

  } catch (err) {
    console.log(err);
    return message.reply('صار خطأ، بس البوت ما طاح 👍');
  }
});

client.login('MTUxMDM0NDIzMTU2MTE5OTY2Ng.G4CcgP.zvFCssHTWqAyX6u26aIpJV62NV8N3qio6MX08w');