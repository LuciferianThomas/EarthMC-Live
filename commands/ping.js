const Discord = require('discord.js'),
			db = require('quick.db')

const allData = new db.table('allData')

const fn = require('/app/bot/fn.js')

module.exports = {
	name: "ping",
  aliases: ["message"],
	run: async (client, message, args) => {
  	if (message.guild.id != "569991565498515489" || !message.member.roles.find(r => r.name == 'Staff')) return;

		    let roles = []

		for (let i = 0; i < args.length; i++) {
      let role = fn.getRole(message.guild, args[i])
      if (!role) {
        message.channel.send(fn.embed(client, `${args[i]} is not a role!`))
        continue;
      }
      roles.push(role)
    }

		for (let i = 0; i < roles.length; i++) await roles[i].setMentionable(true).catch(console.error)

		await message.channel.send(`${roles.map(r => `${r}`).join(' ')}`)

		for (let i = 0; i < roles.length; i++) await roles[i].setMentionable(false).catch(console.error)
  
  }
}