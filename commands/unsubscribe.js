const Discord = require('discord.js')

const db = require('quick.db'),
      allData = new db.table("allData")

const fn = require('/app/bot/fn.js')

module.exports = {
  name: "unsubscribe",
  aliases: ["unsub"],
  run: async (client, message, args) => {
    let subs = allData.get('qsub')
    if (!subs.includes(message.channel.id)) return message.channel.send(fn.embed(client, "You do not have a subscription for this channel!"))
    
		subs.splice(subs.indexOf(message.channel.id, 1), 1)
    allData.set('qsub', subs)
    return message.channel.send(fn.embed(client, "<:green_tick:597374070849404930> Unsubscription Success!"))
  }
}