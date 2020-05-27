# MTG-Spoilers-Discord-bot
A Discord bot for automatically posting Magic: The Gathering card spoilers. Works with the Scryfall API.

## Commands
Command prefix is '!', no functionality implemented yet to adjust this.
### getall/getallcards [SETCODE]
Will send a message for every card from the set with the given setcode that hasn't been send in that channel yet.
### watch/startwatch [SETCODE]
Will start a watch for the set with the given setcode. This means the bot will watch for any new cards spoiled for that set and automatically send any new cards to the channel every half hour.
### unwatch/stopwatch [SETCODE]
Will stop the watch for the set with the given setcode if any is currently started. This will stop the bot from watching for new spoilers and stop it from sending any messages automatically.
### clear [SETCODE]
Will clear the list of any already sent cards from the set with the given setcode. This means the bot will stop excluding these cards from being send to the channel with the 'getall' and 'watch' commands, and send every card from that set again when using these commands.
