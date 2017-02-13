function showTally(tally) {
	var content = tally.name;
	content+="\nvote using: poll vote <option>";
	for (var i in tally.tally) {
		content += "\n"+i+": "+tally.tally[i];
	}

	return content;
}

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
            return;
        }
        console.log(args);
        if (args[0] == "vote") {
            if (args.length < 2) {
                msg.channel.sendMessage("usage: poll vote <option>");
            }
            if (polling[pollingIn.id].tally.hasOwnProperty(args[1])) {
                if (args[1] == "<@"+msg.author.id+">") {
                    msg.channel.sendMessage("You can't vote for yourself!");
                } else {
                    if (polling[pollingIn.id].votes.hasOwnProperty(msg.author.id)) {
                        polling[pollingIn.id].tally[polling[pollingIn.id].votes[msg.author.id]]-=1;
                    }
                    polling[pollingIn.id].votes[msg.author.id] = args[1];
                    polling[pollingIn.id].tally[args[1]]+=1;
                    polling[pollingIn.id].display.edit(showTally(polling[pollingIn.id]));
                    msg.channel.sendMessage("You've successfully voted!");

                }
            }
        } else if (args[0] == "end") {
            polling[pollingIn.id].status = false;
            msg.channel.sendMessage("Poll ended!");
            polling[pollingIn.id].display.edit("POLL HAS ENDED!\n"+showTally(polling[pollingIn.id]));
        } else if (args[0] == "start") {
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
            msg.channel.sendMessage(showTally(polling[pollingIn.id])).then(function(a){polling[pollingIn.id].display = a;});

        }
    }
}
