const config = {
  cUrl: "https://api.countrystatecity.in/v1/countries", // country url
  cKey: "UnQ5WlNaWDNGaEcwa0lFUWwzY04xMkpkWm5EQUswOVJmb2ZZb1BWTg==", // country api key
  wUrl: "https://api.openweathermap.org/data/2.5/", // weather url
  wKey: "6b5671aa130e4a4743c12d2d2de1a25f", //waether api key
};

// -----------------get data(countries,states,cities)-----------------
//              ____________________________________________

const getCountries = async (fieldName, ...args) => {
  let apiEndPoint = config.cUrl;
  switch (fieldName) {
    case "countries":
      apiEndPoint = config.cUrl;
      break;
    case "states":
      apiEndPoint = `${config.cUrl}/${args[0]}/states`;
      break;
    case "cities":
      apiEndPoint = `${config.cUrl}/${args[0]}/states/${args[1]}/cities`;

    default:
  }

  const response = await fetch(apiEndPoint, {
    headers: { "X-CSCAPI-KEY": config.cKey },
  });

  if (response.status != 200) {
    throw new Error(`something went wrong, status code:${response.status}`);
  }

  const countries = await response.json();
  return countries;
};

const getWeather = async (cityName, Countrycode, units = "metric") => {
  const apiEndPoint = `${
    config.wUrl
  }weather?q=${cityName},${Countrycode.toLowerCase()}&APPID=${
    config.wKey
  }&units=${units}`;

  try {
    const response = await fetch(apiEndPoint);
    if (response.status != 200) {
      if (response.status == 404) {
        weatherDiv.innerHTML = `<div class="alert-danger">
                                <h3>Oops! No data available.</h3>
                                </div>`;
      } else {
        throw new Error(
          `Something went wrong, status code: ${response.status}`
        );
      }
    }
    const weather = await response.json();
    return weather;
  } catch (error) {
    console.log(error);
  }
};
const getDateTime = (unixTimeStamp)=>{
  const milliSeconds = unixTimeStamp * 1000;
  const dateObject = new Date(milliSeconds);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const humanDateFormate = dateObject.toLocaleDateString("en-US", options);
  return humanDateFormate;

}
const displayWeather = (data) => {
  const weatherWidget = `
    <div class="card">
        <div class="card-body">
         <h5 class="card-title">
             ${data.name}, ${data.sys.country}
         </h5>
         <p>${getDateTime(data.dt)}</p>
         <div id="tempcard">
             <h6 class="card-subtitle mb2 cel">${data.main.temp}</h6>
             <p class="card-text">Feels like: ${data.main.feels_like} °C</p>
             <p class="card-text">Max: ${data.main.temp_max}, Min: ${
    data.main.temp_min
  }</p>
         </div>

         ${data.weather
           .map(
             (
               w
             ) => `<div id="img-container">${w.main} <img src="https://openweathermap.org/img/wn/${w.icon}.png" /></div>
         <p>${w.main}</p>`
           )
           .join("\n")}
        </div>
         
    </div> `

    weatherDiv.innerHTML=weatherWidget;
};


const getLoader=()=>{
  return `<div class="spinner-grow text-info" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>`;
};


const countriesListDropDown = document.querySelector("#countrylist");
const statesListDropDown = document.querySelector("#statelist");
const citiesListDropDown = document.querySelector("#citylist");
const weatherDiv = document.querySelector("#weatherwidget");

document.addEventListener("DOMContentLoaded", async () => {
  const countries = await getCountries();
  
  let countriesOptions = "";
  if (countries) {
    countriesOptions += `<option value="">Select Country</option>`;
    countries.forEach((element) => {
      countriesOptions += `<option value="${element.iso2}">${element.name}</option>`;
    });

    countriesListDropDown.innerHTML = countriesOptions;
  }

  //   list of states

  countriesListDropDown.addEventListener("change", async function () {
    const selectedCountryCode = this.value;
    const states = await getCountries("states", selectedCountryCode);

    let statesOptions = "";
    if (states) {
      statesOptions += `<option value="">Select State</option>`;
      states.forEach((state) => {
        statesOptions += `<option value="${state.iso2}">${state.name}</option>`;
      });
      statesListDropDown.innerHTML = statesOptions;
      statesListDropDown.disabled = false;
      citiesListDropDown.innerHTML = "";
    }
  });

  //   list of cities

  statesListDropDown.addEventListener("change", async function () {
    const selectedCountryCode = countriesListDropDown.value;
    const selectedStateCode = this.value;
    const cities = await getCountries(
      "cities",
      selectedCountryCode,
      selectedStateCode
    );

    let citiesOptions = "";
    if (cities) {
      citiesOptions += `<option value="">Select City</option>`;
      cities.forEach((city) => {
        citiesOptions += `<option value="${city.name}">${city.name}</option>`;
      });
      citiesListDropDown.innerHTML = citiesOptions;
      citiesListDropDown.disabled = false;
    }
  });

  //   select city

  citiesListDropDown.addEventListener("change", async function () {
    const selectedCountryCode = countriesListDropDown.value;
    const selectedCity = this.value;
    weatherDiv.innerHTML= getLoader();
    const weatherinfo = await getWeather(selectedCity, selectedCountryCode);
    displayWeather(weatherinfo);
  });
});
