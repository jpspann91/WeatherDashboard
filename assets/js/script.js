var APIKey = "2b281ac94df8508b75ac15c798af4be6";
var userCity = "";
var lastUserCity = "";

var handleErrors = (response) => {
    if(!response.ok){
        throw Error(response.statusText);
    }
    return response;
}

function getCurrentForecast(event){
    var city = $("#search-city").val();
    userCity = $("#search-city").val();

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + APIKey;

    fetch(queryURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            saveCity(city);
            console.log(data)
            $("#search-error").text("");
            $("#current-weather").text("")

            var currentWeatherIcon = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";

            var currentTime = data.dt;

            var currentTimeOffset = data.timezone;

            var curtrentTimeOffsetHours = currentTimeOffset / 60 / 60;

            var currentMoment = moment.unix(currentTime).utc().utcOffset(curtrentTimeOffsetHours);

            renderStorage();

            getFiveDay(event);

            $("#header-text").text(data.name);

            var contentHeader = document.createElement('h3');
            contentHeader.textContent = data.name + " " + currentMoment.format("(MM/DD/YY)");
            var weatherIcon = document.createElement('img');
            weatherIcon.setAttribute('src', currentWeatherIcon);
            contentHeader.append(weatherIcon);
            $("#current-weather").append(contentHeader);

            var weatherInfoList = document.createElement('ul');
            weatherInfoList.classList.add("list-unstyled");

            var tempListItem = document.createElement('li');
            tempListItem.textContent = "Temperature: " + data.main.temp + String.fromCharCode(8457)
            weatherInfoList.append(tempListItem);

            var humidityListItem = document.createElement('li');
            humidityListItem.textContent = "Humidity: " + data.main.humidity + "%";
            weatherInfoList.append(humidityListItem);

            var windSpeedListItem = document.createElement('li');
            windSpeedListItem.textContent = "Wind Speed: " + data.wind.speed + " mph";
            weatherInfoList.append(windSpeedListItem);

            //Get UV index need a specific URL for it using one call
            var latitude = data.coord.lat;
            var longitude = data.coord.lon;
            var uvQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=" + APIKey;

            

            fetch(uvQueryUrl)
                .then(handleErrors)
                .then(function(response){
                    return response.json();
                })
                .then(function(data){
                    console.log(data);
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

                $('#current-weather').append(weatherInfoList);
        })
}

function getFiveDay(){
    var city = $("#search-city").val();

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&per_page=5&appid=" + APIKey;

    fetch(queryURL)
    .then(handleErrors)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        console.log(data);
        console.log("RIGHT HERE")
        $("#five-day-forecast").text("");

        var fiveDayHeader = document.createElement('h2');
        fiveDayHeader.textContent = "5-Day Forecast";
        $('#five-day-forecast').append(fiveDayHeader);

        var foreCastDivEl = document.createElement('div');
        foreCastDivEl.setAttribute('id', "fiveDayList")
        foreCastDivEl.classList.add("d-inline-flex","flex-wrap");

        for(var i = 0; i < data.list.length; i ++){
            var dayData = data.list[i];
            var dayTimeUTC = dayData.dt;
            var timeZoneOffset = data.city.timezone;
            var timeZoneOffsetHours = timeZoneOffset / 60 / 60;

            var currentMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);

            var iconUrl = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";

            if(currentMoment.format("HH:mm:ss") == "11:00:00" || currentMoment.format("HH:mm:ss") == "12:00:00" || currentMoment.format("HH:mm:ss") == "13:00:00"){
                var cardDivEl = document.createElement('div');
                cardDivEl.classList.add("weather-card", "card", "m-2", "p0");


                var cardListEl = document.createElement("ul");
                cardListEl.classList.add("list-unstyled", "p-3");
                

                var dateListItem = document.createElement('li');
                dateListItem.textContent = currentMoment.format("MM/DD/YY");
                cardListEl.append(dateListItem);

                var iconListItem = document.createElement('li');
                var iconImg = document.createElement('img')
                iconImg.setAttribute('src', iconUrl);
                iconListItem.append(iconImg);
                cardListEl.append(iconListItem);

                

                var cardTempListItem = document.createElement('li');
                cardTempListItem.textContent = "Temp: " + dayData.main.temp + String.fromCharCode(8457);
                cardListEl.append(cardTempListItem);

                var cardHumListItem = document.createElement('li');
                cardHumListItem.textContent = "Hum: " + dayData.main.humidity + "%";
                cardListEl.append(cardHumListItem);

                cardDivEl.append(cardListEl);
                foreCastDivEl.append(cardDivEl);
            }
        }

        $("#five-day-forecast").append(foreCastDivEl);
    })
}

function saveCity(newCity){
    var cityExists = false;
    for(var i = 0; i < localStorage.length; i++){
        if(localStorage["cities" + i] === newCity){
            cityExists = true;
            break;
        }
    }
    if(cityExists === false){
        localStorage.setItem('cities' + localStorage.length, newCity);
    }

}
function renderStorage(){
    $("#city-results").empty();

    
    if(localStorage.length === 0){
        if(lastUserCity){
            $("#search-city").attr("value", lastUserCity)
        }
        else{
            $("#search-city").attr("value", "San Diego");
        }
    }
    else{
        var lastCityKey = 'cities' + (localStorage.length - 1);
        lastUserCity = localStorage.getItem(lastCityKey);

        $("#search-city").attr("value", lastUserCity);
        


        for(var i = 0; i < localStorage.length; i++){
            var city = localStorage.getItem('cities' + i);
            
            console.log("cities" + i);

            if(city === userCity){
                var cityListItem = document.createElement('li');
                var cityBtn = document.createElement('button');
                cityBtn.setAttribute('type', "button");
                cityBtn.classList.add("list-group-item", "list-group-item-action", "active");
                cityBtn.textContent = city;
                cityListItem.append(cityBtn);
            }
            else{
                var cityListItem = document.createElement('li');
                var cityBtn = document.createElement('button');
                cityBtn.setAttribute('type', "button");
                cityBtn.classList.add("list-group-item", "list-group-item-action");
                cityBtn.textContent = city;
                cityListItem.append(cityBtn);
            }
            $("#city-results").prepend(cityListItem);
        }
        if(localStorage.length > 0){
            var clearEl = document.querySelector("#clear-storage");
            clearEl.textContent = "clear";
            clearEl.setAttribute("id", "clear-storage");
            clearEl.setAttribute("href", "#");
            
        }
        else{
            var clearEl = document.createElement('a');
            clearEl.textContent = "";
        }
    }
}

$("#search-button").on("click", function(event){
    event.preventDefault();
    userCity = $("#search-city").val();
    getCurrentForecast(event);
    
})

$("#city-results").on("click", function(event){
    event.preventDefault();
    $("#search-city").val(event.target.textContent);
    userCity = $("#search-city").val();
    getCurrentForecast(event);
})

$("#clear-storage").on("click", function(event){
    $("#search-city").val("");
    $("#clear-storage").textContent = "";
    $("#current-weather").val("");
    $("#five-day-forecast").val("");
    localStorage.clear();
    renderStorage();
    
})
// getFiveDay();
renderStorage();

getCurrentForecast();
