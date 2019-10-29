const Discord = require('discord.js'),
      fetch = require('node-fetch')

module.exports = {
	name: "statistics",
	aliases: ["stats"],
	run: async (client, message, args, data) => {
    let m = await message.channel.send(new Discord.RichEmbed().setColor(0x00ffff).setTitle("Fetching data..."))
    
    let townList = (await (await fetch("https://earthmc.net/data/towns.txt")).text()).split('\n'),
        nationList = (await (await fetch("https://earthmc.net/data/nations.txt")).text()).split('\n'),
        residentList = (await (await fetch("https://earthmc.net/data/residents.txt")).text()).split('\n')
    
    m.edit(
      new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setTitle("Towny Statistics")
        .setThumbnail("https://earthmc.net/img/logo.png")
        .setDescription(`**Towns:** ${townList.length}\n**Nations:** ${nationList.length}\n**Residents:** ${residentList.length}`)
    )
	}
}