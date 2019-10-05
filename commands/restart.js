const Discord = require('discord.js')

const fn = require('/app/bot/fn.js')

module.exports = {
	name: "restart",
	usage: "restart",
  aliases: ["reload"],
	run: async (client, message, args, data) => {
    if (message.author.id != '336389636878368770') return;
    
    await message.delete().catch(() => {})
    await message.channel.send(fn.embed(client, "Reloading EarthMC Live Bot..."))
    
    process.exit(2)
	}
}