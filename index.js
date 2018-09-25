'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const config = require("./config.json");

const clean = text => {
    if(typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

const unauth = "Unauthorized user up in my grill! You trying to hack my Catch-a-Ride? Uncool bro, uncool.";

client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity(`Lumber Dispenser`);
});

client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

client.on("messageReactionAdd", async (messageReaction, user) => {
    const wood = client.emojis.find("name", "Wood");
    if(messageReaction.emoji.id === wood.id && messageReaction.message.author.id === config.woodid){
        let records = JSON.parse(fs.readFileSync('records.json'));
        records.woods = records.woods + 1;
        if(records.woods % 500 === 0 || records.woods % 1540 === 0){
            await messageReaction.message.channel.send(`Milestone reached! ${records.woods} total woods!`);
        }
        if(records.woods % 1540 === 0){
            await messageReaction.message.channel.send(`1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 ${client.users.get(config.alexid)} ${client.users.get(config.alexid)} ${client.users.get(config.alexid)} ${client.users.get(config.alexid)} ${client.users.get(config.alexid)} We have officially reached wood levels ${records.woods/1540}x higher than ${client.users.get(config.alexid)} SAT score! Congratulations!`);
        }
        if(messageReaction.count > records.record){
            await messageReaction.message.channel.send(`New record! ${messageReaction.count} woods on a single post! Previous record was ${records.record} woods.`);
            records.record = messageReaction.count;
        }
        client.guilds.get(config.serverid).members.get(config.woodid).setNickname(records.woods.toString(10));
        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
        return;
    }
    else if(messageReaction.emoji.id === wood.id && messageReaction.message.author.id !== config.woodid && user.id === config.woodid){
        messageReaction.remove(user);
        return;
    }
});

client.on("messageReactionRemove", async (messageReaction, user) => {
    const wood = client.emojis.find("name", "Wood");
    if(messageReaction.emoji.id === wood.id && messageReaction.message.author.id === config.woodid){
        let records = JSON.parse(fs.readFileSync('records.json'));
        records.woods = records.woods - 1;
        client.guilds.get(config.serverid).members.get(config.woodid).setNickname(records.woods.toString(10));
        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
        return;
    }
});

client.on("message", async message => {

    if(message.author.bot) return;

    if(message.author.id === config.woodid){
        const wood = client.emojis.find("name", "Wood");
        message.react(wood.id);
        /*if(message.content === "ha"){
            message.delete();
            return;
        }*/
    }

    if(message.content === "livecounter"){
        let records = JSON.parse(fs.readFileSync('records.json'));
        await message.channel.send(`A total of ${records.woods} woods since January 18th 2018, with a record of ${records.record} woods on a single post. A total of ${records.aces} Danny aces.`);
    }
    if(message.author.id !== client.id && message.channel.type === "dm" && message.author.id !== config.ownerid){
        client.users.get(config.ownerid).send(`DM recieved from ${message.author.tag} at ${new Date()}\nContent: ${message.content}`)
    }

    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
        return;
    }

    else if(command === "livecounter"){
        if(config.adminids.some(elem => elem === message.author.id)){
            let records = JSON.parse(fs.readFileSync('records.json'));
            if(args[0] === "edit" || args[0] === "set" || args[0] === "update"){
                if(args[1] === "woods"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.woods = parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else if(args[1] === "record"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.record = parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else if(args[1] === "aces"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.aces = parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else{
                    message.channel.send('Invalid field. Usage: livecounter <operation> <field> <number>');
                    return;
                }
            }
            else if(args[0] === "add"){
			    if(args[1] === "woods"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.woods = records.woods + parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else if(args[1] === "record"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.record = records.record + parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else if(args[1] === "aces"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.aces = records.aces + parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else{
                    message.channel.send('Invalid field. Usage: livecounter <operation> <field> <number>');
                    return;
                }
            }
            else if(args[0] === "remove"){
	    		if(args[1] === "woods"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.woods = records.woods - parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else if(args[1] === "record"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.record = records.record - parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else if(args[1] === "aces"){
                    let parsed = parseInt(args[2], 10);
                    if(!isNaN(parsed)){
                        records.aces = records.aces - parsed;
                        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
                        message.channel.send('livecounter updated');
                        return;
                    }
                    else{
                        message.channel.send('Invalid number. Usage: livecounter <operation> <field> <number>');
                        return;
                    }
                }
                else{
                    message.channel.send('Invalid field. Usage: livecounter <operation> <field> <number>');
                    return;
                }
            }
            else{
                message.channel.send('Invalid operation. Usage: livecounter <operation> <field> <number>');
                return;
            }
        }
        else{
            message.channel.send(unauth);
            return;
        }
    }

    else if(command === "eval"){
        if(message.author.id !== config.ownerid){
            message.channel.send(unauth);
            return;
        }
        try{
            let records = JSON.parse(fs.readFileSync('records.json'));
            const code = args.join(" ");
            let evaled = eval(code);

            if(typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            message.channel.send(clean(evaled), {code:"xl"});
            return;
        }
        catch(err){
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
            return;
        }
    }
    else{
        message.channel.send('Command not recognized');
        return;
    }
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.login(config.token);
