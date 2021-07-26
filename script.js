window.onload = getWeather('Liège')
document.forms[0].addEventListener('submit', handleSubmit)

function handleSubmit(e) {
    e.preventDefault(); 
    let city = document.forms[0].elements[0].value;
    if (city) {
        getWeather(city, 0);
        document.forms[0].elements[0].value = '';
    }
}

async function getWeather(place, clear) {
    let data = await callOW(place);
    if (typeof data === 'object'){
        let transformedData = transform(data);
        displayData(transformedData);
        backgroundImgChange(transformedData);
        let myTimeOut = setTimeout(changeTime, transformedData.ping)
        if (clear === 0) {
            clearTimeout(myTimeOut)
        }
    } else if (typeof data === 'string'){
        console.log(data)
    }
}

async function callOW (place) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${place}&units=metric&appid=4c7c517ec895981f34d075c475fc1952`, {mode: 'cors'})
        const OWData = await response.json();
        // console.log(OWData)
        if(OWData.cod !== 200) {
            return OWData.message
        } else {
            return OWData
        }
    } catch (error) {  
        console.log(error)
    }
}

function transform(dataObject) {
    const coord = getCompleteCoordinates(dataObject.coord.lat, dataObject.coord.lon);
    const cardinalWindDir = getCardinalDirection(dataObject.wind.deg);
    const weatherDescription = getWeatherObject(dataObject.weather);
    const time = getLocationTime(dataObject.timezone).timeDisplay;
    const ping = getLocationTime(dataObject.timezone).delayBeforeNextMin * 1000;
    
    let finalDataObject = {
        location: {
            name: dataObject.name,
            country: dataObject.sys.country,
            coordinates: coord,
            callTime: time,
        },
        temperature: {
            current: dataObject.main.temp + '°C',
            min: dataObject.main.temp_min + '°C',
            max: dataObject.main.temp_max + '°C',
        },
        wind: {
            speed: dataObject.wind.speed + ' m/s',
            direction: dataObject.wind.deg,
            cardinal: cardinalWindDir,
        },
        clouds: dataObject.clouds.all + '%',
        humidity: dataObject.main.humidity + '%', 
        weather: weatherDescription,
        ping: ping,
    }
    
    return finalDataObject
}

function getCompleteCoordinates (lat, lon) {
    let NS;
    let WE;
    lat > 0 ? NS = 'N' : NS = 'S';
    lon > 0 ? WE = 'E' : WE = 'W';
    
    function convertToDegreeMinSec (coord) {
        let absoluteCoord = Math.abs(coord);
        let degree = Math.floor(absoluteCoord);
        let minuteDecimal = Math.round((Math.round((absoluteCoord - Math.floor(absoluteCoord)) * 10000) / 10000) * 60 * 10000) / 10000;
        let minute = Math.floor(minuteDecimal);
        let second = Math.round(((Math.round((minuteDecimal - minute) * 10000) / 10000) * 60) * 10000) / 10000

        return `${degree}° ${minute}' ${second}"`
    }

    let DMSLat = convertToDegreeMinSec(lat);
    let DMSLon = convertToDegreeMinSec(lon);

    return `${DMSLat} ${NS} - ${DMSLon} ${WE}`
}

function getCardinalDirection(windDirection) {
    let fraction = Math.round(windDirection / 22.5);
    let cardinalDirection;

    switch (fraction) {
        case 0:
            cardinalDirection = 'N'
            break;
        case 1:
            cardinalDirection = 'NNE'
            break;
        case 2:
            cardinalDirection = 'NE'
            break;
        case 3:
            cardinalDirection = 'ENE'
            break;
        case 4:
            cardinalDirection = 'E'
            break;
        case 5:
            cardinalDirection = 'ESE'
            break;    
        case 6:
            cardinalDirection = 'SE'
            break;
        case 7:
            cardinalDirection = 'SSE'
            break;
        case 8:
            cardinalDirection = 'S'
            break;
        case 9:
            cardinalDirection = 'SSW'
            break;
        case 10:
            cardinalDirection = 'SW'
            break;
        case 11:
            cardinalDirection = 'WSW'
            break;
        case 12:
            cardinalDirection = 'W'
            break;
        case 13:
            cardinalDirection = 'WNW'
            break;
        case 14:
            cardinalDirection = 'NW'
            break;
        case 15:
            cardinalDirection = 'NNW'
            break;
        case 16:
            cardinalDirection = 'N'
            break;
    }

    return cardinalDirection
}

function getWeatherObject (array) {
    let weather = { description: '', category: ''};
    array.forEach(element => {
        if(weather.description === '') {
            weather.description += element.description;
        } else {
            weather.description += ', ' + element.description;
        }
        if(weather.category === '') {
            weather.category += element.main;
        } else {
            weather.category += ', ' + element.main;
        }
    });
    return weather
}

function getLocationTime (timezone) {
    const UTCDate = new Date();
    const UTCTimeMs = UTCDate.getTime();
    const cityOffset = timezone * 1000;
    const currentAskedLocationDate = new Date(UTCTimeMs + cityOffset);
    let UTCHours = currentAskedLocationDate.getUTCHours();
    if (UTCHours < 10) {
        UTCHours = `0${UTCHours}`
    }
    let UTCMin = currentAskedLocationDate.getUTCMinutes();
    if (UTCMin < 10) {
        UTCMin = `0${UTCMin}`
    }
    const timeDisplay = `${UTCHours}:${UTCMin}`;
    const delayBeforeNextMin = 60 - currentAskedLocationDate.getUTCSeconds();
    return {timeDisplay, delayBeforeNextMin}
}

function displayData(dataObject) {
    console.log(dataObject)

    const location = document.getElementById('location');
    location.textContent = `Here in ${dataObject.location.name} (${dataObject.location.country})`;
    
    const coordinates = document.getElementById('coordinates');
    coordinates.textContent = `${dataObject.location.coordinates}`;
    
    const time = document.getElementById('time');
    time.textContent = `${dataObject.location.callTime}`;  
    
    const weatherDescription = document.getElementById('weather-description');
    weatherDescription.textContent = `${dataObject.weather.description}`;

    const temperature = document.getElementById('temperature');
    temperature.textContent = `${dataObject.temperature.current}`;

    const clouds = document.getElementById('clouds');
    clouds.textContent = `${dataObject.clouds} cloud coverage`;

    const humidity = document.getElementById('humidity');
    humidity.textContent = `${dataObject.humidity} humidity`;

    const wind = document.getElementById('wind-speed');
    wind.textContent = ` ${dataObject.wind.speed} speed`;

    const windDirection = document.getElementById('wind-dir');
    windDirection.textContent = `${dataObject.wind.cardinal} wind:`;
    
    const windArrow = document.getElementById('arrow-img');
    windArrow.style.transform = `rotate(${dataObject.wind.direction}deg)`;
}

function backgroundImgChange(dataObject) {
    let mainCategory = dataObject.weather.category.split(',')[0].toLowerCase();

    let cloudCoverage = Number(dataObject.clouds.replace('%', ''));
    let cloudStyle;
    if (cloudCoverage <= 10) {
        cloudStyle = 'cloud0'
    } else if (cloudCoverage < 25) {
        cloudStyle = 'clouds1'
    } else if (cloudCoverage <= 50) {
        cloudStyle = 'clouds2'
    } else if (cloudCoverage < 85) {
        cloudStyle = 'clouds3'
    } else if (cloudCoverage >= 85) {
        cloudStyle = 'clouds4'
    }
    
    switch (mainCategory) {
        case 'clear':
        case 'rain':
        case 'drizzle':
        case 'thunderstorm':
        case 'snow':
        case 'squall':
        case 'tornado':
            document.body.style.backgroundImage = `url('assets/weather-img/${mainCategory}.jpg')`;
            break;
    
        case 'clouds':
            document.body.style.backgroundImage = `url('assets/weather-img/${cloudStyle}.jpg')`;
            break;
                
        case 'mist':
        case 'fog':
        case 'haze':
        case 'smoke':
        case 'dust':
        case 'sand':
        case 'ash':
            document.body.style.backgroundImage = `url('assets/weather-img/mist.jpg')`;
            break;

        default:
            break;
    }
}

function changeTime() {
    let hour = Number(time.textContent.split(':')[0])
    let min = Number(time.textContent.split(':')[1])
    if (min === 59) {
        min = '0';
        if (hour === 23) {
            hour = '0'
        } else {
            hour += 1;
        }
    } else {
        min += 1;
    }

    if (hour < 10) {
        hour = `0${hour}`
    }
    if (min < 10) {
        min = `0${min}`
    }
    time.textContent = `${hour}:${min}`;
    setTimeout(changeTime, 60 * 1000)
}