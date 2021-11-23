/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestUnicorn(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: result => completeRequest(result, pickupLocation),
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result, pickupLocation) {
        var unicorn;
        var pronoun;
        getWeather(pickupLocation)
        console.log('Response received from API: ', result);
        unicorn = result.Unicorn;
        pronoun = unicorn.Gender === 'Male' ? 'his' : 'her';
        displayUpdate(unicorn.Name + ', your ' + unicorn.Color + ' unicorn, is on ' + pronoun + ' way.');
        animateArrival(function animateCallback() {
            displayUpdate(unicorn.Name + ' has arrived. Giddy up!');
            WildRydes.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    function getWeather(loc) {
        let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${loc.latitude}&lon=${loc.longitude}&exclude=minutely,hourly&appid=a099a51a6362902523bbf6495a0818aa`;
        fetch(url)
            .then(response => response.json())  //  wait for the response and convert it to JSON
            .then(weather => {                  //  with the resulting JSON data do something

                //  If the city was entered extract weather based on that API else use the LatLon API result format
                let wx = latLonToWeather(weather);
                let innerHTML = '';
                //  We have converted the Lon Lat API (onecall) and City API (forecast) requests to the same format
                for (let day of wx.daily) {
                    //  let's build a nice card for each day of the weather data
                    //  this is a GREAT opportunity to Reactify this code. But for now I will keep it simple
                    innerHTML += `<h2>Date: ${day.date}</h2>
                            <h4>Temp: Low ${day.min}&deg; / High: ${day.max}&deg;</h4>
                            <p>Forecast: <img src='http://openweathermap.org/img/wn/${day.icon}@2x.png' alt=""> ${day.description}</p>
                            <p>Chance of rain at ${day.pop}%</p>
                            <p>Wind at ${day.wind_speed} mph out of the ${day.windDirection}</p>
                            <p>Sunrise: ${day.sunrise} / Sunset: ${day.sunset}</p>`;
                }
                displayUpdate(innerHTML);
            });
    }

    function latLonToWeather(data) {
        let wx = {};
        wx.daily = data.daily.map(d => ({
            date:           niceDate(d.dt,data.timezone_offset),
            min:            KtoF(d.temp.min),
            max:            KtoF(d.temp.max),
            sunrise:        niceTime(d.sunrise, data.timezone_offset),
            sunset:         niceTime(d.sunset, data.timezone_offset),
            icon:           d.weather[0].icon,
            description:    d.weather[0].description,
            wind_speed:     d.wind_speed.toFixed(0),
            windDirection:  windDirection(d.wind_deg),
            pop:            (d.pop * 100).toFixed(0),
            feels_like:     KtoF(d.feels_like.day),
            dewPoint:       d.dew_point,
            humidity:       d.humidity,
        }));
        wx.city = "";
        wx.lat  = data.lat;
        wx.lon  = data.lon;
        return wx;
    }


    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(WildRydes.map).on('pickupChange', handlePickupChanged);

        WildRydes.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = WildRydes.map.selectedPoint;
        event.preventDefault();
        requestUnicorn(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = WildRydes.map.selectedPoint;
        var origin = {};

        if (dest.latitude > WildRydes.map.center.latitude) {
            origin.latitude = WildRydes.map.extent.minLat;
        } else {
            origin.latitude = WildRydes.map.extent.maxLat;
        }

        if (dest.longitude > WildRydes.map.center.longitude) {
            origin.longitude = WildRydes.map.extent.minLng;
        } else {
            origin.longitude = WildRydes.map.extent.maxLng;
        }

        WildRydes.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
