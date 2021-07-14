window.onload = async () => {
    let data = await callOW('Liège')
    let transformedData = transform(data);
    displayData(transformedData);
}

async function callOW (place) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${place}&units=metric&appid=4c7c517ec895981f34d075c475fc1952`, {mode: 'cors'})
    const OWData = response.json();
    return OWData
}

function transform(dataObject) {
    const coord = coordinates(dataObject.coord.lat, dataObject.coord.lon);
    const cardinalWindDir = cardinalify(dataObject.wind.deg);
    const weatherDescription = objectifyArray(dataObject.weather);

    const finalDataObject = {
        location: {
            name: dataObject.name,
            country: dataObject.sys.country,
            coordinates: coord,
        },
        temperature: {
            current: dataObject.main.temp + '°C',
            min: dataObject.main.temp_min + '°C',
            max: dataObject.main.temp_max + '°C',
        },
        wind: {
            speed: dataObject.wind.speed + ' m/s',
            direction: cardinalWindDir,
        },
        clouds: dataObject.clouds.all + '%',
        humidity: dataObject.main.humidity + '%', 
        weather: weatherDescription,
    }
    
    return finalDataObject
}

function displayData(dataObject) {
    console.log(dataObject)
    const contentDiv = document.getElementById('weather-info');
    contentDiv.textContent = dataObject.weather.description

}

function coordinates (lat, lon) {
    let NS;
    let WE;
    lat > 0 ? NS = 'N' : NS = 'S';
    lon > 0 ? WE = 'E' : WE = 'W';
    
    function degreefy (coord) {
        let absoluteCoord = Math.abs(coord);
        let degree = Math.floor(absoluteCoord);
        let minuteDecimal = Math.round((Math.round((absoluteCoord - Math.floor(absoluteCoord)) * 10000) / 10000) * 60 * 10000) / 10000;
        let minute = Math.floor(minuteDecimal);
        let second = Math.round(((Math.round((minuteDecimal - minute) * 10000) / 10000) * 60) * 10000) / 10000

        return `${degree}° ${minute}' ${second}"`
    }

    let DMSLat = degreefy(lat);
    let DMSLon = degreefy(lon);

    return `${DMSLat} ${NS}, ${DMSLon} ${WE}`
}

function cardinalify(windDirection) {
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
            cardinalDirection = 'SSO'
            break;
        case 10:
            cardinalDirection = 'SO'
            break;
        case 11:
            cardinalDirection = 'OSO'
            break;
        case 12:
            cardinalDirection = 'O'
            break;
        case 13:
            cardinalDirection = 'ONO'
            break;
        case 14:
            cardinalDirection = 'NO'
            break;
        case 15:
            cardinalDirection = 'NNO'
            break;
        case 16:
            cardinalDirection = 'N'
            break;
    }

    return cardinalDirection
}

function objectifyArray (array) {
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
