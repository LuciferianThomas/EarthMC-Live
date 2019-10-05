const Discord = require('discord.js')

const db = require('quick.db'),
      allData = new db.table("allData")

const moment = require('moment')

const fn = require('/app/bot/fn.js')

let time = (t = moment()) => {
  return moment(t).utcOffset(8).format("YYYY/MM/DD HH:mm:ss")
}

module.exports = {
	name: "eval",
	usage: "eval <code>",
	run: async (client, message, args, data) => {
    if (message.author.id != '336389636878368770') return;
    
    let input = message.content.split(/\s/g).slice(1)
    
    const msg = message, bot = client

		let modifier = "-e"
    
    if (input[input.length-1] == "-t" || input[input.length-1] == "-l" || input[input.length-1] == "-e") {
      modifier = input.pop()
    }

		try {
			var out = eval(input.join(" "))
			out = JSON.stringify(out)
      if (out === undefined) out = "undefined"
      
      if (modifier == "-e" && out.length <= 1024-8) message.channel.send(
        new Discord.RichEmbed()
          .setColor("GREEN")
          .setTitle(`:green_tick: Evaluation Success!`)
          .addField(`Expression`, '```js\n'+args.join(" ")+'```')
          .addField(`Result`, '```js\n'+out+'```')
          .setFooter(client.user.username, client.user.avatarURL)
      ).catch(console.error)
      else if (out.length <= 2000-8 && (modifier == "-t" || (modifier == "-e" && out.length > 1024-8))) message.channel.send('```js\n'+out+'```')
      else if (modifier = "-l") console.log(`${fn.time()} | Evaluation Result | ${out}`)
      else {
        console.log(`${fn.time()} | Evaluation Result | ${out}`)
        message.channel.send(
          new Discord.RichEmbed()
            .setColor("GREEN")
            .setTitle(`:green_tick: Evaluation Success!`)
            .addField(`Expression`, '```js\n'+args.join(" ")+'```')
            .addField(`Result`, '```js\nOutput too long. Check console log.```')
            .setFooter(client.user.username, client.user.avatarURL)
        ).catch(console.error)
      }
		} catch (e) {
      var embed = new Discord.RichEmbed()
        .setColor("RED")
        .setTitle(`:red_tick: Evaluation Failed!`)
        .addField(`Expression`, '```js\n'+args.join(" ")+'```')
        .addField(`Error Message`, '```js\n'+e+'```')
        .setFooter(client.user.username, client.user.avatarURL)
			message.channel.send(embed)
        .catch(console.error)
		}
    
	}
}