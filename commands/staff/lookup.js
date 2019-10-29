const Discord = require('discord.js')
const moment = require('moment')
const db = require('quick.db')
const editors = new db.table('editor')

const tagsList = require('/app/bot/tagsList.js')

module.exports = {
	name: "lookup",
	usage: "lookup <user>",
  description: "..",
  aliases: ["find", "profile"],
	run: async (client, message, args, shared) => {
    let target = message.mentions.members.first()
    if (!target) return;
    
    let editorProfile = editors.get(target.id)
    if (!editorProfile) return;
    
    let embed = new Discord.RichEmbed()
      .setColor(0x00ffff)
      .setAuthor(`Editor Profile`, client.user.avatarURL)
      .setThumbnail(target.user.displayAvatarURL)
      .addField("Editor", target)
    if (editorProfile.ign) embed.addField("In-game Name", editorProfile.ign, true)
    if (editorProfile.tz) embed.addField("Timezone", editorProfile.tz, true)
    if (editorProfile.title) embed.addField("Title", editorProfile.title, true)
    embed.addField("Tags", editorProfile.tags.map(tag => `${tagsList[tag.substring(0,2)]} ${tag.substring(2,3) == 0 ? "Junior Editor" : tag.substring(2,3) == 1 ? "Editor" : "Senior Editor"}`).join("\n"))
    
    return await message.channel.send(embed)
	}
}
