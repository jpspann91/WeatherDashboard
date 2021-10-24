//Open Weather API Key
var APIKey = "2b281ac94df8508b75ac15c798af4be6";
//Vairable to hold users choice
var userCity = "";
//Variable to hold the last city chosen stores in lcoal storage
var lastUserCity = "";

//Function to handle errors
var handleErrors = (response) => {
    if(!response.ok){
        throw Error(response.statusText);
    }
    return response;
}
//Function to get current weather
function getCurrentForecast(event){
    //Holds user city choice
    var city = $("#search-city").val();
    //Set userCity variable
    userCity = $("#search-city").val();

    //Query URL passing in city and API key
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + APIKey;

    //API call using fetch
    fetch(queryURL)
        .then(function(response) {
            //Response returning as JSON object
            return response.json();
        })
        //data being returned
        .then(function(data){
            //Save city to local storage
            saveCity(city);
            //Testing purposes
            console.log(data)
            //Clear out these sections
            $("#search-error").text("");
            $("#current-weather").text("")

            //Variable to hold weather icon
            var currentWeatherIcon = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";

            //Hold current time
            var currentMoment = moment();

            //Renders local Storage
            renderStorage();

            //Calls five day forecast method
            getFiveDay(event);

            //Set header to city name being searched
            $("#header-text").text(data.name);

            //CURRENT WEATHER SECTION
            //Header
            var contentHeader = document.createElement('h3');
            contentHeader.textContent = data.name + " " + currentMoment.format("(MM/DD/YY)");
            //Icon
            var weatherIcon = document.createElement('img');
            weatherIcon.setAttribute('src', currentWeatherIcon);
            contentHeader.append(weatherIcon);
            $("#current-weather").append(contentHeader);

            //Info List
            var weatherInfoList = document.createElement('ul');
            weatherInfoList.classList.add("list-unstyled"); 
            //Temperature
            var tempListItem = document.createElement('li');
            tempListItem.textContent = "Temperature: " + data.main.temp + String.fromCharCode(8457)
            weatherInfoList.append(tempListItem);
            //Humidity
            var humidityListItem = document.createElement('li');
            humidityListItem.textContent = "Humidity: " + data.main.humidity + "%";
            weatherInfoList.append(humidityListItem);
            //Wind Speed
            var windSpeedListItem = document.createElement('li');
            windSpeedListItem.textContent = "Wind Speed: " + data.wind.speed + " mph";
            weatherInfoList.append(windSpeedListItem);

            //Get UV index need a specific URL for it using one call
            var latitude = data.coord.lat;
            var longitude = data.coord.lon;
            var uvQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=" + APIKey;

            
            //API Call to get UVI using Lat and Lon
            fetch(uvQueryUrl)
                .then(handleErrors)
                .then(function(response){
                    return response.json();
                })
                .then(function(data){
                    console.log(data);
                    //UVI
                    var uvi = data.current.uvi
                    var UVIndexListItem = document.createElement('li');
                    UVIndexListItem.textContent = "UV Index: ";

                    var uviSpanEl = document.createElement('span');
                    uviSpanEl.textContent = uvi;

                    UVIndexListItem.append(uviSpanEl);

                    weatherInfoList.append(UVIndexListItem);

                    if(uvi >= 0 && uvi <=3){
                        uviSpanEl.classList.add('uv-favorable');
                    }
                    else if(uvi >= 3 && uvi <8){
                        uviSpanEl.classList.add('uv-moderate');
                    }
                    else if(uvi >= 8 ){
                        uviSpanEl.classList.add('uv-severe');
                    }
                })
                //Appends everything to the weather info list
                $('#current-weather').append(weatherInfoList);
        })
}
//Function to create 5 day forecast
function getFiveDay(){
    //Get users city choice
    var city = $("#search-city").val();

    //Pass in users choice and API key into query URL/ Using forecast endpoint
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&per_page=5&appid=" + APIKey;

    //API call 
    fetch(queryURL)
    //handle any errors
    .then(handleErrors)
    //response information
    .then(function(response){
        //Turned into JSON format
        return response.json();
    })
    //Data returned
    .then(function(data){
        //Testing purposes
        console.log(data);
        console.log("RIGHT HERE")
        //Clear out text to generate new info
        $("#five-day-forecast").text("");

        //FIVE DAY FORECAST SECTION
        //Header
        var fiveDayHeader = document.createElement('h2');
        fiveDayHeader.textContent = "5-Day Forecast";
        $('#five-day-forecast').append(fiveDayHeader);
        //Div to hold all the cards
        var foreCastDivEl = document.createElement('div');
        foreCastDivEl.setAttribute('id', "fiveDayList")
        foreCastDivEl.classList.add("d-inline-flex","flex-wrap");

        //For loop to loop through all forecast data
        for(var i = 0; i < data.list.length; i ++){
            //Holds list element
            var dayData = data.list[i];
            //Offset time information found on google
            var dayTimeUTC = dayData.dt;
            var timeZoneOffset = data.city.timezone;
            var timeZoneOffsetHours = timeZoneOffset / 60 / 60;

            //Current moment and pass in all offset information
            var currentMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);

            //Icon
            var iconUrl = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";

            //Gets data from mid-day for 5 day forecast. Data returns 40 items 5 days split into 8 parts 3 hours between
            if(currentMoment.format("HH:mm:ss") == "11:00:00" || currentMoment.format("HH:mm:ss") == "12:00:00" || currentMoment.format("HH:mm:ss") == "13:00:00"){
                //Div to hold all cards
                var cardDivEl = document.createElement('div');
                cardDivEl.classList.add("weather-card", "card", "m-2", "p0");

                //List for the cards being created
                var cardListEl = document.createElement("ul");
                cardListEl.classList.add("list-unstyled", "p-3");
                
                //Date
                var dateListItem = document.createElement('li');
                dateListItem.textContent = currentMoment.format("MM/DD/YY");
                cardListEl.append(dateListItem);

                //Icon 
                var iconListItem = document.createElement('li');
                var iconImg = document.createElement('img')
                iconImg.setAttribute('src', iconUrl);
                iconListItem.append(iconImg);
                cardListEl.append(iconListItem);

                //Temperature
                var cardTempListItem = document.createElement('li');
                cardTempListItem.textContent = "Temp: " + dayData.main.temp + String.fromCharCode(8457);
                cardListEl.append(cardTempListItem);

                //Humidity
                var cardHumListItem = document.createElement('li');
                cardHumListItem.textContent = "Hum: " + dayData.main.humidity + "%";
                cardListEl.append(cardHumListItem);

                //Append everything to the page
                cardDivEl.append(cardListEl);
                foreCastDivEl.append(cardDivEl);
            }
        }

        //Append everything to the fove day forecast dic element
        $("#five-day-forecast").append(foreCastDivEl);
    })
}
//Function to save city to local storage
function saveCity(newCity){
    //Flag to see if City exists
    var cityExists = false;
    //Loops through local storage
    for(var i = 0; i < localStorage.length; i++){
        //If city passed into the method matches something in local storage
        if(localStorage["cities" + i] === newCity){
            //Flag switches to true
            cityExists = true;
            break;
        }
    }
    //If city is not already in the local storage
    if(cityExists === false){
        //Then add it
        localStorage.setItem('cities' + localStorage.length, newCity);
    }

}
//Function to render local storage to the results div element
function renderStorage(){
    //Empty out search history
    $("#city-results").empty();

    //If nothing is in local storage
    if(localStorage.length === 0){
        //If lastUserCity has something
        if(lastUserCity){
            //Set value to lastUserCity variable
            $("#search-city").attr("value", lastUserCity)
        }
        //If lastUsercity is empty
        else{
            //Set to default value
            $("#search-city").attr("value", "San Diego");
        }
    }
    //If there is something in local storage
    else{
        //Variable to hold lastCityKey
        var lastCityKey = 'cities' + (localStorage.length - 1);
        //Get the localStorage ad set to lastUserCity
        lastUserCity = localStorage.getItem(lastCityKey);

        //Set attribute of value to lastUserCity
        $("#search-city").attr("value", lastUserCity);
        
        //Loop through localStorage
        for(var i = 0; i < localStorage.length; i++){
            //Variable to hold city being return from local storage
            var city = localStorage.getItem('cities' + i);
            //Testing purposes
            console.log("cities" + i);

            //If city is the same as userCity
            if(city === userCity){
                //Create list item and buttons set to active
                var cityListItem = document.createElement('li');
                var cityBtn = document.createElement('button');
                cityBtn.setAttribute('type', "button");
                cityBtn.classList.add("list-group-item", "list-group-item-action", "active");
                cityBtn.textContent = city;
                cityListItem.append(cityBtn);
            }
            else{
                //If it doesnt match then create list item and btn but dont set to active
                var cityListItem = document.createElement('li');
                var cityBtn = document.createElement('button');
                cityBtn.setAttribute('type', "button");
                cityBtn.classList.add("list-group-item", "list-group-item-action");
                cityBtn.textContent = city;
                cityListItem.append(cityBtn);
            }
            //Append to the search history
            $("#city-results").prepend(cityListItem);
        }
        //If local storage is greater than 0 should always be true due to default value
        if(localStorage.length > 0){
            //Add a clear element 
            var clearEl = document.querySelector("#clear-storage");
            clearEl.textContent = "clear";
            clearEl.setAttribute("id", "clear-storage");
            clearEl.setAttribute("href", "#");
            
        }
        //If not
        else{
            //Let the clear element be blank
            var clearEl = document.createElement('a');
            clearEl.textContent = "";
        }
    }
}
//Event listener for search button
$("#search-button").on("click", function(event){
    event.preventDefault();
    userCity = $("#search-city").val();
    getCurrentForecast(event);
    
})
//Event listener for search history list items
$("#city-results").on("click", function(event){
    event.preventDefault();
    $("#search-city").val(event.target.textContent);
    userCity = $("#search-city").val();
    getCurrentForecast(event);
})
//Event listener for clear history
$("#clear-storage").on("click", function(event){
    $("#search-city").text("");
    $("#clear-storage").text("")
    $("#current-weather").text("");
    $("#five-day-forecast").text("");
    localStorage.clear();
    renderStorage();
    
})
//Renders local storage on page load
renderStorage();
//Gets current forefact for default value "San Diego" on page load
getCurrentForecast();
