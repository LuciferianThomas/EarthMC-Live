const Discord = require("discord.js")

module.exports = {
  name: "invite",
  run: async (client, message) => {
    await message.channel.send(
      new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setDescription("[Join EarthMC Live!](https://invite.gg/emcl)\n[Invite the bot to your server!](https://discordapp.com/api/oauth2/authorize?client_id=590704855623008266&permissions=19456&scope=bot)")
    )
  }
}