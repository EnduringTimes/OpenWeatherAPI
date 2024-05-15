const apiKey = '84c39dbd11e87790cbb5a70a3f1adf5a';

// Helper function to capitalize city names
function capitalizeCityName(city) {
    return city
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

document.getElementById('weatherForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let city = document.getElementById('search').value.trim();
    if (city) {
        city = capitalizeCityName(city);
        getCoordinates(city);
    }
});

// Get coordinates and get weather data
function getCoordinates(city) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                getWeather(lat, lon, city);
            } else {
                alert('City not found!');
            }
        })
        .catch(error => console.error('Error fetching coordinates:', error));
}

// Get weather data
function getWeather(lat, lon, city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data, city);
            displayForecast(data);
            updateSearchHistory(city);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

// Display current weather
function displayCurrentWeather(data, city) {
    const weather = data.list[0];
    const currentWeatherDiv = document.createElement('div');
    currentWeatherDiv.id = 'current-weather';
    currentWeatherDiv.innerHTML = `
        <h2>${city} (${new Date(weather.dt_txt).toLocaleDateString()})</h2>
        <p><img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="${weather.weather[0].description}"> ${weather.weather[0].description}</p>
        <p>Temperature: ${weather.main.temp} °C</p>
        <p>Humidity: ${weather.main.humidity}%</p>
        <p>Wind Speed: ${weather.wind.speed} m/s</p>
    `;
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = '';
        main.appendChild(currentWeatherDiv);
    }
}

// Display forecast
function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    if (forecastDiv) {
        forecastDiv.innerHTML = '';
        for (let i = 0; i < data.list.length; i += 8) {
            const forecast = data.list[i];
            const forecastItem = document.createElement('article');
            forecastItem.classList.add('fiveDayForecast');
            forecastItem.innerHTML = `
                <h3>${new Date(forecast.dt_txt).toLocaleDateString()}</h3>
                <p><img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}"> ${forecast.weather[0].description}</p>
                <p>Temperature: ${forecast.main.temp} °C</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
                <p>Wind Speed: ${forecast.wind.speed} m/s</p>
            `;
            forecastDiv.appendChild(forecastItem);
        }

        // Show the forecast section and header
        document.getElementById('forecast').style.display = 'grid';
        document.getElementById('forecast-header').style.display = 'block';

        // Create and append the refresh button
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Check another city';
        refreshButton.classList.add('refresh-button');
        refreshButton.addEventListener('click', () => {
            location.reload();
        });
        forecastDiv.appendChild(refreshButton);
    }
}

// Update search history
function updateSearchHistory(city) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    }
}

// Display search history
function displaySearchHistory() {
    const searchHistoryDiv = document.getElementById('pastInput');
    if (searchHistoryDiv) {
        searchHistoryDiv.innerHTML = '';
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistory.forEach(city => {
            const cityButton = document.createElement('button');
            cityButton.textContent = city;
            cityButton.addEventListener('click', () => getCoordinates(city));
            searchHistoryDiv.appendChild(cityButton);
        });
    }
}

displaySearchHistory();
