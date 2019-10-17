const Discord = require("discord.js"),
      fn = require('/app/bot/fn')

module.exports = {
  name: "tutorial",
  aliases: ["basics"],
  run: async (client, message, args) => {
    let embeds = [
      fn.embed(client, {
        title: "Welcome to EarthMC!",
        description: 
          "EarthMC is a geopolitical sandbox server for Minecraft. Form your own town, join a nation and conquer earth!"
      }),
      fn.embed(client, {
        title: "Getting Started",
        description:
          "EarthMC is a geopolitical sandbox server with a custom made earth map. This guide will get you started on your adventure. " +
          "Join using the address `EarthMC.net`, join our [Discord server](https://www.discord.gg/6rAnxd8) and open the [server world map](https://earthmc.net/map/) in your browser. " +
          "You can view other towns you want to join or take coordinates of the map to find a place you want to settle."
      }),
      fn.embed(client, {
        title: "Currency",
        description:
          "Gold is the currency of the server, often referred to as `G`. It is used in trading items and towny expenses such as town creation or claiming. " + 
          "You can get gold by voting for the server daily. Type the `/vote` command in-game and it will give you two vote links. " +
          "Vote for the server on both links. Each vote will give you a special vote crate, which may give you from 2-32 gold ingots and some rare loot. " +
          "Mining is also a viable way to get gold, but gold ore reserves are rather scarce. You can also raid fallen towns for their gold and resources. " +
          "Trading would be the best way to earn gold after you settled down. Set up shops and sell some items. It can be profitable if your shop is rather well known. " +
          "Gold can be used when stored in your inventory or your ender chest. The gold stored in your inventory or your ender chest is often referred to as your balance."
      }),
      fn.embed(client, {
        title: "Dynamic Map",
        description:
          "The interactive web map can be found at https://earthmc.net/map/. This is a great tool to navigate the map." +
          "A head icon with your name and skin marks your location on the server. If you can't find yourself on the map, " +
          "make sure to check your coordinates in-game and compare them to coordinates displayed on the map. Below the coordinates, " +
          "you will find a menu where territory borders can be toggled. Move the mouse to the right of the screen to open a larger black menu. " +
          "Here you can see who is online."
      }),
      fn.embed(client, {
        title: "Joining a Town",
        description:
          "Most players start off by joining a town that was created by someone else. It's a good way to prepare yourself for even more on the server. " +
          "Check for town informations with the `/town <`*`TownName`*`>` command (also available offline in servers with the EarthMC Live Bot). " +
          "If the town is shown as `Open`, you can freely join the town with the command `/town join <`*`TownName`*`>` if there are vacancies in the town. " +
          "The current town population limit is 75. If the town is not open, you will have to ask the mayor or the councillors to invite you. " +
          "Do `/town spawn` to teleport to your town spawn."
      }),
      fn.embed(client, {
        title: "Purchasing Plots",
        description:
          "Once you joined a town, you can buy plots (each plot is one chunk) that displays `For Sale` in chat when you enter the plot. " +
          "You will need to have the amount of gold equivalent to the plot price in your balance. Type the command `/plot claim` and you now own the plot. " +
          "You can also own plots in other towns if they are marked as embassy plots, even if you are not in a town.\nRefer to `/plot ?` for all commands related to plots."
      }),
      fn.embed(client, {
        title: "Creating Your Town",
        description:
          "If you feel like you are ready, you can create your own town. Each town creation costs 64G, so make sure to have that in your balance. " +
          "Then, find a place where you think you would want your town to be. You cannot create a town when standing inside another town, and you must not be a resident of any town when doing so. " +
          "Type in `/town new <`*`TownName`*`>` to create your town.\n**Note:** There are restrictions to town names, please refer to Rule 4.2 on the [rules page](https://earthmc.net/rules)."
      }),
      fn.embed(client, {
        title: "Expanding Your Town",
        description:
          "Now that you have your own town, you would want to expand it. Each town claim (one chunk) costs 16G. " +
          "Once you are ready with the gold, stand inside the chunk and execute `/town claim`. Slowly expand your town to protect your builds and resources! " +
          "Apart from expanding your claims, you would want to have more residents in your town. Make your town open with `/town toggle public` or " +
          "invite residents with `/town add <`*`ResidentName`*`>`."
      })
    ]
    
    for (var i = 0; i < embeds.length; i++)
      embeds[i]
        .setThumbnail("https://cdn.discordapp.com/icons/219863747248914433/87cf881c3e3d30c110ce09aec902d419.jpg")
        .setFooter(`Page ${i+1}/${embeds.length}`)
    
    let msg = await message.channel.send(embeds[!isNaN(parseInt(args[0])) ? parseInt(args[0]) : 0])
    fn.paginator(message.author.id, msg, embeds, !isNaN(parseInt(args[0])) ? parseInt(args[0]) : 0)
  }
}