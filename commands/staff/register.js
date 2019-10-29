const Discord = require('discord.js')
const moment = require('moment')
const db = require('quick.db')
const editors = new db.table('editor')

const tagsList = require('/app/bot/tagsList.js')

module.exports = {
	name: "register",
	usage: "register <user>",
  description: "..",
  aliases: ["reg"],
	run: async (client, message, args, shared) => {
    if (!message.member.roles.get("595004561039687684")) return;
    
    let target = message.mentions.members.first()
    if (!target) return;
    
    if (editors.get(target.id)) return;
    
    let tags = args.slice(1).filter(tag => tag.length == 3 && Object.keys(tagsList).includes(tag.substring(0,2)) && ["0","1","2"].includes(tag.substring(2,3))).map(tag => tag.toLowerCase())
    if (!tags.length) return;
    
    let editorProfile = {
      id: target.id,
      ign: null,
      tz: null,
      tags: tags,
      title: null
    }
    
    editors.set(target.id, editorProfile)
    
    let roles = message.guild.roles
    
    await target.addRole(roles.find(r => r.name == "Staff"))
    if (tags.find(tag => tag.endsWith("0"))) await target.addRole(roles.find(r => r.name == "Junior Editor"))
    if (tags.find(tag => tag.endsWith("2"))) await target.addRole(roles.find(r => r.name == "Senior Editor"))
    if (tags.find(tag => ["en1","en2"].includes(tag))) await target.addRole(roles.find(r => r.name == "Editor"))
    if (tags.find(tag => ["fr1","fr2"].includes(tag))) await target.addRole(roles.find(r => r.name == "Éditeur"))
    if (tags.find(tag => tag.startsWith("yt"))) await target.addRole(roles.find(r => r.name == "YouTube Editor"))
    
    await message.channel.send(
      new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setAuthor(`Registered new editor!`, client.user.avatarURL)
        .setThumbnail(target.user.displayAvatarURL)
        .addField("Editor", target)
        .addField("Tags", tags.map(tag => `${tagsList[tag.substring(0,2)]} ${tag.substring(2,3) == 0 ? "Junior Editor" : tag.substring(2,3) == 1 ? "Editor" : "Senior Editor"}`).join("\n"))
    )
	}
}
