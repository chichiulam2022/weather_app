const searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-button');
const historyText = document.getElementById('history');
const ClearHistoryBtn = document.getElementById('clear');
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

//for clicking
searchBtn.addEventListener('click', () => {
    const searchTerm = searchBox.value.toUpperCase();
    searchHistory.push(searchTerm)
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    getWeather(searchTerm);
    viewSearchHistory();
});

//for entering
searchBox.addEventListener('keypress', (e) => {
    const searchTerm = searchBox.value.toUpperCase();
    if (e.key === 'Enter') {
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        searchHistory.push(searchTerm);
        getWeather(searchTerm);
        viewSearchHistory();
    }
});

//generate time using Moment.js
setInterval(() => {
    const currentTime = document.querySelector('.current-time')
    let time = moment().format('LTS');
    currentTime.innerHTML = time;
}, 1000)


function viewSearchHistory() {
    historyText.innerHTML = "";
    const historyContainer = document.getElementById('history-contaner')
    historyContainer.classList.remove('d-none');
    for (let i = 0; i < searchHistory.length; i++) {
        const historyItem = document.createElement("div");
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.textContent = searchHistory[i]
        historyText.append(historyItem);
    }
}

//clear history
ClearHistoryBtn.onclick = () => {
    localStorage.clear();
    searchHistory = [];
    viewSearchHistory();
}

function getWeather(city) {
    const key = "73b0a80c1401397a16e07b838eb42982"
    const baseURL = "https://api.openweathermap.org/data/2.5/"

    const queryURL = (`${baseURL}weather?q=${city}&units=metric&APPID=${key}`)
    axios.get(queryURL)
        .then(res => {
            const card = document.querySelector('.card');
            card.classList.remove('d-none');

            //get city
            const city = document.querySelector('.city');
            city.innerHTML = `${res.data.name},&nbsp${res.data.sys.country}`

            //get date
            const currentDate = new Date();
            const date = document.querySelector('.date');
            date.innerHTML = createDate(currentDate);

            //get temp
            const temp = document.querySelector('.temp')
            temp.innerHTML = `${Math.round(res.data.main.temp)}&nbsp°C`
            //get weather description
            const weatherDes = document.querySelector('.weather-description');
            weatherDes.innerHTML = res.data.weather[0].main;

            //get weather icon
            const currentWeatherIcon = document.querySelector('.current-weather-icon');
            const weatherIconIndex = res.data.weather[0].icon;
            currentWeatherIcon.setAttribute("src", `http://openweathermap.org/img/wn/${weatherIconIndex}@2x.png`);

            //get humidity
            const humidityPerc = document.querySelector('.humidity');
            humidityPerc.innerHTML = `Humidty: ${res.data.main.humidity}&nbsp%`;

            //get hi-low temp 
            const hilowTemp = document.querySelector('.hi-low-temp');
            hilowTemp.innerHTML = `Min./Max.&nbspTemp: ${Math.round(res.data.main.temp_min)}&nbsp°C / ${Math.round(res.data.main.temp_max)}&nbsp°C`

            //get windspeed 
            const windSpeed = document.querySelector('.wind-speed');
            windSpeed.innerHTML = `Wind&nbspSpeed: ${Math.round((res.data.wind.speed) * 3.6)}&nbspkm/h`

            //get UV index
            let lat = res.data.coord.lat;
            let lon = res.data.coord.lon;
            let uvQuery = `${baseURL}uvi/forecast?lat=${lat}&lon=${lon}&appid=${key}&cnt=1`;
            axios.get(uvQuery)
                .then(res => {
                    let UVspan = document.createElement('span');
                    let UVindexRange = Math.round(res.data[0].value)
                    if (UVindexRange == 1 || UVindexRange == 2) {
                        UVspan.setAttribute('class', 'badge badge-pill badge-success');
                    }
                    else if (UVindexRange >= 3 && UVindexRange <= 7) {
                        UVspan.setAttribute('class', 'badge badge-pill badge-warning');
                    }
                    else if (UVindexRange >= 8 && UVindexRange <= 10) {
                        UVspan.setAttribute('class', 'badge badge-pill badge-danger');
                    }
                    else {
                        UVspan.setAttribute("class", "badge badge-pill badge-dark");
                    }
                    const UVIndex = document.querySelector('.uv-index')
                    UVspan.innerHTML = UVindexRange;
                    UVIndex.innerHTML = "UV Index: ";
                    UVIndex.append(UVspan)
                })

            //5-day forecast 
            let cityID = res.data.id;
            let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityID}&appid=${key}`;
            axios.get(forecastURL)
                .then(res => {
                    const forecastContainer = document.querySelector('.forecast-card-container');
                    const forecastCards = document.querySelectorAll('.forecast-card');
                    forecastContainer.classList.remove('d-none');
                    for (i = 0; i < forecastCards.length; i++) {
                        forecastCards[i].innerHTML = "";
                        const forecastIndex = i * 8 + 4;
                        const forecastDate = new Date(res.data.list[forecastIndex].dt * 1000);
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                        const d = new Date();
                        const forecastMonth = months[d.getMonth()];
                        const forecastDay = forecastDate.getDate()
                        const forecastYear = forecastDate.getFullYear();
                        const forecastDateEl = document.createElement("p");
                        forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                        forecastDateEl.innerHTML = `${forecastMonth}&nbsp${forecastDay}, ${forecastYear}`;
                        forecastCards[i].append(forecastDateEl);

                        //add icons
                        const forecastEl = document.createElement("img");
                        forecastEl.setAttribute("src", "https://openweathermap.org/img/wn/" + res.data.list[forecastIndex].weather[0].icon + "@2x.png");
                        forecastEl.setAttribute("alt", res.data.list[forecastIndex].weather[0].description);
                        forecastCards[i].append(forecastEl);

                        //add temp and convert it from Kelvin to Celsius 
                        const forecastTempEl = document.createElement("p");
                        forecastTempEl.innerHTML = `Temp: ${Math.round(res.data.list[forecastIndex].main.temp - 273.15)}&nbsp°C`
                        forecastCards[i].append(forecastTempEl);

                        // add humidity
                        const forecastHumid = document.createElement("p");
                        forecastHumid.innerHTML = `Humid: ${res.data.list[forecastIndex].main.humidity}%`
                        forecastCards[i].append(forecastHumid);
                    }
                })
        })
}

function createDate(d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    let currentDay = days[d.getDay()];
    let currentDate = d.getDate();
    let currentMonth = months[d.getMonth()];
    let currentYear = d.getFullYear();
    return `${currentMonth} ${currentDate}, ${currentYear} (${currentDay})`;
}



