const Discord = require('discord.js')

const db = require('quick.db'),
      allData = new db.table("allData")

const fn = require('/app/bot/fn.js')

module.exports = {
  name: "subscribe",
  aliases: ["sub"],
  run: async (client, message, args) => {
    let subs = allData.get('qsub')
    if (subs.includes(message.channel.id)) return message.channel.send(fn.embed(client, "You already have a subscription for this channel!"))
    
    if (!message.channel.memberPermissions(message.guild.me).has("SEND_MESSAGES")) return message.author.send(fn.embed(client, `I do not have permissions to send messages in ${message.channel}!\nI need the Send Messages and Embed Links permissions.`))
    if (!message.channel.memberPermissions(message.guild.me).has("EMBED_LINKS")) return message.author.send(fn.embed(client, `I do not have permissions to embed links in ${message.channel}!\nI need the Send Messages and Embed Links permissions.`))
    
    allData.push('qsub', message.channel.id)
    return message.channel.send(fn.embed(client, "<:green_tick:597374070849404930> Subscription Success!"))
  }
}