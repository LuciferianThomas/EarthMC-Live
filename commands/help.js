const Discord = require("discord.js");

module.exports = {
  name: "help",
  usage: "help",
  run: async (client, message, args, data) => {
    message.channel.send(
      new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setAuthor("EarthMC Live", client.user.avatarURL)
        .addField("`/queue`", "Shows current queue.\nAlias: `/q`")
        .addField(
          "`/subscribe`",
          "Subscribe to EarthMC Queue for this channel.\nAlias: `/sub`"
        )
        .addField(
          "`/unsubscribe`",
          "Unsubscribe to EarthMC Queue for this channel.\nAlias: `/unsub`"
        )
        .addField(
          "`/town`",
          "Get instant information about towns.\n`/town <name>`\nGet information about the specific town.\n`/town list`\nGet the list of all towns sorted according to the number of residents and town area.\nAlias: `/t`"
        )
        .addField(
          "`/nation`",
          "Get instant information about nations.\n`/nation <name>`\nGet information about the specific nation.\n`/nation list`\nGet the list of all nations sorted according to the number of residents and town area.\nAlias: `/n`"
        )
        .addField(
          "`/player <name>`", 
          "Get user information!\nAlias: `/pl`"
        )
        .setFooter(
          "Created by LuciferianThomas#0666 (TCCGPlayz) | Provided by EarthMC Live"
        )
    );
  }
};
