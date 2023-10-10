// Global QuerySelectors
// let city = document.getElementById("city");
// let latitude1 = document.getElementById("latitude");
// let longitude1 = document.getElementById("longitude");
// let cityOne = document.getElementById("city1");
// let cityTwo = document.getElementById("city2");
// let button1 = document.querySelector("#searchEV");

// API URLs and keys
const LOCATION_API_KEY = 'be7dfdc7a8184f';
const OPEN_CHARGE_MAP_API_URL = 'https://api.openchargemap.io/v3/poi/?output=json';

// Global Variables
let map;
let marker;
const notificationEl = document.querySelector('.notification');

// Initialize the map
const initializeMap = () => {
  map = L.map('mapID').setView([37.09024,-95.712891], 3);
  const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(tileURL, { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
  tiles.addTo(map);
};

// Remove existing marker and layer
const removeMarker = () => {
  if (marker) {
    map.removeLayer(marker);
  }
};

// Get user's exact location
const getExactLocation = () => {
  if ('geolocation' in navigator) {
    console.log('geolocation available');
    navigator.geolocation.getCurrentPosition(setPosition, showError);
  } else {
    console.log('Geolocation not available on this browser')
    notificationEl.innerHTML = "<p>Your current browser doesn't support Geolocation.</p>";
  }
};

// Set user's position on the map
const setPosition = (position) => {
  const { latitude, longitude } = position.coords;
  getExactLocation(latitude, longitude);
};

// Handle geolocation errors
const showError = (error) => {
  notificationEl.innerHTML = `<p>${error.message}<br>Please Enter City and State</p>`;
};

const getGeoLocation = (latitude, longitude) => {
  fetch(`https://us1.locationiq.com/v1/reverse.php?key=${LOCATION_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`)
    .then(response => response.json())   
    .then(data => {
      // console.log(data);
      const cityName = data.address.city;
      city.innerHTML = data.display_name;
      latitude1.innerHTML = data.lat;
      longitude1.innerHTML = data.lon;
      localStorage.setItem('city', cityName);
      getChargeStation(data.lat, data.lon);
    })
    .catch(error => console.log('error', error));
};

const isValidState = (state) => {
  // Array of states users can input
  const validStates = [
    "wa", "or", "ca", "ak", "nv", "id", "ut", "az", "hi", "mt", "wy",
    "co", "nm", "nd", "sd", "ne", "ks", "ok", "tx", "mn", "ia", "mo",
    "ar", "la", "wi", "il", "ms", "mi", "in", "ky", "tn", "al", "fl",
    "ga", "sc", "nc", "oh", "wv", "va", "pa", "ny", "vt", "me", "nh",
    "ma", "ri", "ct", "nj", "de", "md", "dc"
  ];
  // Ensure the state is set to lowercase for the search 
  return validStates.includes(state.toLowerCase());
};


//Setting up the marker
var myIcon = L.icon({
  iconUrl: './img/zap.png',
  iconSize: [50, 50],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
  
});

// Validate input for city and state
function isValidInput(city, state) {
  const cityRegex = /^[a-zA-Z]+$/;
  return city.match(cityRegex) && isValidState(state);
};

// Get location based on city and state input
const getLocation = () => {
  // For memorie sake, I am using input and input1 although that's changed. REFACTOR THIS AFTERWARDS!
  const city = input.value.trim();
  const state = input1.value.trim();

  if (!isValidInput(city, state)) {
    notificationEl.innerHTML = "<p>Please input valid city and state!</p>";
    return;
  }

  fetch(`${OPEN_CHARGE_MAP_API_URL}?key=${LOCATION_API_KEY}&latitude=${city}&longitude=${state}&countrycode=US&maxresults=20&compact=true&verbose=false`)
  .then(response => response.json())
  .then(data => {
    if (data && data.length > 0) {
      const { Latitude, Longitude, AddressInfo } = data[0];
      getEVMap(Latitude, Longitude, AddressInfo);
    } else {
      notificationEl.innerHTML = "<p>No results found for the given city and state!</p>";
    }
  })
  .catch(error => console.log('error', error));
};

// Display EV Charging stations on the map
const getEVMap = (latitude, longitude, addressInfo) => {
  removeMarker();

  map.setView([latitude, longitude], 15);
  marker = L.marker([latitude, longitude], { icon: myIcon }).addTo(map);
  const text = `Address is: ${addressInfo.AddressLine1}, Hours: ${addressInfo.AccessComments}`;
  marker.bindPopup(text);
};

// Event Listeners
document.querySelector('#searchEV').addEventListener('click', getExactLocation);
document.querySelector('#submitBtn').addEventListener('click', getExactLocation);
document.querySelector('#deleteMarker').addEventListener('click', removeMarker);

// Initialize the map when the page loads
initializeMap();