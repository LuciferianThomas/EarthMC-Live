const Discord = require("discord.js"),
      fetch = require("node-fetch"),
      Minecraft = require("minecraft-lib")

module.exports = {
  name: "status",
  run: async (client, message, args) => {
    let m = await message.channel.send(
      new Discord.RichEmbed().setColor(0x00ffff).setTitle("Fetching data...")
    )
    
    let embed = new Discord.RichEmbed()
      .setColor(0x00ffff)
      .setAuthor("Server Status", "https://earthmc.net/img/logo.png")
    
    let ping1a = new Date()
    let serverdata = await Minecraft.servers.get("dc-f626de6d73b7.earthmc.net",25577).catch(() => {})
    let ping1b = new Date()
    if (serverdata) embed.addField("Server", "Online", true)
    else            embed.addField("Server", "Connection Timed Out", true)
    
    let mapres = await fetch("https://earthmc.net/map/tiles/_markers_/marker_earth.json")
    let mapdata = await mapres.json().catch(() => {})
    if (mapdata) embed.addField("Towny Dynmap", "Available", true)
    else         embed.addField("Towny Dynmap", "Unavailable", true)
    
    await m.edit(embed)
  }
}