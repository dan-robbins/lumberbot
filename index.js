'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const request = require('request');
const config = require("./config.json");

var woodPosts = config.woodPosts;
var changeWoodName = config.changeWoodName;
var ignoreOwen = config.ignoreOwen;
var blocked = config.blocked;
var unauth = "Unauthorized user up in my grill! You trying to hack my Catch-a-Ride? Uncool bro, uncool.";
var censor = true;
var channelTimeout = 120;
var voiceChannel = undefined;
var timeoutID = undefined;

const funCommands = [";;say", ";;roll", ";;repo", ";;sendenergy", ";;butterfly", ";;lewd", ";;hurray", ";;peeking", ";;akinator", ";;quokka", ";;cuddle", ";;riot", ";;facedesk", ";;shrug", ";;dealwithit", ";;angrytableflip", ";;useless", ";;spiderlenny", ";;eagleoflenny", ";;wombat", ";;otter", ";;pat", ";;magic", ";;github", ";;faceofdisapproval", ";;channelingenergy", ";;dog", ";;shrugwtf", ";;lenny", ";;lennygang", ";;capybara", ";;catgirl", ";;hug"];

const clean = text => {
    if(typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

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
    const wood = client.emojis.find(x => x.name === "Wood");
    if(messageReaction.emoji.id === wood.id && (messageReaction.message.author.id === config.woodid || messageReaction.message.author.id === "460869499340718080")){
        let records = JSON.parse(fs.readFileSync('records.json'));
        records.woods = records.woods + 1;
        if(records.woods % 500 === 0 || records.woods % 1540 === 0){
            await messageReaction.message.channel.send(`Milestone reached! ${records.woods} total woods!`);
        }
        if(records.woods % 1540 === 0){
            await messageReaction.message.channel.send(`1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 1540 ${client.users.get(config.alexid)} ${client.users.get(config.alexid)} ${client.users.get(config.alexid)} ${client.users.get(config.alexid)} ${client.users.get(config.alexid)} We have officially reached wood levels ${records.woods/1540}x higher than ${client.users.get(config.alexid)}\'s SAT score! Congratulations!`);
        }
        if(messageReaction.count > records.record){
            await messageReaction.message.channel.send(`New record! ${messageReaction.count} woods on a single post! Previous record was ${records.record} woods.`);
            records.record = messageReaction.count;
        }
        if(changeWoodName){
            client.guilds.get(config.serverid).members.get(config.woodid).setNickname(records.woods.toString(10));
            client.guilds.get(config.pengisid).members.get(config.woodid).setNickname(records.woods.toString(10));
        }
        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
        return;
    }
    else if(messageReaction.emoji.id === wood.id && messageReaction.message.author.id !== config.woodid && user.id === config.woodid){
        messageReaction.remove(user);
        return;
    }
});

client.on("messageReactionRemove", async (messageReaction, user) => {
    const wood = client.emojis.find(x => x.name === "Wood");
    if(messageReaction.emoji.id === wood.id && messageReaction.message.author.id === config.woodid){
        let records = JSON.parse(fs.readFileSync('records.json'));
        records.woods = records.woods - 1;
        if(changeWoodName){
            client.guilds.get(config.serverid).members.get(config.woodid).setNickname(records.woods.toString(10));
            client.guilds.get(config.pengisid).members.get(config.woodid).setNickname(records.woods.toString(10));
        }
        fs.writeFileSync('records.json', (JSON.stringify(records, null, 4)));
        return;
    }
});

client.on("guildMemberRemove", async member => {
    if (timeoutID != undefined){
	clearTimeout(timeoutID)
	timeoutID = undefined
    }
    
    client.users.get(config.ownerid).send(`Member ${member.user.tag}/${member.displayName} left ${member.guild.name}!`)
    
    const voiceChannels = client.guilds.get("530908082709200946").channels.filter(c => c.type === 'voice');
    let maxCount = 0
    for (const [id, channel] of voiceChannels){
        let count = 0
        count += channel.members.size;
        if (count > maxCount){
            maxCount = count
            voiceChannel = channel
        }
    }
    if (maxCount == 0){
        voiceChannel = undefined 
    }
    if (voiceChannel != undefined){
        voiceChannel.join().then(connection => {
            const dispatcher = connection.playFile("sounds/cannon3.mp3");
            timeoutID = setTimeout(() => {
	        if (voiceChannel != undefined){
		    voiceChannel.leave()
		    voiceChannel = undefined
		}
	    }, channelTimeout * 1000)
        }).catch(err => console.log(err));
    }
});

client.on("message", async message => {

    if(message.author.id === "184405311681986560" && censor && message.channel.id !== "989196134490726440" && message.channel.id !== "530912319434129409"){
        message.delete();
        return;
    }

    if(message.author.bot) return;

    const wood = client.emojis.find(x => x.name === "Wood").id;

    if(censor && message.channel.id !== "989196134490726440" && funCommands.some(v => message.content.toLowerCase().includes(v))){
        message.delete()
        .then(msg => {
            msg.author.send(`Your message \"${msg.content}\" was removed. Please contain all degenerate spam to the #${client.guilds.get("530908082709200946").channels.get("989196134490726440").name} channel.`)
            client.users.get(config.ownerid).send(`Deleted message \"${msg.content}\" from ${msg.author.tag}`)
        })
        .catch(err => console.error(err))
        return;
    }

    if(censor && (message.content.toLowerCase().includes("circumci") || message.content.toLowerCase().includes("foreskin"))){
        message.delete()
        .then(msg => {
            msg.author.send(`Your message \"${msg.content}\" was removed. This incident will be recorded and reported to the shadow council.`)
            client.users.get(config.ownerid).send(`Deleted message \"${msg.content}\" from ${msg.author.tag}`)
        })
        .catch(err => console.error(err))
        return;
    }

    if(woodPosts && message.author.id === config.woodid){
        try{
            message.react(wood);
        }
        catch(err){
            console.log(err)
        }
        if(blocked){
            message.channel.send(`${client.users.get(config.woodid)} ${client.emojis.find(x => x.name === "Wood")}`).then(msg => msg.react(wood));
        }
    }

    if(message.content.toLowerCase() === "livecounter"){
        let records = JSON.parse(fs.readFileSync('records.json'));
        await message.channel.send(`A total of ${records.woods} woods since January 18th 2018, with a record of ${records.record} woods on a single post. A total of ${records.aces} Danny ace${records.aces === 1 ? '' : 's'}.`);
        return;
    }

    if(ignoreOwen && message.author.id === config.woodid) return;

    if(message.content.toLowerCase() === "touchdowns" || message.content.toLowerCase() === "score" || message.content.toLowerCase() === "scoreboard"){
        let touchdowns = JSON.parse(fs.readFileSync('touchdowns.json'));
        let val = "Touchdowns:\n";
        for(let x in touchdowns){
            val = val + `${x.charAt(0).toUpperCase() + x.slice(1)}: ${touchdowns[x]}\n`;
        }
        val = val.substring(0,val.length-1);
        await message.channel.send(val);
        return;
    }

    if(message.author.id !== client.id && message.channel.type === "dm" && message.author.id !== config.ownerid){
        client.users.get(config.ownerid).send(`DM recieved from ${message.author.tag} at ${new Date()}\nContent: ${message.content}`)
        return;
    }

    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
        return;
    }

    else if(command === "ignoreowen") {
        ignoreOwen = true;
        message.channel.send(`Ignoring commands from ${client.users.get(config.woodid)}`)
    }

    else if(command === "unignoreowen") {
        if(message.author.id !== config.ownerid){
            message.channel.send(unauth);
            return;
        }
        ignoreOwen = false;
        message.channel.send("Lumberboy un-ignored")
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
            else if(args[0] === "remove" || args[0] === "subtract"){
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

    else if(command === "touchdowns" || command === "score" || command === "scoreboard"){
        let touchdowns = JSON.parse(fs.readFileSync('touchdowns.json'));
        let val = "Touchdowns:\n";
        for(let x in touchdowns){
            val = val + `${x.charAt(0).toUpperCase() + x.slice(1)}: ${touchdowns[x]}\n`;
        }
        val = val.substring(0,val.length-1);
        await message.channel.send(val);
        return;
    }

    else if(command === "touchdown"){
        if(args[0].length === 0){
            return;
        }
        let touchdowns = JSON.parse(fs.readFileSync('touchdowns.json'));
        if(args[0].toLowerCase() === "remove"){
            if(args[1].length === 0){
                return;
            }
            if(args[1].toLowerCase() in touchdowns){
                touchdowns[args[1].toLowerCase()] = touchdowns[args[1].toLowerCase()] - 1;
                fs.writeFileSync('touchdowns.json', (JSON.stringify(touchdowns, null, 4)));
                message.channel.send(`Touchdown removed for ${args[1].charAt(0).toUpperCase() + args[1].slice(1)}.`);
                return;
            }
            else{
                return;
            }
        }
        else{
            let val = 0;
            if(args[0].toLowerCase() in touchdowns){
                val = touchdowns[args[0].toLowerCase()]
            }
            touchdowns[args[0].toLowerCase()] = val + 1
            fs.writeFileSync('touchdowns.json', (JSON.stringify(touchdowns, null, 4)));
            message.channel.send(`Touchdown ${args[0].charAt(0).toUpperCase() + args[0].slice(1)}!`);
            return;
        }
    }

    else if(command === "waluigi"){
        var responses = [
            "https://i.imgur.com/NM9dE18.jpg",
            "http://i.imgur.com/jAPpdaE.jpg",
            "https://i.imgur.com/1dTZOx9.jpg",
            "https://i.imgur.com/gANV354.png",
            "https://i.imgur.com/G80NvVs.jpg",
            "https://i.imgur.com/snDLShN.png",
            "https://i.imgur.com/SpEhovO.jpg",
            "https://i.imgur.com/rnodf7X.jpg",
            "https://i.imgur.com/VoN41wR.png",
            "https://i.imgur.com/6eERewD.jpg",
            "https://i.imgur.com/mHMqUnu.jpg",
            "https://i.imgur.com/r50XVDd.jpg",
            "https://i.imgur.com/8noTA67.png",
            "https://i.imgur.com/k0THQ4s.jpg",
            "https://i.imgur.com/OTGWbqF.jpg",
            "https://i.imgur.com/xZ3jAUA.jpg",
            "https://i.imgur.com/o2HUg9x.jpg",
            "https://i.imgur.com/MDtAvmK.jpg",
            "https://i.imgur.com/HqghE19.jpg",
            "https://i.imgur.com/69AgXiB.png",
            "https://i.imgur.com/HmeqCMK.jpg",
            "https://i.imgur.com/cPe3Zpt.png",
            "http://i.imgur.com/qeCpN41.jpg",
            "https://i.imgur.com/uVCiT7T.jpg",
            "https://i.imgur.com/mwIbees.jpg",
            "https://i.imgur.com/5AV5k9t.png",
            "https://i.imgur.com/JoZgHaG.jpg",
            "https://i.imgur.com/UD6EIqc.png",
            "https://i.imgur.com/bVP45QL.jpg",
            "https://i.imgur.com/n0WSEmm.jpg",
            "https://i.imgur.com/wj8b3TJ.jpg",
            "https://i.imgur.com/uIvEObB.png",
            "https://i.imgur.com/t9pcdaf.jpg",
            "https://i.imgur.com/ELhsMyI.jpg",
            "https://i.imgur.com/24F5Po6.jpg",
            "https://i.imgur.com/MGLThP4.jpg",
            "https://i.imgur.com/u2Y1vOO.jpg",
            "https://i.imgur.com/zerUjsT.jpg",
            "https://i.imgur.com/od4Of0e.png",
            "https://i.imgur.com/PwG4GXn.jpg",
            "https://i.imgur.com/EcMASZB.jpg",
            "https://i.imgur.com/4DRxmtE.jpg",
            "https://i.imgur.com/0DBSdLI.jpg",
            "https://i.imgur.com/3fI7oyo.jpg",
            "https://i.imgur.com/pjzFy1g.png",
            "https://i.imgur.com/myngWSM.jpg",
            "https://i.imgur.com/hU8TbqZ.png",
            "https://www.youtube.com/watch?v=m9I4xuArxhA",
            "https://www.youtube.com/watch?v=Rf9PClQKOmg",
            "https://www.youtube.com/watch?v=yQ0iTDafXuM",
            "https://www.youtube.com/watch?v=cg2ZWibCwKE"
        ];
        var response = responses[Math.floor(Math.random() * responses.length)];
	    message.channel.send(`${client.users.get(config.nealid)} ${response}`);
        return;
    }

    else if(command === "cleanbot"){
        if(message.author.id !== config.ownerid){
            message.channel.send(unauth);
            return;
        }
        if(args[0].length === 0){
            return;
        }
        client.guilds.get("530908082709200946").channels.get(args[0]).fetchMessages({
            limit: 100 // Change `100` to however many messages you want to fetch
        }).then((messages) => { 
            const botMessages = [];
            messages.filter(m => m.author.id === "184405311681986560")
            client.guilds.get("530908082709200946").channels.get(args[0]).bulkDelete(botMessages).then(() => {
                message.channel.send("Cleared 100 messages").then(msg => msg.delete({
                    timeout: 3000
                }))
            });
        })
    }

    else if(command === "cleancommands"){
        if(message.author.id !== config.ownerid){
            message.channel.send(unauth);
            return;
        }
        if(args[0].length === 0){
            return;
        }
        client.guilds.get("530908082709200946").channels.get(args[0]).fetchMessages({
            limit: 100 // Change `100` to however many messages you want to fetch
        }).then((messages) => { 
            const botMessages = [];
            messages.filter(m => funCommands.some(v => m.content.toLowerCase().includes(v))).forEach(msg => botMessages.push(msg))
            client.guilds.get("530908082709200946").channels.get(args[0]).bulkDelete(botMessages).then(() => {
                message.channel.send("Cleared 100 messages").then(msg => msg.delete({
                    timeout: 3000
                }))
            });
        })
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
