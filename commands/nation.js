const Discord = require('discord.js'),
			https = require('https'),
			striptags = require('striptags'),
      fetch = require("node-fetch")

const index = require('../index.js')

let fn = require('/app/bot/fn.js')

module.exports = {
  name: "nation",
  aliases: ["n"],
  run: async (client, message, args) => {
    let req = args.join(" ")
    if (!req.length) return message.channel.send(new Discord.RichEmbed().setColor(0x00ffff).setTitle("Command Usage").setDescription("`/nation <name>`\n`/nation list`"))
    let m = await message.channel.send(new Discord.RichEmbed().setColor(0x00ffff).setTitle("Fetching data..."))
    
    let listres = await fetch("https://earthmc.net/data/nations.txt")
    let nationList = (await listres.text()).split("\n")
    let name = nationList.find(n => n.toLowerCase() == req.toLowerCase().replace(/\s/gi, "_"))
    if (!name && args[0].toLowerCase() != "list") {
      await m.delete().catch(() => {})
      return await message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("Nation Information")
          .setDescription(`${req} is not registered!`)
      )
    }
    
    let townyres = await fetch(`https://earthmc.net/data/nations/${name}.txt`)
    let townRaw = (await townyres.text()).split(/\n+/gi)

    let mapres = await fetch('https://earthmc.net/map/tiles/_markers_/marker_earth.json')
    let mapdata = await mapres.json()

    let townData = mapdata.sets['towny.markerset'].areas
    let townNames = Object.keys(townData)
    let towns = []
    let nationsObj = {}, nations = []
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
        let n = info[0].split(" (")[1].slice(0, -1)
        if (n == "") continue;
        nationsObj[n].area += index.area(town.x, town.z, town.x.length)/16/16
        continue;
      }
      let thisTown = {
        area: index.area(town.x, town.z, town.x.length)/16/16,
        x: Math.round((Math.max(...town.x)+Math.min(...town.x))/2),
        z: Math.round((Math.max(...town.z)+Math.min(...town.z))/2),
        name: name,
        nation: info[0].split(" (")[1].slice(0, -1) == '' ? "No Nation" : info[0].split(" (")[1].slice(0, -1).replace(/_/gi, " ").trim(),
        mayor: info[1].slice(7),
        residents: info[2].slice(12).split(', ').length,
        flags: {
          capital: info[10].slice('capital: '.length),
        }
      }
      towns.push(thisTown)
      let nationName = info[0].split(" (")[1].slice(0, -1)
      if (nationName == '') continue
      if (!nationsObj[nationName]) nationsObj[nationName] = {name: nationName.replace(/_/gi, " "), towns: [], residents: 0, area: 0}
      if (thisTown.flags.capital == "true") nationsObj[nationName].towns.unshift(`**${thisTown.name}**`)
      else nationsObj[nationName].towns.push(thisTown.name)
      nationsObj[nationName].residents += thisTown.residents
      nationsObj[nationName].area += thisTown.area
      if (thisTown.flags.capital == "true") {
        nationsObj[nationName].capital = thisTown.name
        nationsObj[nationName].king = thisTown.mayor
        nationsObj[nationName].x = thisTown.x
        nationsObj[nationName].z = thisTown.z
      }
    }

    for (let j = 0; j < Object.keys(nationsObj).length; j++) {
      nations.push(nationsObj[Object.keys(nationsObj)[j]])
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

    nations.sort((a, b) => {
      if (b.residents > a.residents) return 1
      if (b.residents < a.residents) return -1

      if (b.area > a.area) return 1
      if (b.area < a.area) return -1

      if (b.name.toLowerCase() < a.name.toLowerCase()) return 1
      if (b.name.toLowerCase() > a.name.toLowerCase()) return -1

      return 0
    })

    if (nations.find(n => n.name.toLowerCase() == req.toLowerCase().replace(/_/gi, " ").trim())) {
      let nation = nations.find(n => n.name.toLowerCase() == req.toLowerCase().replace(/_/gi, " ").trim())
    
      let towny = {}
      for (let i = 0; i < townRaw.length; i++) {
        if (!(typeof townRaw[i] == "string" && townRaw[i].length)) continue;
        let index = townRaw[i].split("=")[0],
            data = townRaw[i].split("=")[1]
        if (["residents","allies","enemies","protectionStatus"].includes(index)) towny[index] = data.split(",").filter(i => i.length)
        else if (data == "true") towny[index] = true
        else if (data == "false") towny[index] = false
        else towny[index] = data
      }
      let embed = new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setTitle(`Nation Information | ${nation.name}${towny.tag ? ` (${towny.tag})` : ""}`)
        .setDescription(towny.nationBoard)
        .setThumbnail('https://earthmc.net/img/logo.png')
        .addField("Nation", `The ${nation.residents >= 40 ? "" :
                                   nation.residents >= 30 ? "Kingdom of " :
                                   nation.residents >= 20 ? "Dominion of " :
                                   nation.residents >= 10 ? "Federation of " : "Land of "}${nation.name}${nation.residents >= 60 ? " Realm" :
                                                                                                          nation.residents >= 40 ? " Empire" : ""}`, true)
        .addField("Ranking", nations.indexOf(nation)+1, true)
        .addField(`Town${nation.towns.length == 1 ? "" : "s"} [${nation.towns.length}]`, nation.towns.join(', '))
        .addField("King", `${nation.residents >= 60 ? "God Emperor" :
                             nation.residents >= 40 ? "Emperor" :
                             nation.residents >= 30 ? "King" :
                             nation.residents >= 20 ? "Duke" :
                             nation.residents >= 10 ? "Count" : "Leader"} ${nation.king.replace(/_/gi, "\\\_")}`, true)
        .addField("Location", `[${nation.x}, ${nation.z}](https://earthmc.net/map/?worldname=earth&mapname=flat&zoom=4&x=${nation.x}&y=64&z=${nation.z})`, true)
        .addField("Area", `${nation.area} chunk${nation.area == 1 ? "" : "s"}`, true)
        .addField(`Resident${nation.residents == 1 ? "" : "s"}`,  nation.residents, true)
        .setFooter(`Created`, client.user.avatarURL).setTimestamp(new Date(parseInt(towny.registered)))
      if (towny.allies.length) {
        let allies = towny.allies.join(', ').replace(/_/gi, " ")
        if (allies.length > 500) {
          allies = ""
          for (var i = 0; i < towny.allies.length; i++) {
            if (allies.length + towny.allies[i].length + 2 + (`and ${towny.allies.length-i-1} more...`).length <= 500) allies += `${towny.allies[i].replace(/_/gi, " ")}, `
            else {
              allies += `and ${towny.allies.length-i-1} more...`
              break;
            }
          }
        }
        embed.addField(`All${towny.allies.length == 1 ? "y" : "ies"} [${towny.allies.length}]`, allies)
      }
      if (towny.enemies.length) {
        let enemies = towny.enemies.join(', ').replace(/_/gi, " ")
        if (enemies.length > 500) {
          enemies = ""
          for (var i = 0; i < towny.enemies.length; i++) {
            if (enemies.length + towny.enemies[i].length + 2 + (`and ${towny.enemies.length-i-1} more...`).length <= 500) enemies += `${towny.enemies[i].replace(/_/gi, " ")}, `
            else {
              enemies += `and ${towny.enemies.length-i-1} more...`
              break;
            }
          }
        }
        embed.addField(`Enem${towny.enemies.length == 1 ? "y" : "ies"} [${towny.enemies.length}]`, enemies)
      }


      message.channel.send(embed)
    } else if (req.split(' ')[0] == 'list') {
      let allData = [""], i = 0, x = 0, page = 1
      if (req.split(' ')[1]) page = parseInt(req.split(' ')[1])
      if (isNaN(page)) page = 0
      else page--
      for (let j = 0; j < nations.length; j++) {
        let nation = nations[j]
        if (i++ == 10) {
          i = 1
          x++
          allData.push("")
        }
        allData[x] += `${nation.name} | ${nation.residents} | ${nation.area}\n`
      }

      let botembed = []

      for (i = 0; i < allData.length; i++) {
        botembed[i] = new Discord.RichEmbed()
          .setColor(0x00fffff)
          .setAuthor(`Nation List (Page ${i+1}/${allData.length})`, client.user.avatarURL)
          .setDescription("```" + allData[i] + "```")
          .setTimestamp()
          .setFooter(`Provided by EarthMC Live`, client.user.avatarURL)
      }

      message.channel.send(botembed[page])
        .then(msg => fn.paginator(message.author.id, msg, botembed, page))
    }
    await m.delete().catch(() => {})
  }
}