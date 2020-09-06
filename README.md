# MTG-Spoilers-Discord-bot
A Discord bot for automatically posting Magic: The Gathering card spoilers. Works with the Scryfall API.

## Commands
Command prefix is '!' by default.
### get [QUERY]
Will send a message with name matching the given query (using Scryfall's fuzzy search).
### getall/getallcards [SETCODE]
Will send a message for every card from the set with the given setcode.
### getnew/getnewcards [SETCODE]
Will send a message for every card from the set with the given setcode that hasn't been send in that channel yet.
### watch/startwatch [SETCODE]
Will start a watch for the set with the given setcode. This means the bot will watch for any unsent cards for that set and automatically send any new cards to the channel every half hour.
### unwatch/stopwatch [SETCODE]
Will stop the watch for the set with the given setcode if any is currently started. This will stop the bot from watching for unsent cards and stop it from sending any messages automatically.
### clear [SETCODE]
Will clear the list of any already sent cards from the set with the given setcode. This means the bot will stop excluding these cards from being send to the channel with the 'getnew' and 'watch' commands, and send every card from that set again when using these commands.
### prefix [NEWPREFIX]
Will change the prefix the bot listens to to the given new prefix.
### ping
Will send a message 'Pong!'.
### help
Will send a message with all possible commands and usages.

## File Structure
```
* root parent directory
/ * [node_modules]
/ * src
/ / * [Code]
/ / * auth.ts
/ / * bot.ts
/ * data
/ / * settings.json
/ / * watchedsetcodes.json
/ / * [channelId]-[setCode]-data.json files
```

/src here contains the all the code of the project, so files like bot.ts go on this level. Auth.ts is the file containing your token to connect your bot to the Discord API. The /data directory contains all data files the bot needs to function, and these will all be generated automatically when the bot is running (including the data directory itself). Both auth.ts and /data are gitignored.

## Data files
### settings.json
This file contains general configuration for the bot. It currently contains the following:
```json
{
    "prefix": "!"
}
```
The value of "prefix" contains the character the bot looks at to determine if a message contains a command it should do something with.
### watchedsetcodes.json
This file contains a list of entries telling the bot which channel is expecting cards from which set. Every entry has the following format:
```json
{
  "setCode": "xxx",
  "channelID": "xxxxxxxxxxxxxxxxxx"
}
```
The value of "setCode" here is the three letter abbreviation of the set (e.g. "m21"). The value of "channelID" is the Discord channel ID.
### [channelId]-[setCode]-data.json files
For every combination channelID-setCode that has cards sent to it, the bot will create one of these files, with the corresponding channelID and setCode in the filename. Each files is a simple list of IDs that Scryfall gives to every magic card. The ID used is the oracle_ID which is unique for every mechanically different card, but not for alternate arts. This means that only one unique art/frame for every card will be sent by the bot.
 
