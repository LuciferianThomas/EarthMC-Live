const Discord = require('discord.js')

module.exports = {
  name: "queue",
  aliases: ["q"],
  run: async (bot, message, args, {towny, fac, classic, queue, update}) => {
    message.channel.send(new Discord.RichEmbed()
      .setColor(0x00ffff)
      .setAuthor("EarthMC Server Status", "https://earthmc.net/img/logo.png")
      .addField("Towny Queue", `There are now ${towny > 195 ? `${queue} player${queue == 1 ? "" : "s"} in the EarthMC Queue.` : `${200-towny} free spot${200-towny == 1 ? "" : "s"} in EarthMC Towny.`}`)
      .addField("Towny", `${towny >= 200 ? `**FULL** ${towny}` : towny}/200`, true)
      .addField("Factions", `${fac >= 100 ? `**FULL** ${fac}` : fac}/100`, true)
      .addField("Classic", `${classic >= 100 ? `**FULL** ${classic}` : classic}/100`, true)
      .setFooter(`Provided by EarthMC Live • Requested by ${message.author.tag}`, bot.user.avatarURL)
    )
  }
}