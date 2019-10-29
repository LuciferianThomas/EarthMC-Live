const Discord = require('discord.js')
const moment = require('moment')
const db = require('quick.db')
const editors = new db.table('editor')

const tagsList = require('/app/bot/tagsList.js')

module.exports = {
	name: "tags",
	usage: ".",
  description: "..",
  aliases: ["tag"],
	run: async (client, message, args, shared) => {
    if (!message.member.roles.get("595004561039687684")) return;
    
    let target = message.mentions.members.first()
    if (!target) return;
    
    let editorProfile = editors.get(target.id)
    if (!editorProfile) return;
    
    let tags = args.slice(1).filter(tag => tag.length == 4 && ["+","-"].includes(tag.substring(0,1)) && Object.keys(tagsList).includes(tag.substring(1,3)) && ["0","1","2"].includes(tag.substring(3,4))).map(tag => tag.toLowerCase())
    if (!tags.length) return;
    
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].substring(0,1) == "+" && !editorProfile.tags.find(tag => tag == tags[i].substring(1,4))) editorProfile.tags.push(tags[i].substring(1,4))
      if (tags[i].substring(0,1) == "-" && editorProfile.tags.find(tag => tag == tags[i].substring(1,4))) editorProfile.tags.splice(editorProfile.tags.indexOf(tags[i].substring(1,4)), 1)
    }
    
    editors.set(target.id, editorProfile)
    
    let roles = message.guild.roles
    
    //await target.addRole(roles.find(r => r.name == "Staff"))
    if (tags.find(tag => tag.endsWith("0"))) await target.addRole(roles.find(r => r.name == "Junior Editor"))
    if (tags.find(tag => tag.endsWith("2"))) await target.addRole(roles.find(r => r.name == "Senior Editor"))
    if (tags.find(tag => ["en1","en2"].includes(tag.substring(1)))) await target.addRole(roles.find(r => r.name == "Editor"))
    if (tags.find(tag => ["fr1","fr2"].includes(tag.substring(1)))) await target.addRole(roles.find(r => r.name == "Éditeur"))
    if (tags.find(tag => tag.substring(1).startsWith("yt"))) await target.addRole(roles.find(r => r.name == "YouTube Editor"))
    
    //    await target.addRole(roles.find(r => r.name == "Staff"))
    if (!editorProfile.tags.find(tag => tag.endsWith("0"))) await target.removeRole(roles.find(r => r.name == "Junior Editor"))
    if (!editorProfile.tags.find(tag => tag.endsWith("2"))) await target.removeRole(roles.find(r => r.name == "Senior Editor"))
    if (!editorProfile.tags.find(tag => ["en1","en2"].includes(tag))) await target.removeRole(roles.find(r => r.name == "Editor"))
    if (!editorProfile.tags.find(tag => ["fr1","fr2"].includes(tag))) await target.removeRole(roles.find(r => r.name == "Éditeur"))
    if (!editorProfile.tags.find(tag => tag.startsWith("yt"))) await target.removeRole(roles.find(r => r.name == "YouTube Editor"))
         
    if (!editorProfile.tags.length) {
      await target.removeRole(roles.find(r => r.name == "Staff"))
      editors.delete(target.id)
    }
    
    await message.channel.send(
      new Discord.RichEmbed()
        .setColor(0x00ffff)
        .setAuthor(`Updated editor!`, client.user.avatarURL)
        .setThumbnail(target.user.displayAvatarURL)
        .addField("Editor", target)
        .addField("Tags", editorProfile.tags.length ? editorProfile.tags.map(tag => `${tagsList[tag.substring(0,2)]} ${tag.substring(2,3) == 0 ? "Junior Editor" : tag.substring(2,3) == 1 ? "Editor" : "Senior Editor"}`).join("\n") : "Removed")
    )
	}
}
