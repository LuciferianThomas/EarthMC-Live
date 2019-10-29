const Discord = require("discord.js"),
  https = require("https"),
  striptags = require("striptags"),
  fetch = require("node-fetch"),
  Minecraft = require("minecraft-lib")

const index = require("../index.js")

let fn = require("/app/bot/fn.js")

module.exports = {
  name: "nation",
  aliases: ["n"],
  run: async (client, message, args) => {
    let req = args.join(" ")
    if (!req.length)
      return await message.channel
        .send(
          new Discord.RichEmbed()
            .setColor(0x00ffff)
            .setTitle("Command Usage")
            .setDescription("`/nation <name>`\n`/nation list`")
        )
        .then(msg => fn.delPrompt(msg, message.author.id))

    let listres = await fetch("https://earthmc.net/data/nations.txt")
    let nationList = (await listres.text()).split("\n")
    if (nationList[0] == "<!DOCTYPE html>")
      return await message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle("Connection Issues")
          .setDescription(
            "We are having connection issues with the server. Please try again later."
          )
      )
    let name = nationList.find(
      n => n.toLowerCase() == req.toLowerCase().replace(/\s/gi, "_")
    )
    if (
      [
        "online",
        "leave",
        "withdraw",
        "deposit",
        "new",
        "rank",
        "add",
        "kick",
        "delete",
        "ally",
        "enemy",
        "rank",
        "set",
        "toggle"
      ].includes(args.join(" ").toLowerCase())
    ) {
      return await message.channel
        .send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("In-game Command")
            .setDescription(
              `\`/nation ${args[0].toLowerCase()}\` is only accessible in-game.\nIf you want to send the command as text, add backticks \\\`\\\` around the text (i.e. \\\`/nation ${args[0].toLowerCase()}\\\`)!`
            )
        )
        .then(msg => fn.delPrompt(msg, message.author.id))
    }

    if (!name && args[0].toLowerCase() != "list") {
      return await message.channel
        .send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Nation Information")
            .setDescription(`${req} is not registered!`)
        )
        .then(msg => fn.delPrompt(msg, message.author.id))
    }

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
      let nationsObj = {},
          nations = []
      
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
          let n = info[0].split(" (")[1].slice(0, -1)
          if (n == "") continue
          nationsObj[n].area +=
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
          residents: info[2].slice(12).split(", ").length,
          flags: {
            capital: info[10].slice("capital: ".length)
          }
        }
        towns.push(thisTown)
        let nationName = info[0].split(" (")[1].slice(0, -1)
        if (nationName == "") continue
        if (!nationsObj[nationName])
          nationsObj[nationName] = {
            name: nationName.replace(/_/gi, " "),
            towns: [],
            residents: 0,
            area: 0
          }
        if (thisTown.flags.capital == "true")
          nationsObj[nationName].towns.unshift(`**${thisTown.name}**`)
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

      let allData = [""],
        i = 0,
        x = 0,
        page = 1
      if (req.split(" ")[1]) page = parseInt(req.split(" ")[1])
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
          .setAuthor(`Nation Information | Nation List`, client.user.avatarURL)
          .setDescription("```" + allData[i] + "```")
          .setTimestamp()
          .setFooter(`Page ${i + 1}/${allData.length}`, client.user.avatarURL)
      }
      
      return await m
        .edit(botembed[page])
        .then(msg => fn.paginator(message.author.id, msg, botembed, page))
    }

    let townyres = await fetch(`https://earthmc.net/data/nations/${name}.txt`)
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
          data = townRaw[i].split("=")[1].replace(/_/g, " ")
      if (["towns", "allies", "enemies", "protectionStatus"].includes(index))
        towny[index] = data.split(",").filter(i => i.length)
      else if (data == "true") towny[index] = true
      else if (data == "false") towny[index] = false
      else towny[index] = data
    }
    towny.towns.splice(towny.towns.indexOf(towny.capital), 1)
    towny.towns.unshift(`**${towny.capital}**`)
    name = name.replace(/_/g, " ")

    let embed = new Discord.RichEmbed()
      .setColor(0x00ffff)
      .setTitle(
        `Nation Information | ${name}${towny.tag ? ` (${towny.tag})` : ""}`
      )
      .setDescription(towny.nationBoard)
      .setThumbnail("https://earthmc.net/img/logo.png")
      .addField("Nation", `${name}`, true)
      .addField("Ranking", "Calculating...", true)
      .addField(
        `Town${towny.towns.length == 1 ? "" : "s"} [${towny.towns.length}]`,
        towny.towns.join(", ")
      )
      .addField("King", "Checking...", true)
      .addField("Location", "Checking...", true)
      .addField("Area", "Calculating...", true)
      .addField("Residents", "Calculating...", true)
      .setFooter(`Created`, client.user.avatarURL)
      .setTimestamp(new Date(parseInt(towny.registered)))
    if (towny.allies.length) {
      let allies = towny.allies.join(", ").replace(/_/gi, " ")
      if (allies.length > 500) {
        allies = ""
        for (var i = 0; i < towny.allies.length; i++) {
          if (
            allies.length +
              towny.allies[i].length +
              2 +
              `and ${towny.allies.length - i - 1} more...`.length <=
            500
          )
            allies += `${towny.allies[i].replace(/_/gi, " ")}, `
          else {
            allies += `and ${towny.allies.length - i - 1} more...`
            break
          }
        }
      }
      embed.addField(
        `All${towny.allies.length == 1 ? "y" : "ies"} [${towny.allies.length}]`,
        allies
      )
    }
    if (towny.enemies.length) {
      let enemies = towny.enemies.join(", ").replace(/_/gi, " ")
      if (enemies.length > 500) {
        enemies = ""
        for (var i = 0; i < towny.enemies.length; i++) {
          if (
            enemies.length +
              towny.enemies[i].length +
              2 +
              `and ${towny.enemies.length - i - 1} more...`.length <=
            500
          )
            enemies += `${towny.enemies[i].replace(/_/gi, " ")}, `
          else {
            enemies += `and ${towny.enemies.length - i - 1} more...`
            break
          }
        }
      }
      embed.addField(
        `Enem${towny.enemies.length == 1 ? "y" : "ies"} [${
          towny.enemies.length
        }]`,
        enemies
      )
    }

    await m.edit(embed)

    let mapres = await fetch(
      "https://earthmc.net/map/tiles/_markers_/marker_earth.json"
    )
    let mapdata = await mapres.json().catch(() => {})
    if (!mapdata) {
//       let capitalres = await fetch(`https://earthmc.net/data/towns/${towny.capital.replace}`)
//       embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Area"))].value = "Unavailable"
//       embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Ranking"))].value = "Unavailable"

//       m.edit(embed)
    }

    let townData = mapdata.sets["towny.markerset"].areas
    let townNames = Object.keys(townData)
    let towns = []
    let nationsObj = {},
      nations = []
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
        let n = info[0].split(" (")[1].slice(0, -1)
        if (n == "") continue
        nationsObj[n].area +=
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
        residents: info[2].slice(12).split(", ").length,
        flags: {
          capital: info[10].slice("capital: ".length)
        }
      }
      towns.push(thisTown)
      let nationName = info[0].split(" (")[1].slice(0, -1)
      if (nationName == "") continue
      if (!nationsObj[nationName])
        nationsObj[nationName] = {
          name: nationName.replace(/_/gi, " "),
          towns: [],
          residents: 0,
          area: 0
        }
      if (thisTown.flags.capital == "true")
        nationsObj[nationName].towns.unshift(`**${thisTown.name}**`)
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

    if (
      nations.find(
        n =>
          n.name.toLowerCase() ==
          req
            .toLowerCase()
            .replace(/_/gi, " ")
            .trim()
      )
    ) {
      let nation = nations.find(
        n =>
          n.name.toLowerCase() ==
          req
            .toLowerCase()
            .replace(/_/gi, " ")
            .trim()
      )

      let embed = new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setTitle(
          `Nation Information | ${name}${towny.tag ? ` (${towny.tag})` : ""}`
        )
        .setDescription(towny.nationBoard)
        .setThumbnail("https://earthmc.net/img/logo.png")
        .addField(
          "Nation",
          `The ${
            nation.residents >= 40
              ? ""
              : nation.residents >= 30
              ? "Kingdom of "
              : nation.residents >= 20
              ? "Dominion of "
              : nation.residents >= 10
              ? "Federation of "
              : "Land of "
          }${name}${
            nation.residents >= 60
              ? " Realm"
              : nation.residents >= 40
              ? " Empire"
              : ""
          }`,
          true
        )
        .addField("Ranking", nations.indexOf(nation) + 1, true)
        .addField(
          `Town${towny.towns.length == 1 ? "" : "s"} [${towny.towns.length}]`,
          towny.towns.join(", ")
        )
        .addField(
          "King",
          `${
            nation.residents >= 60
              ? "God Emperor"
              : nation.residents >= 40
              ? "Emperor"
              : nation.residents >= 30
              ? "King"
              : nation.residents >= 20
              ? "Duke"
              : nation.residents >= 10
              ? "Count"
              : "Leader"
          } ${nation.king.replace(/_/gi, "\\_")}`,
          true
        )
        .addField(
          "Location",
          `[${nation.x}, ${nation.z}](https://earthmc.net/map/?worldname=earth&mapname=flat&zoom=4&x=${nation.x}&y=64&z=${nation.z})`,
          true
        )
        .addField(
          "Area",
          `${nation.area} chunk${nation.area == 1 ? "" : "s"}`,
          true
        )
        .addField(
          `Resident${nation.residents == 1 ? "" : "s"}`,
          nation.residents,
          true
        )
        .setFooter(`Created`, client.user.avatarURL)
        .setTimestamp(new Date(parseInt(towny.registered)))
      if (towny.allies.length) {
        let allies = towny.allies.join(", ").replace(/_/gi, " ")
        if (allies.length > 500) {
          allies = ""
          for (var i = 0; i < towny.allies.length; i++) {
            if (
              allies.length +
                towny.allies[i].length +
                2 +
                `and ${towny.allies.length - i - 1} more...`.length <=
              500
            )
              allies += `${towny.allies[i].replace(/_/gi, " ")}, `
            else {
              allies += `and ${towny.allies.length - i - 1} more...`
              break
            }
          }
        }
        embed.addField(
          `All${towny.allies.length == 1 ? "y" : "ies"} [${
            towny.allies.length
          }]`,
          allies
        )
      }
      if (towny.enemies.length) {
        let enemies = towny.enemies.join(", ").replace(/_/gi, " ")
        if (enemies.length > 500) {
          enemies = ""
          for (var i = 0; i < towny.enemies.length; i++) {
            if (
              enemies.length +
                towny.enemies[i].length +
                2 +
                `and ${towny.enemies.length - i - 1} more...`.length <=
              500
            )
              enemies += `${towny.enemies[i].replace(/_/gi, " ")}, `
            else {
              enemies += `and ${towny.enemies.length - i - 1} more...`
              break
            }
          }
        }
        embed.addField(
          `Enem${towny.enemies.length == 1 ? "y" : "ies"} [${
            towny.enemies.length
          }]`,
          enemies
        )
      }
      // embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Area"))].value = `${nation.area} chunk${nation.area == 1 ? "" : "s"}`
      // embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Ranking"))].value = nations.indexOf(nation) + 1
      // embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "King"))].value = `${
      //   nation.residents >= 60
      //     ? "God Emperor"
      //     : nation.residents >= 40
      //     ? "Emperor"
      //     : nation.residents >= 30
      //     ? "King"
      //     : nation.residents >= 20
      //     ? "Duke"
      //     : nation.residents >= 10
      //     ? "Count"
      //     : "Leader"
      // } ${nation.king.replace(/_/gi, "\\_")}`
      // embed.fields[embed.fields.indexOf(embed.fields.find(field => field.name == "Name"))].value = `The ${
      //   nation.residents >= 40
      //     ? ""
      //     : nation.residents >= 30
      //     ? "Kingdom of "
      //     : nation.residents >= 20
      //     ? "Dominion of "
      //     : nation.residents >= 10
      //     ? "Federation of "
      //     : "Land of "
      // }${name}${
      //   nation.residents >= 60
      //     ? " Realm"
      //     : nation.residents >= 40
      //     ? " Empire"
      //     : ""
      // }`

      m.edit(embed)
    }
  }
}
