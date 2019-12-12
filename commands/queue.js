const Discord = require('discord.js'),
      Minecraft = require('minecraft-lib'),
      moment = require('moment'),
      fetch = require('node-fetch'),
      fn = require("/app/bot/fn")

module.exports = {
  name: "queue",
  aliases: ["q"],
  run: async (bot, message, args) => {
    let serverdata = await Minecraft.servers.get("earthmc.net",25565).catch(() => {}) 
    // this used to work fine, idk why it doesn't now
    // not sure if this is related to DNS (cache?) again
    if (!serverdata) return await message.channel.send(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("Connection Issues")
        .setDescription("We are currently unable to ping the server.\nThis may be caused by the server being offline or a network issue.\nPlease try again later.")
    ).then(msg => fn.delPrompt(msg, message.author.id))
    let server = serverdata.players.online
    
    let townyres = await fetch("https://earthmc.net/map/up/world/earth/")
    let townydata = await townyres.json().catch(() => {})
    if (!townydata) return await message.channel.send(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("Connection Issues")
        .setDescription("We are currently unable to fetch the queue information. Please try again later.")
    ).then(msg => fn.delPrompt(msg, message.author.id))
    let towny = townydata.currentcount
    
    let queue = server - towny
    
    let embed = new Discord.RichEmbed()
      .setColor(0x00ffff)
      .setAuthor("Queue Status", "https://earthmc.net/img/logo.png")
      .addField("Towny Queue", `There ${queue == 1 ? "is" : "are"} now ${towny > 195 ? `${queue} player${queue == 1 ? "" : "s"} in the EarthMC Queue.` : `${200-towny} free spot${200-towny == 1 ? "" : "s"} in EarthMC Towny.`}`)
      .addField("Towny", `${towny >= 200 ? `**FULL** ${towny}` : towny}/200`, true)
      // .addField("Factions", `${fac >= 100 ? `**FULL** ${fac}` : fac}/100`, true)
      // .addField("Classic", `${classic >= 100 ? `**FULL** ${classic}` : classic}/100`, true)
      .setFooter(`Last Updated`, bot.user.avatarURL)
      .setTimestamp(moment())
    
    message.channel.send(embed)
  }
}