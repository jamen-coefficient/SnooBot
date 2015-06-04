// nodejs

var  blockspring = require('blockspring');
var request = require('request');

var good_color = "#008000";
var bad_color = "#ff0000";
var nsfw_color = "#FF0080";

// var webhook = function(text, callback) {
	var webhook = function(team_domain, service_id, token, user_name, team_id, user_id, channel_id, timestamp, channel_name, text, trigger_word, raw_text, callback) {
	var response = ["*", user_name, "* said _", text, "_"].join('')
	// Basic bot will just echo back the message
	var options = {
		url: 'http://api.reddit.com/r/' + text + '/about',
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
		}
	};

	request(options, function(error, response, body) {
		var response = parseResponse(body);
		// console.log(response);
		callback(response);
	})

}

var parseSuccessResponse = function(data){
	var url = data['url'];
	// get the first line of the description
	var description = data['description'].split('\n')[0];
	var subscribers = data['subscribers'];
	var color = (data['over18'])?nsfw_color:good_color;
	// console.log(description);
	// console.log(data);
	return {
        "text" : "<http://reddit.com" + url + "|" + data['title'] + ">",
		"attachments" :  [{
			"fallback": description ,
			"text": description,
			"fields": [{
				"title": "Subscribers",
				"value": subscribers,
				"short": true
			},{
				"title": "Link",
				"value": "<http://reddit.com" + url + "|" + url + ">",
				"short": true
			}],
			"color": color
		}]
	};
}


var parseResponse = function(json) {
	var json = JSON.parse(json);
	//console.log(json, json['kind'] == 't5');
	if(json['kind'] && json['kind'] == 't5'){
		return parseSuccessResponse(json['data']);
	}
	return{
        "text" : '404 ヽ(´□｀。)ﾉ',
		"attachments" :  [{
			"fallback": "Not found" ,
			"text": "Not Found",
			"color": bad_color
		}]
	};
}
// var block = function(text) {
	var block = function(request, response) {
	var team_domain = request.params['team_domain'];
	var service_id = request.params['service_id'];
	var token = request.params['token'];
	var user_name = request.params['user_name'];
	var team_id = request.params['team_id'];
	var user_id = request.params['user_id'];
	var channel_id = request.params['channel_id'];
	var timestamp = request.params['timestamp'];
	var channel_name = request.params['channel_name'];
	var raw_text = text = request.params['text'];
	var trigger_word = request.params['trigger_word'];

	// ignore all bot messages
	if (user_id == 'USLACKBOT') return;

	// Strip out trigger word from text if given
	if (trigger_word) { text = text.substr(trigger_word.length).trim() }

	// Execute bot function
	//webhook(text, function(output) {
	//	console.log(output); return;
		 webhook(team_domain, service_id, token, user_name, team_id, user_id, channel_id, timestamp, channel_name, text, trigger_word, raw_text, function(output) {
		// set any keys that aren't blank
		Object.keys(output).forEach(function(k) { if (output[k]) { response.addOutput(k, output[k]); } });
		response.end();
	});
}

// block(process.argv[2]);
blockspring.define(block);
