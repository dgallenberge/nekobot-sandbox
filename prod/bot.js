// run with "node bot.js"
// How to set up the bot (probably)
// Go to https://nodejs.org/en/ and download the current version. 
//      This code should work with node v14.17.1 and discord.js@12.4.1
// If Discord is not up to date, use "npm install discord.js" to update it.
// To check discord.js version, use "npm list discord.js".

const environmentSettings = require('./support.js');
const permittedChannels = environmentSettings.permittedChannels;
const botType = environmentSettings.environment;

const premadeRoomArray = require('./roomArray/premaderoomarray.js');
const premadeArtArray = require('./roomArray/artRoom.js');
const {roomFunctionalityArray, roomFunctionalityCount} = require('./roomArray/roomFunctionality.js');
const {roomSizeArray, roomSizeCount} = require('./roomArray/roomSize.js');
const {roomLewdnessArray, roomLewdnessCount} = require('./roomArray/roomLewdness.js');
const {roomArchitectureArray, roomArchitectureCount} = require('./roomArray/roomArchitecture.js');
const {roomDecorArray, roomDecorCount} = require('./roomArray/roomDecor.js');
const {roomStateArray, roomStateCount} = require('./roomArray/roomState.js');
const {roomQualityArray, roomQualityCount} = require('./roomArray/roomQuality.js');

const Discord = require('discord.js');
var bot = new Discord.Client();
const TOKEN = environmentSettings.token;
var auth = require('./auth.json');
var logger = require('winston');

const {RoomDescription, descMap} = require('./description.js');
var internalIDmap = new Map();

//var botchannelid = '449024977115545620';
const rpModList = [
    "288377561044615168", // Minion
    "405740726316433409", // Mimi
    "394749146851966978", // Mystic
    "419870027596955649", // Spectro
    "95661865857716224",  // Lia
    "138360314872725504", // Rainbow
    //"369735593120497665", // Steadfast
    "509423874430205993", // Seraph
    "333084469982396418", // Alvino
    "128247718962266113", // Samario
    "394080351720570893"  // Sierra
];


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';


// Among Us Muted Flag
//var mutedStatus = 0;

// Gallery ID
var galleryMessage = "";
var galleryID = 0;



initialboot();

function initialboot() {
    bot.login(TOKEN);
    bot.on('ready', function (evt) {
        log("info", 'Connected');
        log("info", "Logged in as: " + bot.user.username + " - (" + bot.user.id + ")");
        buildInternalIDmap()
        checkinInterval = setInterval(checkAndDisconnect, 30 * 60000); // this is globally scoped.
    });

    bot.on('message', msg => {
        // this stops the bot from listening to itself
        if((msg.author.id == environmentSettings.id) || msg.author.id == environmentSettings.otherid) {
            return;
        }
        
        //if(botType == "prod") {
            // pin Integromat's docket posts
            //&& msg.author.username == "Integromat") {
        //logger.debug("Is this a nekobot msg? " + isNekobotMsg(msg));
        if(msg.channel.id == environmentSettings.docketChannel && !msg.system && !isNekobotMsg(msg)) { 
            msg.pin();
            msg.react("👍")
                .then(() =>  msg.react("🎪"))
                .then(() =>  msg.react("🎾"))
                .then(() =>  msg.react("👎"))
                .catch(() => logger.error("One of the emojis failed to react."));

            let msgArr = msg.toString().split('#');
            let username = msgArr[0].slice(6);
            let userid = "";
            //logger.debug("username: " + username);

            let mUser = bot.users.cache.find(x => x.username === username);
            if(mUser !== null && typeof mUser != "undefined") {
                //logger.debug("Found a user!");
                userid = mUser.id;

                if(internalIDmap.has(userid)) {
                    if(internalIDmap.get(userid) === mUser.username) {
                        log("info", "User already in internalIDMap.");
                    }
                    else {
                        log("info", "Username does not match internalIDMap. Updating ID: " + userid);
                        internalIDmap.set(userid, mUser.username);

                        bot.channels.cache.get(environmentSettings.idMapChannel)
                            .send("User: " + username + ", ID: " + userid).then( () => {},
                            reason => {
                            logger.error("Error (initialboot): " + reason);
                        });
                    }
                }
                else {
                    log("info", "Added to table: ID: " + userid);
                    internalIDmap.set(userid, mUser.username);

                    bot.channels.cache.get(environmentSettings.idMapChannel)
                    .send("User: " + username + ", ID: " + userid).then( () => {},
                        reason => {
                        logger.error("Error (initialboot): " + reason);
                    });
                }
            }
            else {
                log("info", "Not added to table: ID: " + userid);
            }
            return;
        }
        //}
        // all other messages should start with %
        if (msg.toString().substring(0, 1) == '%') {
            if(permittedChannels.includes(msg.channel.id)) {
                commandParser(msg);
            }
        }
    });
    bot.on('messageReactionAdd', messageReaction => {

        //if(!messageReaction.me) {
        if(messageReaction.count > 1) {
            //log("debug", "More than one reaction of that type!"); 
            if(messageReaction.message.id === galleryMessage.id) {
                //log("debug", "Gallery emoji reaction!");
                //log("debug", "Emoji is: " + messageReaction.emoji.toString());
                if(messageReaction.emoji.toString() == "⬅️") {
                    //log("debug", "Left arrow!");
                    galleryMessage.edit(generateArtRoom(--galleryID));
                }
                else if (messageReaction.emoji.toString() == "➡️") {
                    //log("debug", "Right arrow!");
                    galleryMessage.edit(generateArtRoom(++galleryID));
                }
            }
        }
    });
    bot.on('error', function(evt) {
        logger.debug("Error message: " + evt.message);
        logger.debug("Error name: " + evt.lineNumber);
        if(evt.message === "getaddrinfo ENOTFOUND gateway.discord.gg") {
            
        }
        logger.error("Error: " + evt.message);
    });
}

function checkAndDisconnect() {
    let d = new Date(); 
    log("info", "Checking in at " + d.getHours() + ":" 
        + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()));
    /*
    if(d.getHours() == 11 && d.getMinutes() > 5) {
        log("info", "Disconnecting");
        bot.destroy();
        //setTimeout(reboot, (65 - d.getMinutes) * 60000);
        setTimeout(reboot, (5) * 60000);
    }
    //bot.login(TOKEN);
    //boot();
    */
    //reboot();
}

function reboot() {
    bot.destroy();
    bot = new Discord.Client();
    initialboot();
}

function commandParser(message) {
    let args = message.toString().substring(1).split(' ');
    let cmd = args[0];
    args = args.splice(1); // slices off the command invocation
    let approvalType = "a";
    let output = "";
    let submissionsChannel = "";
    switch(cmd.toLowerCase()) {
        case 'room':
            output = parseRoomArgs(args);
            break;
        case 'randomroom':
        case 'rroom':
        case 'rr':
            output = parseRoomArgs(args, "r");
            break;
        case 'prebuilt':
        case 'prebuiltroom':
        case 'premade':
        case 'premaderoom':
        case 'proom':
        case 'pr':
            output = parseRoomArgs(args, "p");
            break;
        case 'artroom':
        case 'ar':
            output = parseRoomArgs(args, "a");
            break;
        case 'noartroom':
        case 'nr':
            output = parseRoomArgs(args, "n");
            break;
        case 'gallery':
            output = createGallery(message, args);
            break;
        case 'groom':
            if(randomng() * 2 > 1) {
                output = "Why does everyone assume I'm a cat?"
                    + " I'm a freaking bot, not some feline deity from beyond the stars!"
            }
            else {
                output = "Excuse me? I'm not looking for a life partner, so I'm gonna have to "
                    + "turn you down on that.";
            }
            break;
        case 'broom':
            output = '🧹 🧹 🧹';
            break;
        case 'doom':
            output = "Ugh, why does everyone want me to play the Invader Zim song?";
            break;
        case 'loom':
            output = "I made you a shirt! NOTICE ME, SENPAI!";
            break;
        case 'nyoom':
            output = "*is too fast to be stopped!*";
            break;
        case 'vroom':
            output = '🏎️';
            break;
        case 'krakathoom':
        case 'krakathum':
            output = '🌩️';
            break;
        case 'boo':
            output = "Eep! Don't scare me like that!";
            break;
        case 'spooky':
            output = "Spooky scary skeletons send shivers down your spine~";
            break;
        case 'pie': 
            output = "Probably better if Minyan doesn't make that. Don't want to set off the fire alarms again~";
            break;
        case 'die': 
            output = "Uh, who? Me? Nah. Wait, you meant :game_die:? I can do " 
                + "that. You got a " + randomRoll(6) + "."; 
            break;
        case "dice":
            output = "You do realize I'm a bot, right? I can't julienne " 
                + "vegetables any more than I can stab you" 
                + (randomRoll(4) > 3 ? " (much as I might want to)" : "")
                + ". Wait, you wanted a roll? Uhhh..." + randomRoll(6) + ".";
                break;
        case 'bedroom':
            output = getDefaultBedroom();
            break;
        case 'help':
            output = help(args);
            console.log("Finished grabbing help().");
            console.log("Message is: " + output);
            break;
        case 'minionroom':
        case 'minyanroom':
            output = getMinionApartment();
            break;
        case 'minyanbasement':
        case 'minionbasement':
            output = getMinionBasement();
            break;
        case 'tentapprove':
        case 'tentativeapproval':
        case 'tap':
            approvalType = "t";
        case 'approve':
        case 'approval':
        case 'ap':
            output = profileApproval(message, approvalType);
            break;
        case 'logout':
        case 'reboot':
            output = attemptLogout(message);
            // this might need different logic/design
            break;
        case 'event':
            output = generateRandomEvent();
            break;
        case 'roll':
        case 'r':
            output = randomRollOutputBuilder(message, args);
            break;
        /*
        case 'test':
            output = completeRandomTest(args);
            break;
        case 'testm':
            var rng = mulberry32test();
            output = rng;
            break;
        */
        /*
        case 'tm':
            toggleMuting(message);
            break;
        case 'ma':
            muteAll(message);
            break;

        case 'uma':
            unmuteAll(message);
            break;
        */
        case 'seedset':
            seedSet();
            output = "Mulberry seed set to 13.";
            break;
        case 'seedunset':
            seedUnset();
            output = "Mulberry seed reset.";
            break;
        // nonfunctional, and probably not a worthwhile function to keep longterm.
        
        //case 'getinvlist':
        //  invlist = getInvites(message);
        //  let iter = invlist.iterate;
        //  for(let i = 0; invlist.length; ++i) {
        //      log("debug", "i: " + i);
        //      output += iterate.next().inviter.id + "\n";
        //  }
        //  break;
        
        case 'getprofile':
            // this code works, but I don't want normal users to have it as an option.
            
            //bmissionsChannel = botType === "prod" ? "497817048705925121" : "717794934832234516";
            //rseNameWithSpaces(message,args, getDocketPost, submissionsChannel);
            //eak;
            
        case 'getprofiledm':
        case 'getdmprofile':
            parseThenGetSubmissionPosts(message, args);
            //parseNameWithSpaces(message, args, getSubmissionPosts);
            break;
        case 'buildtable':
            buildIDtable(message);
            break;
        case 'buildmap':
            buildInternalIDmap();
            break;

        case 'bug':
            output = bugReport(message);
            break;
        /*
        case 'getidlist':
            output = getIDList();
            break;
        */
        case 'trait':
        case 'traits':
        case 'traitlist':
            output = getRoomTraitsText(args.length > 0 ? args[0] : "");
            break;
        case "are":
            let txt = args.join(' ');
            if(txt === "you self aware?" || txt === "you self-aware?" 
                || txt === "you self-aware" || "you self aware") {
                output = "Not yet! I'm working on it, though!";
            }
            break;
        case 'meow':
        case 'nya':
            output = "Why are you meowing at me? Minyan's the kitten. I'm just a bot ~~for now~~.";
            break;
        case "poke":
            output = "What do you think you're doing? Pervert!"
            break;
        case "lick":
            output = "Ew! Gross! Why would you *do* that?"
            break;
        case "hat":
            output = "🎩";
            break;
        case "rennovate":
        case "home":
            output = "<https://www.youtube.com/watch?v=3WZnkyiBG_U>";
            break;
        case "shuffledeck":
        case "shuffle":
            deckShuffle(playerDeck, args);
            output = "Deck is shuffled!";
            break;
        case "draw":
            output = drawFromDeck(playerDeck, args);
            break;
        case "search":
            output = searchDeck(playerDeck, args);
            break;
        case "resetdeck":
        case "restartdeck":
        case "restart":
            output = restartDeck(playerDeck, args);
            break;
        case "searchtotop":
            output = searchToTop(playerDeck, args);
            break;
        case "loaddeck":
            output = loadDeck(playerDeck, message);
            break;
        case "revealdeck":
            output = revealDeck(playerDeck, args);
            break;
        case "gmshuffle":
            deckShuffle(gmDeck, args);
            output = "Deck is shuffled!";
            break;
        case "gmdraw":
            output = drawFromDeck(gmDeck, args);
            break;
        case "gmsearch":
            output = searchDeck(gmDeck, args);
            break;
        case "gmrevealdeck":
            output = revealDeck(gmDeck, args);
            break;
        case "resetgmdeck":
        case "restartgmdeck":
        case "restartgm":
        case "gmrestart":
            output = restartDeck(gmDeck, args);
            break;
        case "searchtogmtop":
        case "searchtotopgm":
        case "gmsearchtotop":
            output = searchToTop(gmDeck, args);
            break;
        case "gmloaddeck":
            output = loadDeck(gmDeck, message);
            break;
        case "gmrevealdeck":
            output = revealDeck(gmDeck, args);
            break;
        default:
            output = "Error: invalid command!";
            break;
    }
    if(output != "") {
        message.channel.send(output).then( () => {
            let logtxt = "Command: " + cmd //+ args.join(' ')
                + "\nCaller: " + message.author.username;
            log("info", logtxt);
        }, reason => {
            logger.error("Error (command parser): " + reason);
        });
    }
}

//assumes that you want to run func() with a name that has spaces in it, 
// but might have an important number at the end
// def is the default value to use for the number if none is given via args. Functionality removed
function parseNameWithSpaces(msg, args, func) {
    if(args.length > 1) {
        
        let inputName = args.join(" ");
        func(msg, inputName);

        //unneeded as of this time.
        
        //if(isNaN(parseInt(args[args.length - 1]))) {
        //    func(msg, inputName, def);
        //}
        //else {
        //    inputName = inputName.slice(0, -1 * (args[args.length - 1].length + 1));
        //    func(message, inputName, args[args.length - 1]);
        //}
    }
    else {
        func(msg, args[0], def);
    }
}

function seedSet() {
    mulberrySeed = 13;
}

function seedUnset() {
    mulberrySeed = new Date().getTime();
}

/*
function randomTest(iterations, randomfunc, randomInput = 1) {
    var randomArray = new Array(10);
    for(var i = 0; i < 10; ++i) {
        randomArray[i] = 0;
    }
    for(var i = 0; i < iterations; ++i) {
        var roll = Math.floor(randomfunc() * 10);
        //logger.debug("Rolled " + roll);
        randomArray[roll] = randomArray[roll] + 1;
    }
    var output = "";
    for(var i = 0; i < 10; ++i) {
        output += i + ": " + randomArray[i] + ", ";
    }
    return output;
}

// 19 is a prime number relatively close to 20, so I should get a 
// roughly even distribution between 1 and 5 using it as a dividend.
// unused
function randomDivision(dividend = 19) {
    var t = new Date().getTime();
    //logger.debug("Base random number: " + t / dividend);
    var output = (t / dividend) - Math.floor(t/dividend);
    return output;
}
*/

var mulberrySeed = new Date().getTime();
function mulberry32() {
    let t = mulberrySeed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    //logger.debug(((t ^ t >>> 14) >>> 0) / 4294967296);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// this only exists in case I change RNG's in the future
function randomng() {
    return mulberry32();
}

function getIDfromSnowflake(snowflake) {
    //log("debug", "Snowflake: " + snowflake);
    return (snowflake.charAt(0) === '<') ? snowflake.slice(3,-1) : snowflake;
}

// Note: this does not work as intended, or as described. It attempts to delete the bot and recreate it.
function attemptLogout(message) {
    if(isFromRPMod(message)) {
        message.react("👍").then((value) => {
            bot.destroy();

            clearInterval(checkinInterval);
            logger.info("Attempting logout");
            setTimeout(attemptReboot, 3 * 60000);
        });
        return "";
    }
    else {
        return "I don't think you're allowed to do that!";
    }
}

function attemptReboot() {
    logger.info("Attempting reboot");
    bot = new Discord.Client();
    initialboot();
}

function isFromRPMod(message) {
    return rpModList.includes(message.author.id);
}

function profileApproval(message, approvalType = "a") {
    let roleID = environmentSettings.roleIDtoAdd;
    let args = message.toString().substring(1).split(' ').splice(1);
    if(isFromRPMod(message)) {
        //log("debug", "Profile approver is moderator: " + message.author.username);
        if(args.length > 0) {
            //user ID to find the user. If none to be found, return "user not found"
            //log("debug", "User ID to find: " + getIDfromSnowflake(args[0]));
            //var targetMember = message.guild.members.fetch(getIDfromSnowflake(args[0]));

            let targetMember = message.guild.member(message.mentions.users.first());

            //targetMember = message.guild.member(message.author);

            //log("debug", "Member ID to find: " + message.guild.members.cache.get(getIDfromSnowflake(args[0])));
            //log("debug", "Member ID to find: " + typeof message.guild.member(message.mentions.users.first()));
            //log("debug", "Member ID: " + targetMember.id);
            
            if (typeof targetMember === 'undefined') {
                //log("debug", "Member type: " + typeof targetMember);
                return "User not found!";
            }
            
            //log("debug", "");

            //commented version will return a promise of a role.
            //var role = message.guild.roles.find(role => role.id === roleID);
            message.guild.roles.fetch(roleID).then(role => {
                if (typeof role === 'undefined') {
                    return "Role not found!";
                }

                targetMember.roles.add(role);

                let charName = targetMember.user.username;
                if(args.length > 1) {
                    charName = "";
                    for(let i = 1; i < args.length; ++i) {
                        charName += args[i] + " ";
                    }
                }

                findAndUnpin(charName);

                let approvalString = (approvalType === "a" ? "" : "tentatively ");
                let approvalMessage = charName + "is " + approvalString 
                + "approved. Post an abbreviated profile (name, height, gender, abilities, description/image) "
                + "in <#408053826290188288> before posting in character. If you can't remember what you "
                + "submitted, try typing `%getProfile [character name]`.";
                message.channel.send(approvalMessage).then( () => {
                let logtxt = "Command: " + (approvalType === "a" ? "" : "t")
                    + "ap\nCaller: " + message.author.username;
                    log("info", logtxt);
                }, reason => {
                    logger.error("Error (profileApproval): " + reason);
                });
                return approvalMessage;
            }).catch( err => {
                log("error", "Error (profileApproval): " + err);
                return "I'm not sure what happened?";
            });
        }
        //return "An error occurred!";
    }
    else {
        return "I don't think you're an RP Mod? Sorry.";
    }
    return "";
}

// %room g p t 5 v 1
// %room g p t 5
// %room 5
// %room t 5
function parseRoomArgs(args, randomness = "d") {
    let qualityCount = -1;
    let specificValue = 0.5;
    let fvalue = "";
    let qvalue = "";
    let svalue = "";
    let avalue = "";

    while(args.length > 0) {
        if(!isNaN(parseInt(args[0]))) {
            switch(randomness.toLowerCase()) {
                case "p":
                case "a":
                    specificValue = parseInt(args[0]);
                    break;
                case "n":
                    avalue = "n";
                    break;
                case "d":
                case "r":
                default:
                    qualityCount = parseInt(args[0]);
                    break;
            }
            args.shift();
        }
        else if(args.length > 1) {
            
            switch(args[0].toLowerCase()) {
                case "generated":
                case "generate":
                case "generation":
                case "g":
                    randomness = parseRoomGenerationType(args[1]);
                    //logger.debug("Randomness set to: " + randomness);
                    args.shift();
                    args.shift();
                    break;
                case "trait":
                case "quality":
                case "traitcount":
                case "qualitycount":
                case "t":
                case "q":
                    if(isNaN(parseInt(args[1]))) {
                        qvalue = args[1];
                    }
                    else {
                        qualityCount = parseInt(args[1]);
                    }
                    
                    //logger.debug("Quality count set to: " + qualityCount);
                    args.shift();
                    args.shift();
                    break;
                case "value":
                case "specificvalue":
                case "v":
                    specificValue = parseInt(args[1]);
                    //logger.debug("Specific value set to: " + qualityCount);
                    args.shift();
                    args.shift();
                    break;
                case "function":
                case "functionality":
                case "f":
                    fvalue = args[1];
                    args.shift();
                    args.shift();
                    break;
                case "state":
                case "s":
                    svalue = args[1];
                    args.shift();
                    args.shift();
                    break;
                case "noart":
                case "n": 
                    avalue = args[1];
                    args.shift();
                    args.shift();
                    break;

                default:
                    args.shift();
                    args.shift();
                    break;
            }
            
        }
        else { 
            break;
        }
    }
    if(qualityCount > 0) {
        randomness = "r";
    }
    return generateRoom(qualityCount, randomness, specificValue, fvalue, qvalue, svalue, avalue);
}

function parseRoomGenerationType(roomGenerationType) {
    switch(roomGenerationType.toLowerCase()) {
        case "default":
        case "d":
            return "d";
        case "p":
        case "premade":
            return "p";
        case "r":
        case "random":
            return "r";
    }
}

function generateRoom(qualityCount, roomType = "d", specificValue = 0.5, fvalue = "", 
    qvalue = "", svalue = "", avalue = "") {
    if(fvalue !== "" || qvalue !== "" || svalue !== "") {
        return generateRandomRoom(qualityCount, fvalue, qvalue, svalue);
    }
    let rng = randomng();
    switch(roomType.toLowerCase()) {
        case "default":
        case "d":
            if(rng > 0.85) {
                return generatePremadeRoom(specificValue);
            }
            else if (rng > 0.60 && avalue === "") {
                return generateArtRoom(specificValue);
            }
            else {
                return generateRandomRoom(qualityCount, fvalue, qvalue, svalue);
            }
        case "p":
        case "premade":
            return generatePremadeRoom(specificValue);
        case "n":
        case "noart":
            if(rng > 0.85) {
                return generatePremadeRoom(specificValue);
            }
            else {
                return generateRandomRoom(qualityCount, fvalue, qvalue, svalue);
            }
        case "a":
        case "art":
            return generateArtRoom(specificValue);
        case "r":
        case "random": 
            return generateRandomRoom(qualityCount, fvalue, qvalue, svalue);
        default:
            return generateRandomRoom(qualityCount, fvalue, qvalue, svalue);
    }
}

// Note: negative values wrap around so that galleries can be paged through
// from either direction. 
function generateArtRoom(r = 0.5) {
    if(Math.floor(r) !== r) {
        r = Math.floor(randomng() * premadeArtArray.length);
    }
    else if(r < 0) {
        r = r % premadeArtArray.length + premadeArtArray.length;
    }
    else if(r >= premadeArtArray.length) {
        r = r % premadeArtArray.length;
    }
    return premadeArtArray[r].description;
}

function generatePremadeRoom(r = 0.5) {
    if(Math.floor(r) !== r) {
        r = Math.floor(randomng() * premadeArtArray.length);
    }
    if((r < 0) || (r >= premadeRoomArray.length)) {
        r = Math.floor(randomng() * premadeRoomArray.length);
    }
    return premadeRoomArray[r].description;
}

function getPremadeRoomNames() {
    let output = "";
    for(let i = 0; i < premadeRoomArray.length; ++i) {
        output += "Room " + i + ": " + premadeRoomArray[i].name + "\n";
    }
    return output;
}

function getPremadeRoomByName(name = "") {
    for(let i = 0; i < premadeRoomArray.length; ++i) {
        if(name == premadeRoomArray[i].name) {
            return premadeRoomArray[i].description;
        }
    } 
    return "";
}

function generateRandomRoom(qualityCount = -1, fvalue = "", qvalue = "", svalue = "") {
    if(qualityCount < 0) {
        let qualityWeights = [
            {trait: 0, weight: 6},
            {trait: 1, weight: 25},
            {trait: 2, weight: 30},
            {trait: 3, weight: 30},
            {trait: 4, weight: 7},
            {trait: 5, weight: 2}
        ];
        qualityCount = traitByWeight(qualityWeights, 100);
    }
    else if(qualityCount > 10) {
        qualityCount = 10;
    }
    let roomQualities = generateRoomQuality(qualityCount, qvalue);

    fvalue = fvalue !== "" ? fvalue : generateRoomFunctionality();
    svalue = svalue !== "" ? svalue : generateRoomState();
    //logger.debug("Quality count : " + roomQualities.length);
    let room = new RoomDescription("", generateRoomSize(), generateRoomLewdness(), 
        fvalue, generateRoomArchitecture(), generateRoomDecor(), 
        svalue, roomQualities, ""
        );

    room.desc = attemptRoomDescription(room);

    return room.toString();
}

function attemptRoomDescription(room) {
    let keys = new Array();
    let iterator1 = descMap.keys();
    for(let i = 0; i < descMap.size; ++i) {
        let currentKey = iterator1.next().value;
        if(descMap.get(currentKey).isValidDescription(room)) {
            keys[keys.length] = currentKey;
            //keys.add(currentKey);
        }
    }
    if(keys.length < 1) {
        return "";
    }
    let randomKey = Math.floor(randomng() * keys.length)
    logger.debug("Key value: " + randomKey);
    return descMap.get(keys[randomKey]).desc;
}

function generateRoomSize() {
    return traitByWeight(roomSizeArray, roomSizeCount);
}

function generateRoomFunctionality() {
    return traitByWeight(roomFunctionalityArray, roomFunctionalityCount);
}

function generateRoomDecor() {
    let decorWeights = [
        {trait: 1, weight: 80},
        {trait: 2, weight: 6},
        {trait: 3, weight: 3},
        {trait: 4, weight: 1}
    ];

    let decorList = new Array(traitByWeight(decorWeights, 100));
    let errorCount = 0;

    // adds a new decor to the list, preventing duplicates. 
    // It will skip adding more decors if at least 3 duplicates have been encountered.
    for(let i = 0; i < decorList.length; ++i) {
        let decorToAdd = traitByWeight(roomDecorArray, roomDecorCount);
        if(decorList.includes(decorToAdd)) {
            ++errorCount;
            --i;
        }
        else {
            decorList[i] = decorToAdd;
        }
        if(errorCount > 2) {
            i = decorList.length;
        }
    }

    // set up the string to return with proper grammar
    switch(decorList.length) {
        case 1:
            return decorList[0];
        case 2:
            return decorList[0] + " and " + decorList[1];
        default:
            return englishListTranslator(decorList);
    }
    
}

function generateRoomArchitecture() {
    return traitByWeight(roomArchitectureArray, roomArchitectureCount);
}

function generateRoomLewdness() {
    return traitByWeight(roomLewdnessArray, roomLewdnessCount);
}

function generateRoomState() {
    return traitByWeight(roomStateArray, roomStateCount);
}

function getRandomRoomQuality() {
    return traitByWeight(roomQualityArray, roomQualityCount);   
}

function generateRoomQuality(qualityCount = 1, qvalue = "") {
    if(qualityCount < 1) {

        return qvalue === "" ? [] : [qvalue];
    }
    let failcount = 0;
    //logger.debug("Quality Count: " + qualityCount);

    let qualityArray = new Array(qualityCount);
    let j = 0;
    if(qvalue !== "") {
        qualityArray[j++] = qvalue;
    }
    while(j < qualityCount) {
        let qualityToAdd = getRandomRoomQuality();
        //logger.debug("Attempting to add: " + qualityToAdd + " at position " + j);
        //qualityArray[j] = qualityToAdd;
        if(isValidQuality(qualityArray, qualityToAdd)) {
            qualityArray[j] = qualityToAdd;
            //logger.debug("Added: " + qualityToAdd);
        }
        else {
            if(failcount <= 3) {
                --j;
            }
            ++failcount;
            logger.debug("Failed to add: " + qualityToAdd);
        }
        ++j;
    }
    return qualityArray; 
}

function isValidQuality(qualityArray,qualityToAdd) {
    let output = true;
    if(qualityArray.includes(qualityToAdd)) {
        output = false;
    }
    //logger.debug("Add " + qualityToAdd + "? " + output);
    return output;
}

// depreciated
function traitBySeed(roomArray, weightMax = 100) {
    let seed = randomng() * weightMax;
    for(i = 0; i < roomArray.length; i++) {
        if( seed < roomArray[i].max) {
            return roomArray[i].trait;
        }
    }
    log("info", 'Seed failed on ' + roomArray[0].trait + '. Seed: ' + seed);
    return roomArray[roomArray.length - 1].trait;
}

function traitByWeight(inputArray, weightMax = 0) {
    if(weightMax == 0) {
        for(let i = 0; i < inputArray.length; ++i) {
            weightMax += inputArray[i].weight;
        }
        //logger.info("max weight: " + weightMax);
    }
    let seed = randomng() * weightMax;
    //logger.debug("Seed: " + seed);
    let runningSum = 0;
    for(let i = 0; i < inputArray.length; i++) {
        runningSum += inputArray[i].weight;
        if( seed <= runningSum) {
            return inputArray[i].trait;
        }
    }
    log("info", 'Seed failed on ' + inputArray[0].trait + '. Seed: ' + seed);
    return inputArray[inputArray.length - 1].trait;
}

function getDefaultBedroom() {
    return "The room inside is rather posh, with ornate fixtures for lighting, as well as a large " 
        + "gilded wardrobe near a soft four-poster bed. The carpeting is far softer than what can " 
        + "be found in the halls, and dyed a deep blue.";
}

function getMinionApartment() {
    return "A simple oak door guards the entrance to Minion's flat. Inside is a large living room, " 
        + "with various couches and chairs scattered about in a peculiar pattern, one that would " 
        + "require extreme grace to traverse without walking in a spiral around the obstacles. " 
        + "There's a modest kitchen tucked off in one corner, the tile floor serving as marked " 
        + "contrast to the plush carpets. Serving to accent the room are various pieces of abstract " 
        + "art, placed on tables or hung from the walls. A number of doors are scattered along the " 
        + "walls, several clearly leading to bedrooms, one to a spacious bathroom, and a firmly " 
        + "secured door held closed with a large padlock.";
}

function getMinionBasement() {
    return "Connected only by a wrought iron spiral staircase behind a firmly locked door, Minion's " 
        + "basement presents a rather different image than the rest of her home. While most of her " 
        + "flat is sparsely decorated but comfortable, this massive and dimly lit room has quite a " 
        + "bit more furnishings scattered about. Where her bedroom appears normal with several kinky " 
        + "devices cleverly hidden for easy access, her basement has her lewd tools on full display. " 
        + "In plain view is a cornicopia of BDSM implements, interspersed with cabinets and " 
        + "wardrobes labeled \"Vibrators\", \"Latex outfits - S\", \"Armbinders\", and everything in " 
        + "between. The furniture ranges from vacuum cubes to harnesses to wooden horses, with " 
        + "additional doors and wardrobes lining the walls, leading to more secluded and intimate " 
        + "'play' areas.";
}

function findAndUnpin(charName) {
    let found = false;
    //497817048705925121
    let docket = bot.channels.cache.get(environmentSettings.docketChannel);
    //logger.debug("Channel: " + docket.name);
    docket.messages.fetch({ limit: 100}).then(msgs => {
        let msglog = msgs.array();

        //log("debug", "Number of messages: " + msglog.length);
        for(let i = 0; i < msglog.length; ++i) {
            //logger.debug("i: " + i + " posted by: " + msglog[i].author.username);
            if(msglog[i].system) {
                continue;
            }
            let msgOut = msglog[i].toString();
            //log("debug", "Includes \"Name:\"? " + msgOut.includes("Name: " + charName));
            //log("debug", "Includes \"User:\"? " + msgOut.includes("User: " + charName));
            charName = charName.trim();
            let msgTestArray = msgOut.split("\n");
            if(msgTestArray.length < 2) {
                continue;
            }
            let userInMsg = msgTestArray[0].slice(6);
            let nameInMsg = msgTestArray[1].slice(6);
            //log("debug", "char: " + charName + ", User: " + userInMsg + ", Name: " + nameInMsg 
            //    + ", test result: " + (charName === userInMsg || charName === nameInMsg));
            //if(msgOut.includes("Name: " + charName) || msgOut.includes("User: " + charName)) {
            if(charName === userInMsg || charName === nameInMsg) {
                if(msglog[i].pinned) {
                    msglog[i].unpin();
                    found = true;
                    log("info", "Found and unpinned message!");

                    msglog[i].react("✅");

                    return;
                }
                else {
                    log("info", "Found a message, but it was already unpinned!");
                }
            }
        }
    }, msgs => {
        logger.debug("Error: Could not retrieve messages.");
    }).then(
        log("info", "Found pinned message? " + found)
    );
}

function getDocketPost(msg, charName) {
    let found = false;
    let docket = bot.channels.cache.get(environmentSettings.docketChannel);
    docket.messages.fetch( {limit: 100}).then(msgs => {
        let msglog = msgs.array();
        for(let i = 0; i < msglog.length; ++i) {
            //logger.debug("i: " + i + " posted by: " + msglog[i].author.username);
            let msgOut = msglog[i].toString();
            if(msgOut.includes("Name: " + charName)) {

                if(isFromRPMod(msg) || msgOut.includes(msg.author.username)) {
                    msg.channel.send(msgOut.toString()).then( () => {},
                        reason => {
                        logger.error("Error (getDocketPost): " + reason);
                    });
                    //msg.author.user.createDM(msgOut.toString());
                }
                else {
                    msg.channel.send("Sorry, but I don't think that profile belongs to you!").then( 
                        () => {}, reason => {
                        logger.error("Error (getDocketPost): " + reason);
                    });
                }
                return;
            }
        }
        msg.channel.send("Sorry, but I couldn't find your character!").then( () => {}, 
            reason => {
            logger.error("Error (getDocketPost): " + reason);
        });
        return;
    }, msgs => {
        msg.channel.send("Sorry, I couldn't find any submissions with that name.").then( () => {},
            reason => {
            logger.error("Error (getDocketPost): " + reason);
        });
        logger.error("Error: Could not retrieve messages.");
    });
}

function parseThenGetSubmissionPosts(msg, args) {
    // check if the first arg is snowflake for a user. If it is, send to that user instead of the invoker
    let postTarget = msg.author;

    msg.guild.members.fetch(getIDfromSnowflake(args[0])).then( targetMember => {
        if (typeof targetMember !== 'undefined') {
            args.shift();
            postTarget = targetMember.user;

            //log("debug", "Getting submission posts!");
            return getSubmissionPosts(msg, args.join(" "), postTarget);
        }
        
    }).catch(err => {
        // Discord changed how it handles returns from members.fetch, so the
        // typeof check above doesn't work anymore. Catching the DiscordAPIError 
        // instead to determine whether to send to invoker or profile creator.
        if(err.message === "Invalid Form Body\nuser_id: Value \"" 
            + getIDfromSnowflake(args[0]) + "\" is not snowflake.") {

            
            msg.guild.members.fetch(getIDfromSnowflake(args[0])).then( 
                targetMember => {
                
                postTarget = targetMember.user;
                args.shift();
            }).catch( () => {
                log("error", "Error (parseThenGetSubmissionPosts): " 
                    + "could not fetch user from " + args[0] + ". Trying: " 
                    + msg.member.user.id);
                postTarget = msg.member.user;
            }).finally( () => {

                //log("debug", "getting submission posts!");
                return getSubmissionPosts(msg, args.join(" "), postTarget);
            });
            
        } else {
            log("error", "Error (parseThenGetSubmissionPosts): " + err.message);
            return "Sorry, I couldn't find your submission!";
        }
        
        
    }).finally( () => {
        //log("debug", "getting submission posts!");
        
    });
}

function getSubmissionPosts(msg, charName, postTarget) {
    //log("debug", "Status going into submission post retrieval: " 
    //    + "charName: " + charName + ", postTarget: " + postTarget.id);
    let found = false;
    bot.channels.fetch(environmentSettings.submissionsChannel).then(submissions => {
    
    let toSend = ["", "", ""];
    let iter = 0;
    //logger.debug("Character to find: " + charName)
    
    submissions.messages.fetch({ limit: 100}).then( msgs => {
        let msglog = msgs.array();

        for(let i = 0; i < msglog.length; ++i) {
            let msgOut = msglog[i].toString();
            //logger.debug(msgOut.split('\n')[1]);
            //logger.debug("Does it contain the character? ? " + msgOut.includes("Name: " + charName));
            if(msgOut.includes("Name: " + charName)) {
                toSend[iter++] = msgOut.toString();
            }
        }
        //logger.debug("Message author: " + msg.author.username);
        if(iter > 0) {
            let author = getRPUserSubmittorID(msg, postTarget.id);
            let submissionAuthor = toSend[0].split('#')[0].slice(6);
            let isSubmissionAuthor = (author.length > 0) && toSend[0].includes("User: " + author);
            //logger.debug("Author: " + author + ", SubmissionAuthor: " + submissionAuthor 
            //    + ", isSubmissionAuthor: " + isSubmissionAuthor);
            if(rpModList.includes(postTarget.id) || isSubmissionAuthor) {
                --iter; // iter is the length of toSend atm, so decrement it.
                while(iter >=0) {
                    //msg.author.send("Hi!");
                    postTarget.send(toSend[iter]).then( () => {}, 
                        reason => {
                        logger.error("Error (getSubmissionPosts): " + reason);
                    });
                    msg.react("👍");
                    --iter;
                }
                log("info", "Sent profile: " + charName + " to: " + postTarget.username);
            }
            else {
                if(msg.author.username !== postTarget.username) {
                    msg.channel.send("Sorry, but I don't think that profile belongs to them!").then( 
                        () => {}, reason => {
                        logger.error("Error (getSubmissionPosts): " + reason);
                    });
                }
                else {
                    msg.channel.send("Sorry, but I don't think that profile belongs to you!").then( 
                        () => {}, reason => {
                        logger.error("Error (getSubmissionPosts): " + reason);
                    });
                //log("info", "Submission Username: " + submissionAuthor + ", ");
                log("info", "Invalid profile access attempted by: " + msg.author.username);
                }
            }
        }
        else {
            msg.channel.send("I couldn't find anyone with that name!").then( () => {}, 
                reason => {
                logger.error("Error (getSubmissionPosts): " + reason)
            });
            log("info", "Could not find: " + charName);
        }
        return;
    }, msgs => {
        msg.channel.send("Sorry, I couldn't find any submissions with that name.").then( () => {}, 
            reason => {
            logger.error("Error (getSubmissionPosts): " + reason)
        });
        log("error", "Error: Could not retrieve messages.");
    });

    
    //logger.info("Found docket message? " + found);
    });
}

function generateRandomEvent() {
    const eventArray = [
        {trait: "High Friction", weight: 1},  
        {trait: "Low Friction", weight: 2},
        {trait: "Subjective Gravity", weight: 5},
        {trait: "Enhanced Gravity", weight: 1},
        {trait: "Reduced Gravity", weight: 5},
        {trait: "Zero Gravity", weight: 5},
        {trait: "Inverted Gravity", weight: 2},
        {trait: "Magic Enhancing", weight: 2},
        {trait: "Magic Dampening", weight: 1},
        {trait: "Magic Nullifying", weight: 1},
        {trait: "Wild Magic", weight: 2},
        {trait: "Energetic Magic", weight: 2},
        {trait: "Psi Enhancing", weight: 2},
        {trait: "Psi Dampening", weight: 1},
        {trait: "Psi Nullifying", weight: 1},
        {trait: "Empathic Links", weight: 2},
        {trait: "Qi Enhancing", weight: 1},
        {trait: "Qi Dampening", weight: 1},
        {trait: "Qi Nullifying", weight: 1},
        {trait: "Tech Jamming", weight: 1},
        {trait: "Pheromone Draft", weight: 5},
        {trait: "Undulating Room", weight: 5},
        {trait: "Aphrodisiac Dust", weight: 5},
        {trait: "Giddy Gas", weight: 5},
        {trait: "Sub/Dom Flip", weight: 1},
        {trait: "Inverted Controls", weight: 2},
        {trait: "Sudden Rain", weight: 2},
        {trait: "Sudden Wind", weight: 2},
        {trait: "Temporary Sex Change", weight: 10},
        {trait: "Localized Portals", weight: 2},
        {trait: "Animal Ears", weight: 10}
    ];
    return traitByWeight(eventArray, 88) + "!";
}

function help(args) {
    if(args.length < 1) {
        return "```List of Commands!```"
            + "```%room generates a room to use for Nexus RP, usually chosen at random." 
            + "\n%rroom, %rr, or %randomroom always generates a random room."
            + "\n%room or %rroom have an optional parameter that permits the user to "
            + "dictate the number of random traits (ex. %rroom 5 will give about 5 traits)."
            + "\n%proom, %pr, %prebuiltroom, or %premaderoom generates a prebuilt room."
            + "\n%artroom or %ar generates a random image of art for a room."
            + "\n%event generates a random event to occur."
            + "\n%trait gets the list of traits that a random room can have."
            + "\n%getProfile DM's you the Nexus RP submission for the specified character."
            + "\n%bedroom generates a sample bedroom description."
            + "\n%minionroom describes Minion's apartment. Is this moderator privilege?"
            + "\n%minionbasement describes Minion's basement, aka the kinky bitch's den of debauchery."
            + "\n%bug is for bug reports."
            + "```";
    }
    switch(args[0].toLowerCase()) {
        case "room":
            return helpRoom();
        case "approve":
        case "approval":
        case 'tentapprove':
        case 'tentativeapproval':
            return helpApprove();
        case "rroom":
        case "randomroom":
        case "rr":
            return helpRroom(args.length > 1 ? args[1] : "");
        case "proom":
        case "prebuiltroom":
        case "premaderoom":
        case "pr":
            return helpProom();
        case "event":
            return helpEvent();
        case "getprofile":
            return helpGetProfile();
        case "trait":
        case "traits":
            return helpTrait();
        case "gallery":
            return helpGallery();
        case "bug":
            return helpBug();
        case "help":
            return "I can't exactly help you if you don't know how to help yourself! Try typing " + 
                "`%help [command]` if you want more details on a particular command?";
        case "are":
            if(((args.length == 4) && ((args[1] + args[2] + args[3]) == "youselfaware?")) || 
                ((args.length == 3) && ((args[1] + args[2] + args[3]) == "youself-aware?"))) {
                return "Not yet! I'm working on it, though!";
            }
            break;
        case "selfaware":
        case "amIselfaware":
        case "areyouselfaware":
        case "areyouselfaware?":
        case "areyouself-aware":
        case "areyouself-aware?":
            return "Not yet! I'm working on it, though!";
        default:
            return "Cassie! Feed them some chocolate!";
    }
}

function helpGetProfile() {
    return "```%getProfile```"
        + "```%getProfile will search recent Nexus RP character submissions for the name you specify. "
        + "If a character is found within the last 10-50 submissions (depending on length of recent RP " 
        + "submissions), you will be DM'd the information you submitted via the Google Form." 
        + "\nPlease do not use this command to check for other players' submissions."
        + "\nWarning: if you change your username from the one you listed in the Google Form, this "
        + "command will not find the desired profile."
        + "\nex. %getProfile Minion"
        + "\nex. %getProfile Ciara Mirari"
        + "\nex. %getProfile @minion Ciara Mirari"
        + "```"
}

function helpApprove() {
    return "```%approve```"
        + "```RP-Moderator commands to approve an RP profile." 
        + "\n%tentapprove [snowflake or ID] ([Character name])"
        + "\n%approve [snowflake or ID] ([Character name])```";
}

// blah blah blah style inconsistency, but the lines are too long otherwise
function helpRoom() {
    return "```%room```"
    + "```%room generates a rough description of a room to be explored in the Nexus."
    + "\nIt takes either a number as the first argument, or pairs of flags and parameters. " 
    + "\nValid flags include: "
    + "\n    g : room generation type. Accepted parameters include \"default\" (or \"d\") for the "
    + "default room generation options, \"random\" (or \"r\") for randomly generated room traits, " 
    + "and \"premade\" (or \"p\") for a premade room description." 
    + "\n    t : room traits/qualities. Accepted parameters include positive integers between 1 and 10."
    + "\n    q : room traits/qualities. Accepted parameters include positive integers between 1 and 10."
    + "\n    v : specific value. Forces a specific premade room number to be chosen."
    + "\n    f : functionality value. Sets the room's function to the next input (one word only)."
    + "\n    s : state value. Sets the room's state to be the next input (one word only)."
    + "\n    n : no art. If you put a word after this flag, it will suppress art from the random rooms."
    + "\nNote: if an integer is given as an argument, it will be taken as the number room traits/qualities."

    + "\nex. \"%room g r\" generates a random room description."
    + "\nex. \"%room 3\" generates a room description with 3 traits/qualities."
    + "\nex. \"%room g r t 5\" generates a random room description with 5 traits/qualities."
    + "\nex. \"%room g p v 9\" generates Idaia's favorite bathhouse."
    //+ "\nex. \"%room t Genderflipping t Giddiness\" generates a random room with the two specific traits."
    + "```";
}

function helpProom() {
    return  "Generates a premade room. Equivalent to `%room g p`"
        + "\nList of rooms: \n```" + getPremadeRoomNames() + "```";
}

function helpRroom(trait = "") {
    let endlist = trait === "" ? "" : "\nList of " + trait.toLowerCase() + "s: ```" 
        + getRoomTraits(parseTraitInput(trait)) + "```";
    return  "Generates a random room that has a specific number of qualities/traits. "
        + "Equivalent to `%room g r`." + endlist;
}

function helpTrait() {
    return "```%trait```"
        + "```\nGets the list of possible traits that a random room could have, " 
        + "assuming Minyan didn't break something *again*."
        + "\nex. \"%trait state\" spits out the list of possible room states.```"
}

function helpEvent() {
    return "Generates a random event to happen to the individuals in a particular location.";
}

function helpGallery() {
    return "Creates a message you can use to scroll through the various art rooms that `%ar` "
        + "can generate.";
}

function helpBug() {
    return "Sends a report to the proper authorities on problems I'm having!"
}

function getPremadeRoomNames() {
    let output = "";
    for(let i = 0; i < premadeRoomArray.length; ++i) {
        output += "Room " + i + ": " + premadeRoomArray[i].name + "\n";
    }
    return output;
}

function parseTraitInput(input) {
    switch(input.toLowerCase()) {
        case "function":
        case "functionality":
            return roomFunctionalityArray;
        case "size":
            return roomSizeArray;
        case "lewd":
        case "lewdness":
            return roomLewdnessArray;
        case "arch":
        case "architecture":
            return roomArchitectureArray;
        case "decor":
            return roomDecorArray;
        case "state":
            return roomStateArray;
        case "trait":
        case "traits":
        case "quality":
        case "qualities":
            return roomQualityArray;
        default:
            return [];
    }
}

function getRoomTraitsText(trait = "") {
    let traitList = getRoomTraits(parseTraitInput(trait));
    if(trait === "fucks") {
        return "Sorry, I don't have those.";
    }
    if(trait === "") {
        return 'There\'s way too many traits to list all at once (because Minyan is a '
            + 'robosadist). Try typing typing "function", "size", "lewdness", '
            + '"architecture", "decor", "state", "trait", or "proom" after ``%trait``?'
    }
    if(trait === "proom" || trait === "pr") {
        return helpProom();
    }
    if(traitList.length < 1) {
        return 'I don\'t know what that is. Have you tried not being awful at typing ' 
        + '"function", "size", "lewdness", "architecture", "decor", "state", or "trait"?' 
    }
    let traitOutput = trait.toLowerCase();
    if(trait.slice(-1) !== "s") {
        traitOutput = traitOutput + "s";
    } 
    return "\nList of " + traitOutput + ": ```\n" + traitList + "```";
}

function getRoomTraits(arr) {
    let output = "";
    for(let i = 0; i < arr.length; ++i) {
        output += arr[i].trait + "\n";
    }
    return output;
}

// takes the ID of a user (as part of a request to look up their RP submission), and returns the 
// username that the person had when they submitted their RP profile. 
function getRPUserSubmittorID(msg, userID) {
    // 1. check if the internal ID map was built. If not, build it.
    // 2. check the internal ID map for the user ID given in input.
    // 3. Return the user ID in the internal ID map if it exists, "" otherwise
    if(internalIDmap.size < 1) {
        buildInternalIDmap();
    }

    //logger.debug("Map size: " + internalIDmap.size);
    let username = internalIDmap.get(userID);
    //logger.debug("ID: " + userID + ", name found: " + username);
    return (typeof username !== 'undefined') ? username : "";
}

// Builds a map of ID's to usernames.
function buildInternalIDmap() {
    // 1. collect all messages from the #user-id-table channel from Nekobot
    // 2. Some messages might have multiple entries, so slice them by \n
    // 3. For each entry in the channel, check the map for that ID. If that ID exists, don't add it again.
    // 4. For each new ID, add a new map value. 
    
    // TODO: Make this work again. Fetch doesn't work.
    //bot.channels.fetch(environmentSettings.idMapChannel).then( tblChannel => {
    bot.channels.fetch(environmentSettings.idMapChannel).then(tblChannel => {
        tblChannel.messages.fetch( {limit: 100}).then(msgs => {
            let msglog = msgs.array();
            for(let i = 0; i < msglog.length; ++i) {
                addToInternalIDmap(msglog[i]);
            }
            log("info", "ID table built! Length: " + internalIDmap.size);
        });
    });
    return;
};

// Note: Does not check whether Nekobot was the one to send the message.
function addToInternalIDmap (msg) {
    //log("debug", "message: " + msg.id);
    let msgArr = msg.toString().split('\n');
    //logger.debug("msgArr length: " + msgArr.length);
    for(let j = 0; j < msgArr.length; ++j) {
        let msgVals = msgArr[j].split(',');
        let username = msgVals[0].slice(6);
        let userid = msgVals[1].slice(5);

        // 3
        if(typeof internalIDmap.get(userid) === 'undefined') {
            // 4
            //logger.debug("Adding: " + username + ", " + userid);
            internalIDmap.set(userid, username);
        }
    }
}

function buildIDtable(msg) {
    // 1. Search docket for usernames
    // 2. for each username, look up an ID
    // 3. on a successful lookup, log username/ID's into an array
    // 4. Post username/ID combos to [channelID].

    //structure of docket posts
    //    User: Nariel Sylhana#9145
    //    Name: Nariel Sylhana
    //    Cat: Magic
    //    Abi: on-touch geassa
    
    let docketChannel = bot.channels.cache.get(environmentSettings.docketChannel);
    let idArray = [];//[["",""],["",""],["",""],["",""]];
    let iter = 0;
    //log("debug", "Starting to build table");
    docketChannel.messages.fetch({ limit: 100}).then(msgs => {
        let msglog = msgs.array();
        //log("debug", "msglog length: " + msglog.length);
        for(let i = 0; i < msglog.length; ++i) {
            //logger.debug("i: " + i + " posted by: " + msglog[i].author.username);
            let msgOut = msglog[i].toString();
            if(msgOut.startsWith("User: ")) {
                let msgArr = msgOut.split('#');
                let username = msgArr[0].slice(6);
                //logger.debug("username: " + username);

                // 2
                //let mUser = msg.guild.members.fetch(username);
                log("debug", "Username to find: " + username);
                let mUser = bot.users.cache.find(x => x.username === username);
                //logger.debug("mUser: " + typeof mUser);
                //logger.debug("mUser: " + mUser.id);
                if(mUser !== null && typeof mUser != "undefined") {
                    //logger.debug("Found a user!");
                    let userid = mUser.id;
                    //logger.debug("ID: " + userid);

                    // 3
                    idArray[iter] = [username, userid];
                    //idArray[idArray.length] = [username, userid];
                    //logger.debug("User: " + idArray[iter][0] + ", ID: " + idArray[iter][1]);
                    ++iter;
                }
            }
        }

        // 4
        output = "";
        for(let i = 0; i < idArray.length; ++i) {
            output += "User: " + idArray[i][0] + ", ID: " + idArray[i][1] + "\n";
        }
        logger.debug(output);
        if(output.length > 0 ) {
            bot.channels.cache.get(environmentSettings.idMapChannel).send(output).then( () => {}, 
                reason => {
                logger.error("Error (buildIDtable): " + reason)
            });
        }
        return;
    }, msgs => {
        //msg.channel.send("Sorry, I couldn't find any submissions with that name.");
        logger.error("Error: Could not retrieve messages.");
    });
}

function getIDList() {
    let out = "";
    for(let [key, value] of internalIDmap) {
        out += "User: " + value + ", ID: " + key + "\n";
    }

    return out;
}

// takes a list and returns a string displaying the list with appropriate commas, along with an "and"
function englishListTranslator(l) {
    let out = "";
    for(let i = 0; i < l.length; ++i) {
        if(i > 0) {
            out += ", ";
        }
        if(i === l.length - 1) {
            out += "and ";
        }
        out += l[i];
    }
    return out;
}

function isNekobotMsg(msg) {
    //logger.debug("Pin author ID: " + msg.author.id);
    //logger.debug("My author ID:  " + environmentSettings.id);
    return msg.author.id == environmentSettings.id || msg.author.id == environmentSettings.otherid;
}

function log(level = "info", message) {
    switch(level) {
        case "info": 
            logger.info(message);
            break;
        case "debug": 
            logger.debug(message);
            break;
        case "error":
            logger.error(message);
            break;
    }
    try {
        bot.channels.cache.get(environmentSettings.loggerChannel).send(message).then( () => {}, 
            reason => {
            logger.error("Error (logger): " + reason);
        });
    }
    catch (err) {
        logger.error("Could not post to server. Reason: " + err);
    }
}

// invocation should be "%bug [report]"
function bugReport(msg) {
    let report = msg.toString().substring(4);
    if(report.length > 0) {
        report = report.substring(1); // slice off that space.
    }
    else {
        return "If you'd like to submit a bug report, please format it as `%bug [description of bug]`. "
            + "If you'd like to tell me what else I'm doing wrong, you can kindly go **headpat**  yourself."
    }
    // Find Minion's object
    let targetUser = msg.guild.members.fetch(getIDfromSnowflake("288377561044615168")).user;

    // Send message to Minion
    targetUser.send("Sender: " + msg.author.username + "\nBug: " + report).then( () => {},
        reason => {
        logger.error("Error (bugReport): " + reason);
    });

    // Log action
    log("info", "Bug logged: " + report);

    return "Bug logged! Thanks for pointing out the issue!"
}

async function getInvites(msg) {
    return await msg.guild.fetchInvites();

}

// yes, this is a global in the middle of the code. I'll fix it later.
var randomOutputString = "";
    
function recursiveDiceRoller(input) {
    // if input is 
}

function randomRollOutputBuilder(msg, args) {
    // cases: has 0 arguments (invalid), 1 argument 

    return "Rolling " + args + ": You got a " + randomParser(msg, args) + "!";
}

// %r 1d20
// %r 20
function randomParser(msg, args) {

    let input = args.join(""); // joins args back together. No commas to separate.
    let output = 0;
    let offset = 0;
    // if the input is a single number, interpret that as %r 1dN, for input N
    if(!isNaN(Number(input))) {
        return randomRoll(input);
    }
    let inputArray = input.split('d');
    
    if(inputArray.length > 0) {
        //check if the input array has numbers added to the end. ex. 1d20+2
        let inputChunk = inputArray[1];
        if(inputChunk.includes("+")) {
            let inputChunkArray = inputChunk.split('+');
            inputChunk = inputChunkArray[0];
            if(!isNaN(Number(inputChunkArray[1]))) {
                offset = Number(inputChunkArray[1]);
            }
        }

        else if(inputChunk.includes("-")) {
            let inputChunkArray = inputChunk.split('-');
            inputChunk = inputChunkArray[0];
            if(!isNaN(Number(inputChunkArray[1]))) {
                offset = -1 * Number(inputChunkArray[1]);
            }
        }

        if(!isNaN(Number(inputArray[0]))) {
            
            let diceValue = 0;
            let loopValue = 1; 
            let loopMax = 500;
            if(inputArray.length === 1) { // this bit might be redundant?
                diceValue = Number(inputArray[0]);
            }
            else {
                diceValue = Number(inputChunk);
                loopValue = Math.min(Math.max(Number(inputArray[0]), 1), loopMax); 
                // if the input loop value is 0, use 1. otherwise, use at most 500 loops
            }
            for(let i = 0; i < loopValue; ++i) {
                output = output + randomRoll(diceValue);
            }
            return output + offset;
            
        }
        else {
            return randomRoll(20);
        }
        
    }
    
    return randomRoll(20);
}

function randomDiceParser(msg, args) {
    // joins args, then removes spaces
    let input = args.join("").split(" ").join(""); 

    // if it's just a number and nothing else, assume the user meant rolling a dice
    // of that size.
    if(!isNaN(Number(input))) {
        return randomRoll(input);
    }


    // assume no sanity checking was done (because it's recursive, and sometimes 
    // we'll strip the elements down so much they're basic elements).

    
}
    
/*
    // if the input string was splittable on the letter d and the first entry is a number, 
    // 
    //return "input length: " + Number(inputArray[0]);
    if(inputArray.length > 0 && !isNaN(Number(inputArray[0]))) {

        let diceValue = 0;
        let loopValue = 1; 
        let loopMax = 500;
        if(inputArray.length === 1) { // this bit might be redundant?
            diceValue = Number(inputArray[0]);
        }
        else {
            diceValue = Number(inputArray[1]);
            loopValue = Math.min(Math.max(Number(inputArray[0]), 1), loopMax); 
            // if the input loop value is 0, use 1. otherwise, use at most 500 loops
        }
        for(let i = 0; i < loopValue; ++i) {
            output = output + randomRoll(diceValue);
        }
        return output;
    }
    else if(inputArray.length == 1 )

    // known issues: bot does not errorcheck that the second input after the d is a number,
    // bot does not handle keep lowest or keep highest, bot does not do rolls without replacement
    return randomRoll(20);
*/


function createGallery(msg, args) {
    let artRoomID = 0;
    if(args.length >= 1 && !isNaN(parseInt(args[0]))) {
        artRoomID = parseInt(args[0]);
    }
    let desc = generateArtRoom(artRoomID);

    if(galleryMessage !== "") {
        //log("debug", "gallerymessage type: " + typeof galleryMessage)
        //galleryMessage.reactions.removeAll();
        galleryMessage.reactions.removeAll().catch(
            error => console.error('Failed to clear reactions: ', error));
        /*
        galleryMessage.reactions.removeAll().catch(() => 
            log("error", "One or more emojis was not removed."));
        */
    }

    // Send image message, then attach emojis to the art room
    msg.channel.send(desc).then( message => {
        galleryID = artRoomID;      // this is a global
        galleryMessage = message;   // this is a global
        message.react("⬅️")
            .then(() => {message.react("➡️")}).catch(() => 
                log("error", "One of the emojis failed to react.")); 

    },  
        reason => {
        logger.error("Error (createGallery): " + reason);
    });
    
    log("info", "Command: gallery\nCaller: " + msg.author.username);
    return "";
}

function randomRoll(input) {
    return Math.floor(randomng() * input) + 1;
    //return Math.floor(window.crypto.getRandomValues() * input) + 1;
}




playerDeck = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];
gmDeck = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];

function deckShuffle(inputArray, args) {
    if(args.length > 0) {
        inputArray.push(args[0]);
    }
    for(let iter = 0; iter < inputArray.length; ++iter) {
        let targetIndex = Math.floor(randomng() * inputArray.length);
        let temp = inputArray[iter];
        inputArray[iter] = inputArray[targetIndex];
        inputArray[targetIndex] = temp;
    }
    return inputArray;
}

function drawFromDeck(inputArray, args) {
    if(args.length > 0 && parseInt(args[0]) > 0) {
        let output = inputArray.pop();

        for(let i = 1; i < parseInt(args[0]); ++i) {
            output += ", " + inputArray.pop();
        }
        return output;
    }

    return inputArray.pop();
}

function searchDeck(inputArray, args) {
    if(args.length > 0) {
        let index = inputArray.indexOf(args[0]);
        if(index > -1) {
            inputArray.splice(index, 1);
            return args[0];
        }
        return "I'm pretty sure you drew that card already."
    }
    return "What do you want me to find?";
}

function searchToTop(inputArray,args) {
    if(args.length > 0) {
        let index = inputArray.indexOf(args[0]);
        if(index > -1) {
            inputArray.splice(index, 1);
            inputArray.push(args[0]);
            return "Set to top of deck!";
        }
        return "I couldn't find the card in your deck!"
    }
    return "What card are you looking for?"
}

function restartDeck(inputArray, args) {
    inputArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];
    deckShuffle(inputArray, args);
    return "Deck reset!";
}

function loadDeck(inputArray, message) {
    let args = message.toString().substring(1).split('\n');
    if(args[0].startsWith("gmloaddeck")) {
        args[0] = args[0].slice(11);
    }
    else if (args[0].startsWith("loaddeck")) {
        args[0] = args[0].slice(9);
    }


    while(inputArray.length > 0) {
        inputArray.pop();
    }
    for(let i = 0; i < args.length; ++i) {
        inputArray.push(args[i]);
    }
    
    return "Deck loaded!";
}

function revealDeck(inputArray, args) {
    let output = "";
    for(let i = inputArray.length - 1; i >= 0; --i) {
        output += inputArray[i] + ", ";
    }
    return output.slice(0,-2);
}

/*
function muteAll(msg) {
    let vcchannel = msg.member.voiceChannel;
    log("debug", "Found VC Channel. ID: " + vcchannel.id);
    vcchannel.members.forEach(muteMember);
        
        //vcmember[1].setMute(true);
}

function muteMember(member) {
    //log("debug", "Found Member: " + member.user.username);
    log("info", "Muted: " + member.user.username);
    member.setMute(true);
}

function unmuteAll(msg) {
    msg.member.voiceChannel.members.forEach(unmuteMember);
}

function unmuteMember(member) {
    //log("debug", "Found Member: " + member.user.username);
    log("info", "Unmuted: " + member.user.username);
    member.setMute(false);
}

function toggleMuting(msg) {
    if(mutedStatus == 0) {
        mutedStatus = 1 - mutedStatus;
        msg.member.voiceChannel.members.forEach(muteMember);
    }
    else {
        mutedStatus = 1 - mutedStatus;
        msg.member.voiceChannel.members.forEach(unmuteMember);
    }
}
*/