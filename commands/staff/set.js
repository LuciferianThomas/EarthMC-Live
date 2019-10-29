const Discord = require('discord.js')
const moment = require('moment')
const db = require('quick.db')
const editors = new db.table('editor')

const tagsList = require('/app/bot/tagsList.js')

module.exports = {
	name: "set",
	usage: "set [editor] <item> <newVal>",
  description: "..",
	run: async (client, message, args, shared) => {
    let target = message.mentions.members.first()
    
    let item, newVal
    if (target && message.member.roles.get("595004561039687684")) item = args[1], newVal = args.slice(2).join(' ')
    else if (target && !message.member.roles.get("595004561039687684")) target = message.member, item = args[1], newVal = args.slice(2).join(' ')
    else target = message.member, item = args[0], newVal = args.slice(1).join(' ')
    if (!item || !newVal) return;
    
    if (!editors.get(target.id)) return;
    
    if (["tz", "timezone"].includes(item.toLowerCase())) editors.set(`${target.id}.tz`, newVal)
    if (item.toLowerCase() == "ign") editors.set(`${target.id}.ign`, newVal)
    if (item.toLowerCase() == "title" && message.member.roles.get("595004561039687684")) editors.set(`${target.id}.title`, newVal)
    
    let editorProfile = editors.get(target.id)
    
    let embed = new Discord.RichEmbed()
      .setColor(0x00ffff)
      .setAuthor(`Editor Profile`, client.user.avatarURL)
      .setThumbnail(target.user.displayAvatarURL)
      .addField("Editor", target)
    if (editorProfile.ign) embed.addField("In-game Name", editorProfile.ign, true)
    if (editorProfile.tz) embed.addField("Timezone", editorProfile.tz, true)
    if (editorProfile.title) embed.addField("Title", editorProfile.title, true)
    embed.addField("Tags", editorProfile.tags.map(tag => `${tagsList[tag.substring(0,2)]} ${tag.substring(2,3) == 0 ? "Junior Editor" : tag.substring(2,3) == 1 ? "Editor" : "Senior Editor"}`).join("\n"), true)
    
    return await message.channel.send(embed)
	}
}
