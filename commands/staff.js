const Discord = require('discord.js'),
      fs = require('fs'),
      fn = require("/app/bot/fn")

let commands = new Discord.Collection()

const commandFiles = fs.readdirSync('/app/commands/staff').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`/app/commands/staff/${file}`)
  commands.set(command.name, command)
}

module.exports = {
	name: "staff",
  aliases: ["editor"],
	run: async (client, message, {}, data) => {
    var args = message.content.trim().slice(data.commandName.length+2).split(/\s+/u)
    
		const commandName = args.shift().toLowerCase()
		const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return await message.channel.send(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("Invalid Command")
        .setDescription(`\`/${data.commandName} ${commandName}\` is not a valid command!`)
    )
    
		try {
			await command.run(client, message, args)
		} catch (error) {
			console.log(error)
		}
	}
}