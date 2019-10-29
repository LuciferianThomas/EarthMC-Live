const Discord = require("discord.js"),
  https = require("https"),
  striptags = require("striptags"),
  fetch = require("node-fetch"),
  Minecraft = require("minecraft-lib")

const index = require("../index.js")

let fn = require("/app/bot/fn.js")

module.exports = {
  name: "town",
  aliases: ["t"],
  run: async (client, message, args) => {
    let req = args.join(" ")
    if (!req) {
      // let discordres = await fetch("https://discordapp.com/api/guilds/219863747248914433/widget.json")
      // let discordlist = await discordres.json()
      // let playerlistres = await fetch("https://earthmc.net/data/residents.txt")
      // let playerlist = (await playerlistres.text()).split("\n")
      // if (discordlist.find(user => user.id == message.author.id) && discordlist.find(user => user.id == message.author.id).nick) {
      // } else

      return await message.channel
        .send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Command Usage")
            .setDescription("`/town <name>`\n`/town list`")
        )
        .then(msg => fn.delPrompt(msg, message.author.id))
    }

    /*let serverdata = await Minecraft.servers
      .get("dc-f626de6d73b7.earthmc.net", 25577)
      .catch(() => {})
    if (!serverdata)
      return await message.channel
        .send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Connection Issues")
            .setDescription(
              "We are currently unable to ping the server.\nThis may be caused by the server being offline or a network issue.\nPlease try again later."
            )
        )
        .then(msg => fn.delPrompt(msg, message.author.id))*/

    let listres = await fetch("https://earthmc.net/data/towns.txt")
    let townList = (await listres.text()).split("\n")
    if (townList[0] == "<!DOCTYPE html>")
      return await message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("Connection Issues")
          .setDescription(
            "We are having connection issues with the server. Please try again later."
          )
      )
    let name = townList.find(
      n => n.toLowerCase() == req.toLowerCase().replace(/\s/gi, "_")
    )
    if (
      [
        "here", "leave", "plots", "new", "add", "kick", "spawn", "claim", "unclaim", "withdraw", "deposit", "buy",
        "delete", "outlawlist", "outlaw", "outpost", "ranklist", "rank", "reslist", "say", "set", "toggle", "join"
      ].includes(args.join(" ").toLowerCase())
    ) {
      return await message.channel
        .send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("In-game Command")
            .setDescription(
              `\`/town ${args[0].toLowerCase()}\` is only accessible in-game.\nIf you want to send the command as text, add backticks \\\`\\\` around the text (i.e. \\\`/town ${args[0].toLowerCase()}\\\`)!`
            )
        )
        .then(msg => fn.delPrompt(msg, message.author.id))
    }

    if (!name && args[0].toLowerCase() != "list")
      return await message.channel
        .send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Town Information")
            .setDescription(`${req} is not registered!`)
        )
        .then(msg => fn.delPrompt(msg, message.author.id))

    let m = await message.channel.send(
      new Discord.RichEmbed().setColor(0x00ffff).setTitle("Fetching data...")
    )

    if (args[0].toLowerCase() == "list") {
      let mapres = await fetch(
        "https://earthmc.net/map/tiles/_markers_/marker_earth.json"
      )
      let mapdata = await mapres.json().catch(() => {})
      if (!mapdata)
        return await message.channel
          .send(
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("Connection Issues")
              .setDescription(
                "We are currently unable to fetch the nation information. Please try again later."
              )
          )
          .then(msg => {
            m.delete()
            fn.delPrompt(msg, message.author.id)
          })

      let townData = mapdata.sets["towny.markerset"].areas
      let townNames = Object.keys(townData)
      let towns = []
      for (let i = 0; i < townNames.length; i++) {
        let town = townData[townNames[i]]
        let rawinfo = town.desc.split("<br />")
        let info = []
        rawinfo.forEach(x => {
          info.push(striptags(x))
        })
        let name = info[0]
          .split(" (")[0]
          .replace(/_/gi, " ")
          .trim()
        if (name.endsWith("(Shop)")) continue
        if (towns.find(town => town.name == name)) {
          towns[towns.indexOf(towns.find(town => town.name == name))].area +=
            index.area(town.x, town.z, town.x.length) / 16 / 16
          continue
        }
        let thisTown = {
          area: index.area(town.x, town.z, town.x.length) / 16 / 16,
          x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
          z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
          name: name,
          nation:
            info[0].split(" (")[1].slice(0, -1) == ""
              ? "No Nation"
              : info[0]
                  .split(" (")[1]
                  .slice(0, -1)
                  .replace(/_/gi, " ")
                  .trim(),
          mayor: info[1].slice(7),
          residents: info[2].slice(12).split(", ")
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

      let allData = [""],
        i = 0,
        x = 0,
        page = 1
      if (req.split(" ")[1]) page = parseInt(req.split(" ")[1])
      if (isNaN(page)) page = 0
      else page--
      for (let j = 0; j < towns.length; j++) {
        let town = towns[j]
        if (i++ == 10) {
          i = 1
          x++
          allData.push("")
        }
        allData[
          x
        ] += `${town.name} (${town.nation}) | ${town.residents.length} | ${town.area}\n`
      }

      let botembed = []

      for (i = 0; i < allData.length; i++) {
        botembed[i] = new Discord.RichEmbed()
          .setColor(0x00fffff)
          .setAuthor(`Town Information | Town List`, client.user.avatarURL)
          .setDescription("```" + allData[i] + "```")
          .setTimestamp()
          .setFooter(`Page ${i + 1}/${allData.length}`, client.user.avatarURL)
      }
      return await m
        .edit(botembed[page])
        .then(msg => fn.paginator(message.author.id, msg, botembed, page))
    }

    let townyres = await fetch(`https://earthmc.net/data/towns/${name}.txt`)
    let townRaw = (await townyres.text()).split(/\n+/gi)
    if (townRaw[0] == "<!DOCTYPE html>")
      return await message.channel
        .send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Connection Issues")
            .setDescription(
              "We are having connection issues with the server. Please try again later."
            )
        )
        .then(msg => {
          m.delete()
          fn.delPrompt(msg, message.author.id)
        })

    let towny = {}
    for (let i = 0; i < townRaw.length; i++) {
      if (!(typeof townRaw[i] == "string" && townRaw[i].length)) continue
      let index = townRaw[i].split("=")[0],
        data = townRaw[i].split("=")[1]
      if (index != "residents" && index != "mayor") data = data.replace(/_/g, " ")
      if (
        ["residents", "outlaws", "homeBlock", "protectionStatus"].includes(
          index
        )
      )
        towny[index] = data.split(",").filter(i => i.length)
      else if (data == "true") towny[index] = true
      else if (data == "false") towny[index] = false
      else towny[index] = data
    }
    if (!towny.nation) towny.nation = "No Nation"

    let embed = new Discord.RichEmbed()
      .setColor(0x00ffff)
      .setTitle(
        `Town Information | ${towny.name}${towny.tag ? ` (${towny.tag})` : ""}`
      )
      .setDescription(towny.townBoard)
      .setThumbnail("https://earthmc.net/img/logo.png")
      .addField(
        "Town",
        `${towny.name} (${
          towny.residents.length >= 28
            ? "Metropolis"
            : towny.residents.length >= 24
            ? "Large City"
            : towny.residents.length >= 20
            ? "City"
            : towny.residents.length >= 14
            ? "Large Town"
            : towny.residents.length >= 10
            ? "Town"
            : towny.residents.length >= 6
            ? "Village"
            : towny.residents.length >= 2
            ? "Hamlet"
            : "Settlement"
        })`,
        true
      )
      .addField("Nation", towny.nation, true)
      .addField("Area", "Calculating...", true)
      .addField(
        "Location",
        `[${parseInt(towny.homeBlock[1]) * 16}, ${parseInt(towny.homeBlock[2]) *
          16}](https://earthmc.net/map/?worldname=earth&mapname=flat&zoom=6&x=${parseInt(
          towny.homeBlock[1]
        ) * 16}&y=64&z=${parseInt(towny.homeBlock[2]) * 16})`,
        true
      )
      .addField(
        "Mayor",
        `${
          towny.residents.length >= 28
            ? "Lord"
            : towny.residents.length >= 24
            ? "Duke"
            : towny.residents.length >= 20
            ? "Earl"
            : towny.residents.length >= 14
            ? "Count"
            : towny.residents.length >= 10
            ? "Viscount"
            : towny.residents.length >= 6
            ? "Baron"
            : towny.residents.length >= 2
            ? "Chief"
            : "Hermit"
        } ${towny.mayor.replace(/_/gi, "\\_")}`,
        true
      )
      .addField("Ranking", "Calculating...", true)
      .addField(
        `Resident${towny.residents.length == 1 ? "" : "s"} [${
          towny.residents.length
        }]`,
        towny.residents.join(", ").replace(/_/gi, "\\_")
      )
    if (towny.outlaws.length)
      embed.addField(
        `Outlaw${towny.outlaws.length == 1 ? "" : "s"} [${
          towny.outlaws.length
        }]`,
        towny.outlaws.join(", ").replace(/_/gi, "\\_")
      )
    embed
      .addField(
        `Permissions`,
        `\`Build: ${
          towny.protectionStatus.includes("residentBuild") ? "r" : "-"
        }${towny.protectionStatus.includes("allyBuild") ? "a" : "-"}${
          towny.protectionStatus.includes("outsiderBuild") ? "o" : "-"
        } ` +
          `Destroy: ${
            towny.protectionStatus.includes("residentDestroy") ? "r" : "-"
          }${towny.protectionStatus.includes("allyDestroy") ? "a" : "-"}${
            towny.protectionStatus.includes("outsiderDestroy") ? "o" : "-"
          } ` +
          `Switch: ${
            towny.protectionStatus.includes("residentSwitch") ? "r" : "-"
          }${towny.protectionStatus.includes("allySwitch") ? "a" : "-"}${
            towny.protectionStatus.includes("outsiderSwitch") ? "o" : "-"
          } ` +
          `ItemUse: ${
            towny.protectionStatus.includes("residentItemUse") ? "r" : "-"
          }${towny.protectionStatus.includes("allyItemUse") ? "a" : "-"}${
            towny.protectionStatus.includes("outsiderItemUse") ? "o" : "-"
          }\``
      )
      .addField(
        `Flags`,
        `${
          towny.open
            ? "<:green_tick:597374070849404930>"
            : "<:red_tick:597374220267290624>"
        } **Open**\n` +
          // + `${towny.flags.capital == "true" ? "<:green_tick:597374070849404930>" : "<:red_tick:597374220267290624>"} **Capital**\n`
          `${
            towny.protectionStatus.includes("pvp")
              ? "<:green_tick:597374070849404930>"
              : "<:red_tick:597374220267290624>"
          } **PVP**\n` +
          `${
            towny.protectionStatus.includes("mobs")
              ? "<:green_tick:597374070849404930>"
              : "<:red_tick:597374220267290624>"
          } **Mobs**\n` +
          `${
            towny.protectionStatus.includes("explosion")
              ? "<:green_tick:597374070849404930>"
              : "<:red_tick:597374220267290624>"
          } **Explosion**\n` +
          `${
            towny.protectionStatus.includes("fire")
              ? "<:green_tick:597374070849404930>"
              : "<:red_tick:597374220267290624>"
          } **Fire**\n`
      )
      .setTimestamp(new Date(parseInt(towny.registered)))
      .setFooter(`Created`, client.user.avatarURL)
    
    await m.edit(embed)
    
    // embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Location"))].value = "1"
    // console.log(embed)

    let mapres = await fetch(
      "https://earthmc.net/map/tiles/_markers_/marker_earth.json"
    )
    let mapdata = await mapres.json().catch(() => {})
    if (!mapdata) {
      embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Area"))].value = "Unavailable"
      embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Ranking"))].value = "Unavailable"

      return await m.edit(embed)
    }

    let townData = mapdata.sets["towny.markerset"].areas
    let townNames = Object.keys(townData)
    let towns = []
    for (let i = 0; i < townNames.length; i++) {
      let town = townData[townNames[i]]
      let rawinfo = town.desc.split("<br />")
      let info = []
      rawinfo.forEach(x => {
        info.push(striptags(x))
      })
      let name = info[0]
        .split(" (")[0]
        .replace(/_/gi, " ")
        .trim()
      if (name.endsWith("(Shop)")) continue
      if (towns.find(town => town.name == name)) {
        towns[towns.indexOf(towns.find(town => town.name == name))].area +=
          index.area(town.x, town.z, town.x.length) / 16 / 16
        continue
      }
      let thisTown = {
        area: index.area(town.x, town.z, town.x.length) / 16 / 16,
        x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
        z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
        name: name,
        nation:
          info[0].split(" (")[1].slice(0, -1) == ""
            ? "No Nation"
            : info[0]
                .split(" (")[1]
                .slice(0, -1)
                .replace(/_/gi, " ")
                .trim(),
        mayor: info[1].slice(7),
        residents: info[2].slice(12).split(", ")
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

    if (
      towns.find(
        n =>
          n.name.toLowerCase() ==
          req
            .toLowerCase()
            .replace(/_/gi, " ")
            .trim()
      )
    ) {
      let town = towns.find(
        n =>
          n.name.toLowerCase() ==
          req
            .toLowerCase()
            .replace(/_/gi, " ")
            .trim()
      )
      
      embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Area"))].value = `${town.area} chunk${town.area == 1 ? "" : "s"}`
      embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Ranking"))].value = towns.indexOf(town) + 1

      return await m.edit(embed)
    }
  }
}
