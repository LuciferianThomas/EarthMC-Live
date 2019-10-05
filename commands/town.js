const Discord = require('discord.js'),
			https = require('https'),
			striptags = require('striptags'),
      fetch = require("node-fetch")

const index = require('../index.js')

let fn = require('/app/bot/fn.js')

module.exports = {
  name: "town",
  aliases: ["t"],
  run: async (client, message, args) => {
    let req = args.join(" ")
    if (!req.length) {
      // let discordres = await fetch("https://discordapp.com/api/guilds/219863747248914433/widget.json")
      // let discordlist = await discordres.json()
      // let playerlistres = await fetch("https://earthmc.net/data/residents.txt")
      // let playerlist = (await playerlistres.text()).split("\n")
      // if (discordlist.find(user => user.id == message.author.id) && discordlist.find(user => user.id == message.author.id).nick) {
      // } else 
      
      return message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("Command Usage")
          .setDescription("`/town <name>`\n`/town list`")
      )
    }
    let m = await message.channel.send(new Discord.RichEmbed().setColor(0x00ffff).setTitle("Fetching data..."))
    
    let listres = await fetch("https://earthmc.net/data/towns.txt")
    let townList = (await listres.text()).split("\n")
    let name = townList.find(n => n.toLowerCase() == req.toLowerCase().replace(/\s/gi, "_"))
    if (["here","leave","plots","new","add","kick","spawn","claim","unclaim",
         "withdraw","deposit","buy","delete","outlawlist","outlaw","outpost",
         "ranklist","rank","reslist","say","set","toggle","join"].includes(args[0].toLowerCase()))
      return message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("In-game Command")
          .setDescription("This command is only accessible in-game.")
      )
    
    if (!name && args[0].toLowerCase() != "list") {
      await m.delete().catch(() => {})
      return await message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("Town Information")
          .setDescription(`${req} is not registered!`)
      )
    }
    
    let townyres = await fetch(`https://earthmc.net/data/towns/${name}.txt`)
    let townRaw = (await townyres.text()).split(/\n+/gi)

    let mapres = await fetch('https://earthmc.net/map/tiles/_markers_/marker_earth.json')
    let mapdata = await mapres.json()

    let townData = mapdata.sets['towny.markerset'].areas
    let townNames = Object.keys(townData)
    let towns = []
    for (let i = 0; i < townNames.length; i++) {
      let town = townData[townNames[i]]
      let rawinfo = town.desc.split("<br />")
      let info = []
      rawinfo.forEach(x => {
        info.push(striptags(x))
      })
      let name = info[0].split(" (")[0].replace(/_/gi, " ").trim()
      if (name.endsWith("(Shop)")) continue;
      if (towns.find(town => town.name == name)) {
        towns[towns.indexOf(towns.find(town => town.name == name))].area += index.area(town.x, town.z, town.x.length)/16/16
        continue;
      }
      let thisTown = {
        area: index.area(town.x, town.z, town.x.length)/16/16,
        x: Math.round((Math.max(...town.x)+Math.min(...town.x))/2),
        z: Math.round((Math.max(...town.z)+Math.min(...town.z))/2),
        name: name,
        nation: info[0].split(" (")[1].slice(0, -1) == '' ? "No Nation" : info[0].split(" (")[1].slice(0, -1).replace(/_/gi, " ").trim(),
        mayor: info[1].slice(7),
        residents: info[2].slice(12).split(', '),
      }
      towns.push(thisTown)
    }

    towns.sort((a, b) => {
      if (b.residents.length > a.residents.length) return 1
      if (b.residents.length < a.residents.length) return -1

      if (b.area > a.area) return 1
      if (b.area < a.area) return -1

      if (b.name.toLowerCase() < a.name.toLowerCase()) return 1
      if (b.name.toLowerCase() > a.name.toLowerCase()) return -1

      return 0
    })

    if (towns.find(n => n.name.toLowerCase() == req.toLowerCase().replace(/_/gi, " ").trim())) {
      let town = towns.find(n => n.name.toLowerCase() == req.toLowerCase().replace(/_/gi, " ").trim())
    
      let towny = {}
      for (let i = 0; i < townRaw.length; i++) {
        if (!(typeof townRaw[i] == "string" && townRaw[i].length)) continue;
        let index = townRaw[i].split("=")[0],
            data = townRaw[i].split("=")[1]
        if (["residents","outlaws","homeBlock","protectionStatus"].includes(index)) towny[index] = data.split(",").filter(i => i.length)
        else if (data == "true") towny[index] = true
        else if (data == "false") towny[index] = false
        else towny[index] = data
      }
      // console.log(towny.registered)
      let embed = new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setTitle(`Town Information | ${town.name}${towny.tag ? ` (${towny.tag})` : ""}`)
        .setDescription(towny.townBoard)
        .setThumbnail('https://earthmc.net/img/logo.png')
        .addField("Town", `${town.name} (${town.residents.length >= 28 ? "Metropolis" :
                                           town.residents.length >= 24 ? "Large City" :
                                           town.residents.length >= 20 ? "City" :
                                           town.residents.length >= 14 ? "Large Town" :
                                           town.residents.length >= 10 ? "Town" :
                                           town.residents.length >= 6 ? "Village" :
                                           town.residents.length >= 2 ? "Hamlet" : "Settlement"})`, true)
        .addField("Nation", town.nation, true)
        .addField("Area", `${town.area} chunk${town.area == 1 ? "" : "s"}`, true)
        .addField("Location", `[${parseInt(towny.homeBlock[1])*16}, ${parseInt(towny.homeBlock[2])*16}](https://earthmc.net/map/?worldname=earth&mapname=flat&zoom=6&x=${parseInt(towny.homeBlock[1])*16}&y=64&z=${parseInt(towny.homeBlock[2])*16})`, true)
        .addField("Mayor", `${town.residents.length >= 28 ? "Lord" :
                              town.residents.length >= 24 ? "Duke" :
                              town.residents.length >= 20 ? "Earl" :
                              town.residents.length >= 14 ? "Count" :
                              town.residents.length >= 10 ? "Viscount" :
                              town.residents.length >= 6 ? "Baron" :
                              town.residents.length >= 2 ? "Chief" : "Hermit"} ${town.mayor.replace(/_/gi, "\\\_")}`, true)
        .addField("Ranking", towns.indexOf(town)+1, true)
        .addField(`Resident${town.residents.length == 1 ? "" : "s"} [${town.residents.length}]`, town.residents.join(', ').replace(/_/gi, "\\\_"))
      if (towny.outlaws.length) embed.addField(`Outlaw${towny.outlaws.length == 1 ? "" : "s"} [${towny.outlaws.length}]`, towny.outlaws.join(', ').replace(/_/gi, "\\\_"))
      embed.addField(`Permissions`, `\`Build: ${towny.protectionStatus.includes("residentBuild") ? "r" : "-"}${towny.protectionStatus.includes("allyBuild") ? "a" : "-"}${towny.protectionStatus.includes("outsiderBuild") ? "o" : "-"} `
                                  + `Destroy: ${towny.protectionStatus.includes("residentDestroy") ? "r" : "-"}${towny.protectionStatus.includes("allyDestroy") ? "a" : "-"}${towny.protectionStatus.includes("outsiderDestroy") ? "o" : "-"} `
                                  + `Switch: ${towny.protectionStatus.includes("residentSwitch") ? "r" : "-"}${towny.protectionStatus.includes("allySwitch") ? "a" : "-"}${towny.protectionStatus.includes("outsiderSwitch") ? "o" : "-"} `
                                  + `ItemUse: ${towny.protectionStatus.includes("residentItemUse") ? "r" : "-"}${towny.protectionStatus.includes("allyItemUse") ? "a" : "-"}${towny.protectionStatus.includes("outsiderItemUse") ? "o" : "-"}\``)
        .addField(`Flags`, `${towny.open ? "<:green_tick:597374070849404930>" : "<:red_tick:597374220267290624>"} **Open**\n`
                         // + `${towny.flags.capital == "true" ? "<:green_tick:597374070849404930>" : "<:red_tick:597374220267290624>"} **Capital**\n`
                         + `${towny.protectionStatus.includes("pvp") ? "<:green_tick:597374070849404930>" : "<:red_tick:597374220267290624>"} **PVP**\n`
                         + `${towny.protectionStatus.includes("mobs") ? "<:green_tick:597374070849404930>" : "<:red_tick:597374220267290624>"} **Mobs**\n`
                         + `${towny.protectionStatus.includes("explosion") ? "<:green_tick:597374070849404930>" : "<:red_tick:597374220267290624>"} **Explosion**\n`
                         + `${towny.protectionStatus.includes("fire") ? "<:green_tick:597374070849404930>" : "<:red_tick:597374220267290624>"} **Fire**\n`)
        .setTimestamp(new Date(parseInt(towny.registered)))
        .setFooter(`Created`, client.user.avatarURL)

      message.channel.send(embed)
    } else if (req.split(' ')[0] == 'list') {
        let allData = [""], i = 0, x = 0, page = 1
        if (req.split(' ')[1]) page = parseInt(req.split(' ')[1])
        if (isNaN(page)) page = 0
        else page--
        for (let j = 0; j < towns.length; j++) {
          let town = towns[j]
          if (i++ == 10) {
            i = 1
            x++
            allData.push("")
          }
          allData[x] += `${town.name} (${town.nation}) | ${town.residents.length} | ${town.area}\n`
        }

        let botembed = []

        for (i = 0; i < allData.length; i++) {
          botembed[i] = new Discord.RichEmbed()
            .setColor(0x00fffff)
            .setAuthor(`Town List (Page ${i+1}/${allData.length})`, client.user.avatarURL)
            .setDescription("```" + allData[i] + "```")
            .setTimestamp()
            .setFooter(`Provided by EarthMC Live`, client.user.avatarURL)
        }

        message.channel.send(botembed[page])
          .then(msg => fn.paginator(message.author.id, msg, botembed, page))

    } else message.channel.send(new Discord.RichEmbed().setColor(0x00ffff).setTitle(`${req} is not registered!`))
    await m.delete().catch(() => {})
  }
}