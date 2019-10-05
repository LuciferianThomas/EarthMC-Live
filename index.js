require('es6-shim')

const Discord = require('discord.js'),
			fs = require("fs"),
			http = require('http'),
			https = require('https'),
			express = require('express'),
			striptags = require('striptags'),
			moment = require('moment'),
      db = require('quick.db'),
      allData = new db.table('allData')

let time = (t) => {
	return moment(t).utcOffset(8).format("YYYY/MM/DD HH:mm:ss")
}

const app = express()
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT, function() {
  setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`)
  }, 225000)
});

var towny = 0, classic = 0, fac = 0, server = 0, queue, update, online = {}, subs = allData.get('qsub')

var townyop = {
	host: 'earthmc.net',
	path: '/map/up/world/earth/'
}

var classicop = {
	host: 'earthmc.net',
	path: '/classicmap/up/world/earth/'
}

var facop = {
	host: 'earthmc.net',
	path: '/map/factions/up/world/earth/'
}

var servop = {
	host: 'minecraft-mp.com',
	path: '/server-s133301'
}

setInterval(function () {
	var townyreq = https.request(townyop, res => {
		var data = '';
		res.on('data', chunk => {
			data += chunk
		})

		res.on('end', () => {
			if (!data.startsWith("{")) return;
			data = JSON.parse(data)
			towny = data.currentcount
			online.towny = data.players
		})
	})

	townyreq.on('error', e => {
		console.log(e.message)
	})

	townyreq.end()
  
	var classicreq = https.request(classicop, res => {
		var data = '';
		res.on('data', chunk => {
			data += chunk
		})

		res.on('end', () => {
			if (!data.startsWith("{")) return;
			data = JSON.parse(data)
			classic = data.currentcount
			online.classic = data.players
		})
	})

	classicreq.on('error', e => {
		console.log(e.message)
	})

	classicreq.end()

	var facreq = https.request(facop, res => {
		var data = ''
		res.on('data', chunk => {
			data += chunk
		})

		res.on('end', () => {
			if (!data.startsWith("{")) return;
			data = JSON.parse(data)
			fac = data.currentcount
			online.fac = data.players
		})
	})

	facreq.on('error', e => {
		console.log(e.message)
	})

	facreq.end()
	
	var servreq = https.request(servop, res => {
		var data = ''
		res.on('data', chunk => {
			data += chunk
		})

		res.on('end', () => {
			var x = data.split("/255")
			server = parseInt(x[0].substring(x[0].length, x[0].length-3))
		})
	})

	servreq.on('error', e => {
		console.log(e.message)
	})

	servreq.end()
	
	queue = server - towny - fac - classic
	
	update = new Date()
  
  subs = allData.get('qsub')
}, 1000)

const client = new Discord.Client()

const token = process.env.DISCORD_BOT_TOKEN

client.login(token)

client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

client.on('ready', async () => {
	console.log(`${time()} | EarthMC Live Bot is up!`)
	client.user.setPresence({
		status: 'online',
		game: {
			name: `EarthMC Live | /help`,
			type: "WATCHING"
		}
	})

  setInterval(async () => {
    const activities = [`EarthMC Live | /help`, `${client.guilds.size} Servers`, `${client.users.size} Users`, `${subs.length} Queue Updates`, `EarthMC Live | invite.gg/emcl`, `TCCGPlayz code`, `EarthMC Queue Live`]
    const activity = activities[Math.floor(Math.random() * activities.length)]
    await client.user.setActivity(activity, { type: 'WATCHING' })
		console.log(`${time()} | Activity Updated | Watching ${activity}`)
  }, 30000);
	
	setInterval(async () => {
		var l = subs.length
		for (var i = 0; i < l; i++) {
			if (subs[i] == '') continue;
			var channel = client.channels.get(subs[i])
			if (!channel) {
				console.log(`${time()} | Channel ${subs[i]} not found. (${i+1}/${l})`)
				continue;
			}
			await channel.send(new Discord.RichEmbed()
				.setColor(0x00ffff)
				.setAuthor("EarthMC Server Status", "https://earthmc.net/img/logo.png")
				.addField("Towny Queue", `There are now ${towny > 195 ? `${Math.abs(queue)} player${Math.abs(queue) == 1 ? "" : "s"} in the EarthMC Queue.` : `${200-towny} free spot${200-towny == 1 ? "" : "s"} in EarthMC Towny.`}`)
				.addField("Towny", `${towny >= 200 ? `**FULL** ${towny}` : towny}/200`, true)
				.addField("Factions", `${fac >= 100 ? `**FULL** ${fac}` : fac}/100`, true)
				.addField("Classic", `${classic >= 100 ? `**FULL** ${classic}` : classic}/100`, true)
				.setFooter("Provided by EarthMC Live | Last Updated", client.user.avatarURL)
				.setTimestamp(update)
			).then(() => {
        console.log(`${time()} | Sent Queue Update ${i+1} of ${l}. (${channel.guild.name} #${channel.name})`)
      }).catch(error => {
        console.log(`${time()} | Cannot post Queue Update in ${channel.guild.name} #${channel.name} (${i+1}/${l})`)
      })
		}
	}, 1000*60*2.5)
})

client.on('guildMemberAdd', async member => {
	if (member.guild.id != '569991565498515489') return;
	member.user.send(
		new Discord.RichEmbed()
			.setColor(0x00ffff)
			.setAuthor(member.user.tag, member.user.displayAvatarURL)
			.setTitle("Welcome to the EarthMC Live Discord Server!")
			.setURL("https://invite.gg/emcl")
			.setThumbnail(client.user.avatarURL)
			.setDescription("**EarthMC Live** is currently the largest news organization for the EarthMC Server.\n\nWe provide the newest and most up-to-date information regarding the EarthMC Server, completely free of bias.\n\nPlease proceed to <#570003631919595551> and react with :newspaper: to gain access to the server and our high quality news.\n\nYou can then go to <#584088465470128173> to subscribe to the latest events happening on EarthMC, and <#584088496432611328> to subscribe to articles regarding the server.\n\nYou can also subscribe to Announcements and Polls and more in <#584088520835072013>.\n\nYou can also get more information about the server even when you don't have the time to play Minecraft!\n\nTo get information of the EarthMC Server Queue, we have queue live updates sent regularly in <#571641362751946753>.\n\nTo get information of towns, nations and players of EarthMC, go to <#590774338429648896> and use the `$nation`, `$town` and `$player` commands.")
			.setFooter(client.user.username, client.user.avatarURL)
	)
})

client.on('message', async message => {
	if (message.author.bot) return;

	console.log(`${time()} | ${message.channel.type == 'dm' ? message.author.tag : `${message.guild.name} #${message.channel.name} | ${message.author.tag}`} > ${message.cleanContent}`)

	
	if (message.content.startsWith("$") || message.content.startsWith("/")) {
		
		let args = message.content.slice(1).split(/\s+/u)
		
		const commandName = args.shift().toLowerCase()
		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
		
		let data = { towny: towny, queue: queue, fac: fac, classic: classic, update: update, online: online, subs: subs }
		//console.log(data)
    
		try {
			await command.run(client, message, args, data)
		} catch (error) {
			console.log(error)
		}
		message.delete().catch(() => {})
	}
		
})

function calcPolygonArea(X, Y, numPoints) { 
	let area = 0					// Accumulates area in the loop
	let j = numPoints-1		// The last vertex is the 'previous' one to the first

	for (let i=0; i<numPoints; i++)
		{ area = area +	(X[j]+X[i]) * (Y[j]-Y[i]) 
			j = i							//j is previous vertex to i
		}
	return Math.abs(area/2)
}

module.exports.area = calcPolygonArea

