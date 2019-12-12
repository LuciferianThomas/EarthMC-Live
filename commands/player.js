const Discord = require('discord.js'),
			https = require('https'),
			striptags = require('striptags'),
      minecraft = require('minecraft-lib'),
      jimp = require('jimp')

const index = require('../index.js')

module.exports = {
  name: "player(dep)",
  aliases: ["pl(dep)"],
  run: async (client, message, args, indexData) => {
    let resident = args[0]
    if (!resident) return message.channel.send(new Discord.RichEmbed().setColor(0x00ffff).setTitle("Command Usage").setDescription("`$player <name>`"))
    let m = await message.channel.send(new Discord.RichEmbed().setColor(0x00ffff).setTitle("Fetching data..."))
     
    minecraft.players.get(resident).then(async player => {
      let skin = await jimp.read(player.textures.skin_url)
      await skin.crop(8,8,8,8).resize(256, 256, jimp.RESIZE_NEAREST_NEIGHBOR).writeAsync('/app/data/temp.png')
      let skinImage = new Discord.Attachment('/app/data/temp.png')
      
      var req = https.request({
        host: 'earthmc.net',
        path: '/map/tiles/_markers_/marker_earth.json'
      }, res => {
        var data = ''
        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          if (!data.startsWith("{")) return;
          data = JSON.parse(data);

          let townData = data.sets['towny.markerset'].areas
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
            let name = info[0].split(" (")[0]
            if (name.endsWith("(Shop)")) continue;
            let thisTown = {
              area: index.area(town.x, town.z, town.x.length)/16/16,
              x: town.x[0],
              z: town.z[0],
              name: name.replace(/_/gi, " ").trim(),
              nation: info[0].split(" (")[1].slice(0, -1) == '' ? "No Nation" : info[0].split(" (")[1].slice(0, -1).replace(/_/gi, " ").trim(),
              mayor: info[1].slice(7),
              residents: info[2].slice(12).split(', '),
              flags: {
                hasUpkeep: info[4].slice('hasUpkeep: '.length),
                pvp: info[5].slice('pvp: '.length),
                mobs: info[6].slice('mobs: '.length),
                public: info[7].slice('public: '.length),
                explosion: info[8].slice('explosion: '.length),
                fire: info[9].slice('fire: '.length),
                capital: info[10].slice('capital: '.length),
              }
            }
            towns.push(thisTown)
            let nationName = info[0].split(" (")[1].slice(0, -1)
            if (nationName == '') continue
            if (!nationsObj[nationName]) nationsObj[nationName] = {name: nationName.replace(/_/gi, " "), towns: [], residents: 0, area: 0}
            nationsObj[nationName].towns.push(thisTown.name)
            nationsObj[nationName].residents += thisTown.residents.length
            nationsObj[nationName].area += thisTown.area
            if (thisTown.flags.capital == "true") {
              nationsObj[nationName].capital = thisTown.name
              nationsObj[nationName].king = thisTown.mayor
              nationsObj[nationName].x = thisTown.x
              nationsObj[nationName].z = thisTown.z
            }
          }

          for (let j = 0; j < Object.keys(nationsObj).length; j++) nations.push(nationsObj[Object.keys(nationsObj)[j]])

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

          let resTown = towns.find(t => t.residents.includes(player.username))
          if (!resTown) resTown = {name: 'No Town', nation: 'No Nation', flags: {}}
          let resNation = resTown.nation

          let status
          if (indexData.online.towny && indexData.online.towny.find(u => u.account == player.username)) status = "Towny"
          //if (indexData.online.fac.find(u => u.account == player.username)) status = "Factions"
          //if (indexData.online.classic.find(u => u.account == player.username)) status = "Classic"

          let embed = new Discord.RichEmbed()
            .setColor(0x00ffff)
            .setTitle(`User Information | ${player.username.replace(/_/gi, "\\\_")}`)
            .setThumbnail('attachment://temp.png')
            .addField("Status", status ? `Online: ${status}` : "Offline", true)
            .addField("Town", `${resTown.name}${resTown.mayor == player.username ? " <:mayor:613913166635597854>" : ""}`, true)
            .addField("Nation", `${resNation}${resTown.mayor == player.username && resTown.flags.capital == "true" ? " <:king:613921246308073484>" : ""}`, true)
            .setFooter(`Provided by EarthMC Live • Requested by ${message.author.tag}`, client.user.avatarURL)

          message.channel.send({files: [skinImage], embed: embed})

          m.delete()
        })
      })

      req.on('error', e => {
        console.log(e.message)
      });

      req.end()
    }).catch(error => {
      console.log(error)
      m.delete()
      return message.channel.send(
        new Discord.RichEmbed()
          .setColor(0x00ffff)
          .setTitle("User not found")
          .setDescription(`${resident} is not a valid Minecraft player!`)
      )
    })
  }
}