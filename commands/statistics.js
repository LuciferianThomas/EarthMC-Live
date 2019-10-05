const Discord = require('discord.js')

module.exports = {
	name: "statistics",
	aliases: ["stats"],
	run: async (client, message, args, data) => {
    message.channel.send(
      new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setAuthor("EarthMC Live | Statistics")
        .setThumbnail(client.user.avatarURL)
        .addField("Servers", client.guilds.size, true)
        .addField("Users", client.users.size, true)
        .setFooter("Created by LuciferianThomas#0666 (TCCGPlayz) | Provided by EarthMC Live")
    )
	}
}