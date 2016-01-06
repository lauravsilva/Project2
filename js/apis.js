"use strict";

(function() {
	window.movieDatabase = {
		MOVIES_API_KEY: "b37ac3c2e2b006b2fa716811c6605b8f",
		MOVIES_API_URL: "http://api.themoviedb.org/3",
		IMAGE_API_URL: "http://image.tmdb.org/t/p",
		"timeout": 5000,
		
		//make call to movie database by passing genre id
		call: function(id, page, success, error){
			var page_string = "&page=";
			var api_string = "&api_key=" + movieDatabase.MOVIES_API_KEY;
			
			var xhr = new XMLHttpRequest();
			xhr.timeout = movieDatabase.timeout;
			xhr.ontimeout = function () {
				throw("Request timed out");
			};

			xhr.open("GET", movieDatabase.MOVIES_API_URL + "/genre/" + id + "/movies?" + page_string + page + api_string, true);
			xhr.setRequestHeader('Accept', 'application/json');
			xhr.responseType = "text";
			xhr.onreadystatechange = function () {
				if (this.readyState === 4) {
					if (this.status === 200){
						if (typeof success == "function") {
							success(JSON.parse(this.response));	
						}else{
							throw('No success callback, but the request gave results')
						}
					}else{
						if (typeof error == "function") {
							error(JSON.parse(this.response));
						}else{
							throw('No error callback')
						}
					}
				}
			};
			xhr.send();
		},

		//display results from movie database call
		displayMovieResults: function(id, page){
			if (id == 0) return; //select genre option

			movieDatabase.call(id, page,
				function(resp){
					var num = Math.floor(Math.random() * (resp.results.length + 1));

					var str = "<p>How about staying in and watching: </p>";
					str += "<h4 class=\"orange-text text-darken-3 center-align\">" + resp.results[num].title + "</h4>";

					str += "<p>Find out where to watch it <a href=\"http://www.fan.tv/movies/" + resp.results[num].id + "\" target = \"_blank\">here</a>.</p>";

					document.querySelector("#dynamicContentRandom").innerHTML = str;
				},
				function(){
					var errorStr = "<p>Boo! Couldn't find a movie. Try again.</p>";

					document.querySelector("#dynamicContentRandom").innerHTML = errorStr;
				}
			);
		}
	}

	window.weather = {
		WEATHER_JSON_URL: "http://api.worldweatheronline.com/free/v2/weather.ashx?format=json&key=",
		WEATHER_API_KEY: "1b391b01a1b7b019c9eed185c5b0c",
		outsideOptions: ["to a local park", "to the beach", "for a bike ride", "for a walk", "for a swim", "outside with a good book", "outside to try a new outdoor activity like hiking or dirt biking", "to the zoo", "to walk the dog", "to climb a tree", "geocaching", "to a local art festival", "fishing", "longboarding", "to play ultimate frisbee with a friend", "exploring", "to miniature golf", "camping", "to a concert", "slacklining"],

		//make call to weather api and parse json
		getWeather: function(){
			// $("#weatherContent").fadeIn(250);
			var urlWeather = weather.WEATHER_JSON_URL + weather.WEATHER_API_KEY + "&q=";

			// get value of form field
			var value = document.querySelector("#searchweather").value;
			
			// get rid of any leading and trailing spaces
			value = value.trim();
			
			if(value.length < 1) return;

			$("#weatherAll").fadeIn(250);
			document.querySelector("#weatherContentLeft").innerHTML = "<h5>Searching for " + value + "</h5>";
			
			// replace spaces the user typed in the middle of the term with %20 (space)
			value = encodeURI(value); 
			
			urlWeather += value;
			
			// call the web service, and download the file
			$("#decisionContent").fadeOut(250);
			$("#displayOptions").fadeOut(250);
			$.getJSON(urlWeather).done(function(data){weather.displayWeatherResults(data);});
		},

		//display results from weather api call
		displayWeatherResults: function(obj){
			if(obj.data.error){ // this catches a bad API key, missing parameter, etc...
				// var message = obj.data.error[0].msg;
				document.querySelector("#weatherContent").innerHTML = "<p class=\"red-text\">Oh No! We seem to be having trouble finding you. Try again</p>";
				$("#weatherContent").fadeIn(1000);
				$("#weatherContentLeft").hide();
				$("#weatherContentRight").hide();
				return; // bail out
			}
			
			if (obj.data && obj.data.length == 0){ // if no data found
				document.querySelector("#weatherContent").innerHTML = "<p>No data found</p>";
				$("#weatherContent").fadeIn(1000);
				$("#weatherContentLeft").hide();
				$("#weatherContentRight").hide();
				return; // bail out
			}

			var line = "";
			var bigStringLeft = "";
			var bigStringRight = "";

			var allDataCurrent = obj.data.current_condition[0];
			var allDataWeather = obj.data.weather[0];

			line = "<h5>Weather for " + obj.data.request[0].query + "</h5>";
			
			var lineLeft = "<h1 id=\"temp\" class=\"light-blue-text text-darken-4\"> " + allDataCurrent.temp_F + "&deg; F</h1>";
			lineLeft += "<h4 class=\"grey-text darken-1\"> " + allDataCurrent.weatherDesc[0].value + "</h4>";
			lineLeft += "<h5> Feels like: " + allDataCurrent.FeelsLikeF + "&deg; F</h5>";
			
			var lineRight = "<p> Wind: " + allDataCurrent.winddir16Point + " " + allDataCurrent.windspeedMiles + " mph</p>";
			lineRight += "<p> Humidity: " + allDataCurrent.humidity + "%</p>";
			lineRight += "<p> High: " + allDataWeather.maxtempF + "&deg; F </p>";
			lineRight += "<p> Low: " + allDataWeather.mintempF + "&deg; F</p>";
			lineRight += "<p> Visibility: " + allDataCurrent.visibility + "</p>";
			lineRight += "</div>";

			bigStringLeft += lineLeft;
			bigStringRight += lineRight;

			var tempF = allDataCurrent.temp_F;
			var weatherDescription = allDataCurrent.weatherDesc[0].value;

			weather.decision(tempF, weatherDescription);
			
			$("#weatherContentLeft").fadeIn(1000);
			$("#weatherContentRight").fadeIn(1000);

			document.querySelector("#weatherContent").innerHTML = line;
			document.querySelector("#weatherContentLeft").innerHTML = bigStringLeft;
			document.querySelector("#weatherContentRight").innerHTML = bigStringRight;

		},

		//depending on weather, print different statements that decide what user should do
		decision: function(tempF, weatherDescription){
			var stringHead = "<h4 class=\"orange-text text-lighten-1\">";
			var stringSub = "<h5 class=\"grey-text text-darken-3\">"

			if(tempF >= 60 && tempF <= 89){
				var num = Math.floor(Math.random() * (weather.outsideOptions.length-1));
				stringHead += "It's a beautiful day! </h3>";
				stringSub += "<strong>You should definitely go outside.</strong><br/>"
				stringSub += "How about going " + weather.outsideOptions[num] + "?</h5>";
				if (weatherDescription === "Sunny"){
					stringSub += "<p class=\"light-blue-text text-darken-2\">Remember your sunscreen and water!</p>";
				}
			}

			else{
				if(tempF >= 90){
					stringHead += "It is waaaay too hot outside! </h3>";
					stringSub += "Avoid the outdoors at all cost!<br/>";
				}
				else if(tempF >= 40 && tempF <= 59){
					stringHead += "It's chilly! </h3>";
					stringSub += "If you decide to go out, don't forget a jacket <br/>";
				}
				else if(tempF >= 20 && tempF <= 39){
					stringHead += "It's getting a bit nippy out! </h3>";
					stringSub += "Stay in, or wear a coat + jacket + gloves + hat + boots <br/>";
				}
				else if(tempF >= 0 && tempF <= 19){
					stringHead += "It's freaking cold! </h3>";
					stringSub += "Unless you want to freeze, stay inside! <br/>";
				}
				else{ // below 0
					stringHead += "Even the polar bears know to stay inside! </h4>";
				}
				
				stringSub += "These are your options for staying in: </h5>";
				$("#displayOptions").fadeIn(1000);
			}

			document.querySelector("#decisionContentSub").innerHTML = stringSub;
			document.querySelector("#decisionContentHead").innerHTML = stringHead;
			$("#decisionContent").fadeIn(1000);
		}
	}

	window.netflixroulette = {
		NETFLIX_API_URL: "http://netflixroulette.net/api/api.php?",

		// search and print results from user input
		searchNetflix: function(){
			var value = document.querySelector("#show_netflix_option").value;				
			
			netflixroulette.createRequest(value, function (resp) {
				var string = "<p class=\"green-text\"><i class=\"mdi-navigation-check\"></i>Hoorah! It's on Netflix!</p>";

				string += "<h4 class=\"orange-text text-darken-3 center-align\">" + resp.show_title + "</h4>";
				string += "<p><strong>" + resp.summary + "</strong><br/><br/>";
				string += "<strong>Category:</strong> " + resp.category + "<br/>";
				string += "<strong>Cast:</strong> " + resp.show_cast + "<br/><br/>";
				string += "<a href=http://netflix.com/WiPlayer?movieid=" + resp.show_id + " target=\"_blank\">Watch on Netflix Now!</a></p>";

				document.querySelector("#dynamicContentNetflix").innerHTML = string;
			});
		},

		// ****************************************
		// Code     : NetflixRoulette JavaScript API Wrapper
		// Author   : Alex Camilleri
		// ****************************************
		// Created  : 25/04/2014
		// ****************************************
		// make request for netflix database
		createRequest: function (requestData, callback, parseAsXml) {
			parseAsXml = !! parseAsXml;
			if (typeof callback !== 'function') {
				throw new Error("The callback parameter was not a function");
			}
			var queryString = "type=" + (parseAsXml ? "xml" : "json");
			if (typeof requestData === 'string') {
				queryString += "&title=" + requestData;
			}
			else if (typeof requestData === 'object' && requestData.hasOwnProperty("title")) {
				queryString += "&title=" + requestData.title;
	        }
	        else {
	        	throw new Error("I don't know how to handle " + requestData);
	        }

	        var httpReq = new XMLHttpRequest();
	        httpReq.open("GET", netflixroulette.NETFLIX_API_URL + queryString.replace(/\s/ig, "%20"), true);
	        httpReq.onreadystatechange = function () {
	        	if (httpReq.readyState !== 4) {
	        		return;
	        	}

	        	if (httpReq.status !== 200) {
	        		document.querySelector("#dynamicContentNetflix").innerHTML = "<p class=\"red-text\"><i class=\"mdi-navigation-close\"></i>Boo! That movie is not on Netflix :(</p>";
	        		throw new Error("Boo! That movie is not on Netflix");
	        	}

	        	callback(parseAsXml ? new DOMParser()
	        		.parseFromString(httpReq.responseText, "text/xml") : JSON.parse(httpReq.responseText));
	        };
	        httpReq.send();
	    }
	}
})()