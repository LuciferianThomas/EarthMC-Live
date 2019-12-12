const Discord = require('discord.js'),
			https = require('https'),
			striptags = require('striptags'),
      minecraft = require('minecraft-lib'),
      jimp = require('jimp'),
      fetch = require("node-fetch"),
      Minecraft = require("minecraft-lib")

const index = require('../index.js'),
      fn = require('/app/bot/fn')

module.exports = {
  name: "resident",
  aliases: ["res", "player", "pl"],
  run: async (client, message, args, indexData) => {
    let resident = args[0]
    if (!resident)
      return await message.channel.send(
        new Discord.RichEmbed()
          .setColor(0x00ffff)
          .setTitle("Command Usage")
          .setDescription("`/resident <name>`")
      ).then(msg => fn.delPrompt(msg, message.author.id))

    /*let serverdata = await Minecraft.servers.get("dc-f626de6d73b7.earthmc.net",25577).catch(() => {})
    if (!serverdata) return await message.channel.send(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("Connection Issues")
        .setDescription("We are currently unable to ping the server.\nThis may be caused by the server being offline or a network issue.\nPlease try again later.")
    ).then(msg => fn.delPrompt(msg, message.author.id))*/
    
    let m = await message.channel.send(new Discord.RichEmbed().setColor(0x00ffff).setTitle("Fetching data..."))
     
    let player = await minecraft.players.get(resident)
      .catch(async error => {
        return await m.edit(
          error.message.includes("limit") ?
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("API Request Limit")
              .setDescription(`You have hit the request limit for this resident profile. Please wait a moment.`) :
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("Invalid Minecraft Username")
              .setDescription(`${resident} is not a Minecraft player!`)
        ).then(msg => fn.delPrompt(msg, message.author.id))
      })
    if (!player) return;

    let reslistres = await fetch("https://earthmc.net/data/residents.txt")
    let reslist = (await reslistres.text()).split("\n")
    if (reslist[0] == "<!DOCTYPE html>") return await message.channel.send(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("Connection Issues")
        .setDescription("We are having connection issues with the server. Please try again later.")
    ).then(msg => {
      m.delete()
      fn.delPrompt(msg, message.author.id)
    })
    if (!reslist.includes(player.username)) {
      return await m.edit(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("Resident Profile")
          .setDescription(`${player.username.replace(/_/g, "\\\_")} is not registered!`)
      ).then(msg => fn.delPrompt(msg, message.author.id))
    }
    
    let discordres = await fetch("https://canary.discordapp.com/api/guilds/219863747248914433/widget.json")
    let discorddata = await discordres.json()
    let discord = discorddata.members.find(user => user.nick == player.username || user.username == player.username)
    
    let townyres = await fetch(`https://earthmc.net/data/residents/${player.username}.txt`)
    let townRaw = (await townyres.text()).split(/\n+/g)
    if (townRaw[0] == "<!DOCTYPE html>") return await message.channel.send(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("Connection Issues")
        .setDescription("We are having connection issues with the server. Please try again later.")
    ).then(msg => {
      m.delete()
      fn.delPrompt(msg, message.author.id)
    })
    
    let towny = {}
    for (let i = 0; i < townRaw.length; i++) {
      if (!(typeof townRaw[i] == "string" && townRaw[i].length)) continue;
      let index = townRaw[i].split("=")[0],
          data = townRaw[i].split("=")[1]
      if (["town-ranks","nation-ranks","friends","protectionStatus"].includes(index)) towny[index] = data.split(",").filter(i => i.length)
      else if (data == "true") towny[index] = true
      else if (data == "false") towny[index] = false
      else towny[index] = data
    }
    
    let status
    if (indexData.online.towny && indexData.online.towny.find(u => u.account == player.username)) status = "Towny"
    if (indexData.online.fac && indexData.online.fac.find(u => u.account == player.username)) status = "Factions"
    if (indexData.online.classic && indexData.online.classic.find(u => u.account == player.username)) status = "Classic"
    
    let skin = await jimp.read(player.textures.skin_url)
    await skin.crop(8,8,8,8).resize(256, 256, jimp.RESIZE_NEAREST_NEIGHBOR).writeAsync('/app/data/temp.png')
    let skinImage = new Discord.Attachment('/app/data/temp.png')
    
    let embed = new Discord.RichEmbed()
      .setColor(0x00ffff)
      .setTitle(`Resident Profile | ${player.username.replace(/_/g, "\\\_")}`)
      .setThumbnail('attachment://temp.png')
      .addField(status ? "Status" : "Last Online", status ? `Online: ${status}` : `${fn.date(parseInt(towny.lastOnline))}\n${fn.ago(parseInt(towny.lastOnline))}`, true)
    if (towny.town) {
      let townres = await fetch(`https://earthmc.net/data/towns/${towny.town}.txt`)
      let townRaw = (await townres.text()).split('\n')
      
      let town = {}, nation = {}
      for (let i = 0; i < townRaw.length; i++) {
        if (!(typeof townRaw[i] == "string" && townRaw[i].length)) continue;
        town[townRaw[i].split("=")[0]] = townRaw[i].split("=")[1]
      }
      
      if (town.nation) {
        let nationres = await fetch(`https://earthmc.net/data/nations/${town.nation}.txt`)
        let nationRaw = (await nationres.text()).split('\n')
        
        for (let i = 0; i < nationRaw.length; i++) {
          if (!(typeof nationRaw[i] == "string" && nationRaw[i].length)) continue;
          nation[nationRaw[i].split("=")[0]] = nationRaw[i].split("=")[1]
        }
      }
      
      embed.addField("Town", towny.town.replace(/_/gi, " ") +
                            (town.nation ? ` (${town.nation.replace(/_/g, " ")})` : "") +
                            (town.mayor == player.username && nation.capital == town.name ? " <:king:613921246308073484>" :
                             town.mayor == player.username                                ? " <:mayor:613913166635597854>" : ""), true)
    }
    if (discord) embed.addField("Linked Discord Account", `<@${discord.id}>`, true)
    embed.setFooter(`Registered`, client.user.avatarURL)
      .setTimestamp(parseInt(towny.registered))
    
    await m.delete()
    await message.channel.send({files: [skinImage], embed: embed})
    // await m.delete().catch(() => {})
  }
}