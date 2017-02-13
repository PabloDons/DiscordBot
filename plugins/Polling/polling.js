var polling = {};

function showTally(tally) {
	var fields = [];
	for (var i in tally.tally) {
		fields.push({name:i, value:tally.tally[i].toString()});
	}

	return {
		description:"to vote, do: poll vote <option>",
		color:0x00ff00,
		timestamp: new Date(),
		// footer: {
		// 	text:"this is the fotter",
		// 	icon_url:"https://i.imgur.com/qEpGpTc.png"
		// },
		thumbnail: {
			url:"http://pngimg.com/upload/snowflakes_PNG7545.png"
		},
		author: {
			name:tally.name
		},
		fields: fields
	};
}
var pollRole = "PollMaster";
exports.commands = [
    "poll"
];

exports.poll = {
    usage: "vote <option> | end | start <poll name> <option1> <option2> [option3 [option4 [...]]]",
    description: "Start a new poll displayed in the current channel.",
    process:function (bot, msg, suffix) {
        var args = suffix.match(/[a-zA-Z0-9_\-<\@\!\>]+|"[^"]+"/g);
        var pollingIn = msg.guild;
        if (!pollingIn) {
            // privmsg
			msg.channel.sendMessage("You cannot start a message in a private message");
            return;
        }
        if (args[0] == "vote") {
			console.log("1")
            if (args.length < 2) {
                msg.channel.sendMessage("usage: poll vote <option>");
            }
			console.log("2")
            if (polling[pollingIn.id].tally.hasOwnProperty(args[1])) {
				console.log("3")
                if (RegExp("\\<\\@\\!?"+msg.author.id+"\\>").test(args[1])) {
					console.log("6")
                    msg.channel.sendMessage("You can't vote for yourself!");
                } else {
					console.log("7")
                    if (polling[pollingIn.id].votes.hasOwnProperty(msg.author.id)) {
                        polling[pollingIn.id].tally[polling[pollingIn.id].votes[msg.author.id]]-=1;
                    }
                    polling[pollingIn.id].votes[msg.author.id] = args[1];
                    polling[pollingIn.id].tally[args[1]]+=1;
                    polling[pollingIn.id].display.edit("",{embed:showTally(polling[pollingIn.id])});
                    msg.channel.sendMessage("You've successfully voted!");
                }
				console.log("4")
            }
			console.log("5")
        } else if (args[0] == "end") {
			if (!msg.guild.roles.find('name', pollRole).members.get(msg.author.id)) {
				msg.channel.sendMessage("You don't have permission to do this!");
				return;
			}
            polling[pollingIn.id].status = false;
            msg.channel.sendMessage("Poll ended!");
            polling[pollingIn.id].display.edit("POLL HAS ENDED!",{embed:showTally(polling[pollingIn.id])});
        } else if (args[0] == "start") {
			if (!msg.guild.roles.find('name', pollRole).members.get(msg.author.id)) {
				msg.channel.sendMessage("You don't have permission to do this!");
				return;
			}
            if (args.length < 4) {
                msg.channel.sendMessage("usage: poll start <poll_name> <option1> <option2> [option3 [option4 [...]]]");
                return;
            }
            if (polling.hasOwnProperty(pollingIn.id) && polling[pollingIn.id].status) {
                msg.channel.sendMessage("There is already an active poll, use 'poll end' to end it");
                return;
            }

            polling[pollingIn.id] = {
                status:true,
                name:args[1],
                votes:{},
                tally:(function(){
                    var out = {};
                    for (var i=2;i<args.length;i++){
                        out[args[i]] = 0;
                    }
                    return out;
                })(),
            };
            msg.channel.sendEmbed(showTally(polling[pollingIn.id])).then(function(a){polling[pollingIn.id].display = a;});
        }
    }
};
