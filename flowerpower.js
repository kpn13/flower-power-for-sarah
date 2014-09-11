/****************************************************
Flower power Plugin For SARAH
Author: Karim PINCHON
Date: 11/09/2014
*****************************************************/
var request = require("request");

exports.action = function(data, callback, config, SARAH){
	
	var options = { 
		username : config.modules.flowerpower.username,
		password : config.modules.flowerpower.password,
		client_id : config.modules.flowerpower.client_id,
		client_secret : config.modules.flowerpower.client_secret,
		access_token : "",
		auth_url : "https://apiflowerpower.parrot.com/user/v1/authenticate",
		sync_url : "https://apiflowerpower.parrot.com/sensor_data/v3/sync",
		location_url : "https://apiflowerpower.parrot.com/sensor_data/v2/sample/location/",
		status_url : "https://apiflowerpower.parrot.com/sensor_data/v3/garden_locations_status"
	}
	
	var status_key_list = {
		waiting_data : "En attente de donnai",
		status_ok : "okay",
		status_warning : "attention",
		status_critical : "critique",
		predicted_action : "Action praivu"
	}

	var instruction_key_list = {
		air_temperature_too_high : "La tempairature est trop ailevai.",
		air_temperature_too_low : "La tempairature est trop basse.",
		air_temperature_good : "La tempairature est correcte.",
		light_too_high : "La quantitai de lumiaire est trop importante.",
		light_too_low : "La quantitai de lumiaire est trop faible.",
		light_good : "La quantitai de lumiaire est correcte.",
		soil_moisture_too_high : "L'humiditai est trop importante.",
		soil_moisture_too_low : "L'humiditai est trop faible.",
		soil_moisture_good : "L'humiditai est correcte.",
		fertilizer_too_high : "La quantitai d'engrai est trop importante.",
		fertilizer_too_low : "La quantitai d'engrai est trop faible.",
		fertilizer_good : "La quantitai d'engrai est correcte."
	}

	getInfoFromFlowerPower(options, function(values) {		
		switch(data.flowerpower) {
			case 'general':
				msg = "Tempairature : " + status_key_list[values.air_temperature_status_key] + ".";
				if(values.air_temperature_status_key != "status_ok"){
					msg += instruction_key_list[values.air_temperature_instruction_key]
				}
				msg += "Lumiaire : " + status_key_list[values.light_status_key] + ".";
				if(values.air_temperature_status_key != "status_ok"){
					msg += instruction_key_list[values.light_instruction_key]
				}
				msg += "Humiditai : " + status_key_list[values.soil_moisture_status_key] + ".";
				if(values.air_temperature_status_key != "status_ok"){
					msg += instruction_key_list[values.soil_moisture_instruction_key]
				}
				msg += "Engrai : " + status_key_list[values.fertilizer_status_key] + ".";
				if(values.air_temperature_status_key != "status_ok"){
					msg += instruction_key_list[values.fertilizer_instruction_key]
				}
				
				msg = "Derniaire synchro le : " + values.last_data_upload_time;
				
				callback({ 'tts': msg });
				break;
			case 'temperature':
				callback({ 'tts': instruction_key_list[values.air_temperature_instruction_key] });
				break;
			case 'light':
				callback({ 'tts': instruction_key_list[values.light_instruction_key] });
				break;
			case 'moisture':
				callback({ 'tts': instruction_key_list[values.soil_moisture_instruction_key] });
				break;
			case 'fertilizer':
				callback({ 'tts': instruction_key_list[values.fertilizer_instruction_key] });
				break;
			case 'battery':
				callback({ 'tts': "Nivo de batterie : " + values.battery_level_percent_remaining + " pourcent." });
				break;
			case 'lastCheck':
				callback({ 'tts': "Derniaire synchro le : " + values.last_data_upload_time });
				break;
			default:
				break;
		}
	});
}

var getInfoFromFlowerPower = function(options, callback){
		request(options.auth_url + "?grant_type=password&username=" + options.username + "&password=" + options.password + "&client_id=" + options.client_id + "&client_secret=" + options.client_secret,
		function(error, response, body) {
			respJson = JSON.parse(body);
			options.access_token = respJson.access_token;
			request({
				url: options.status_url,
				headers: {
					'Authorization': 'Bearer ' + options.access_token,
					'Accept': 'application/json'
				}
			},
			function(error, response, body) {
				var data = JSON.parse(body);
				var battery_level_percent_remaining = data.sensors[0].battery_level.level_percent;
				var last_data_upload_time = data.sensors[0].last_upload_datetime_utc;
				
				var air_temperature_status_key = data.locations[0].air_temperature.status_key;
				var air_temperature_instruction_key = data.locations[0].air_temperature.instruction_key;
				var light_status_key = data.locations[0].light.status_key;
				var light_instruction_key = data.locations[0].light.instruction_key;
				var soil_moisture_status_key = data.locations[0].soil_moisture.status_key;
				var soil_moisture_instruction_key = data.locations[0].soil_moisture.instruction_key;
				var fertilizer_status_key = data.locations[0].fertilizer.status_key;
				var fertilizer_instruction_key = data.locations[0].fertilizer.instruction_key;

				callback({air_temperature_status_key : air_temperature_status_key, 
						air_temperature_instruction_key : air_temperature_instruction_key,
						light_status_key : light_status_key,
						light_instruction_key : light_instruction_key,
						soil_moisture_status_key : soil_moisture_status_key,
						soil_moisture_instruction_key : soil_moisture_instruction_key,
						fertilizer_status_key : fertilizer_status_key,
						fertilizer_instruction_key : fertilizer_instruction_key,
						battery_level_percent_remaining : battery_level_percent_remaining,
						last_data_upload_time : last_data_upload_time
				});
			});
		});
	}