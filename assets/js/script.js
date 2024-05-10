const LOCATIONIQ_API_KEY = 'pk.ad5fee34ab1e2ea0bd879a1133833e20';
const OPENCHARGE_API_KEY = '3a67b0b5-eb1a-4f31-b226-2f994d496e41';

const cityInput = document.getElementById("city");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const notificationEl = document.querySelector(".notification");
const buttonSearchEV = document.querySelector("#searchEV");
const buttonSubmit = document.querySelector('#submitBtn');
const inputValue = document.querySelector('#inputValue');
const inputValue1 = document.querySelector('#inputValue1');
const mapContainer = document.getElementById("mapID");
const markerButton = document.querySelector('#delMark');
const userInput = document.getElementById("userInput");
const addressListWrapper = document.querySelector('.address-list-wrapper');

let mymap;
let tiles;
let marker;
let markers = [];

// Initialize the OpenStreetMap
const initializeMap = () => {
  // Initialize the map with default view and attribution
  mymap = L.map(mapContainer).setView([37.09024, -95.712891], 3);
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  
  // Add a tile layer with OpenStreetMap tiles
  const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  tiles = L.tileLayer(tileURL, { attribution }).addTo(mymap);
  marker = null;
};

// myIcon contains the marker/img that will show up on the map
const myIcon = L.icon({
  iconUrl: './img/zap.png',
  iconSize: [50, 50],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
});

// Remove all markers from the map
const removeMarkers = () => {
  // Commented Testing Log
  // console.log('Before removal:', markers);

  // Remove each marker from the map
  markers.forEach(marker => {
    mymap.removeLayer(marker);
  });

  // Clear the markers array
  markers = [];

  // Commented Testing Log
  // console.log('After removal:', markers);
};

// Create a marker at the given coordinates with a popup text
const createMarker = (coordinates, popupText) => {
  // Create a marker with the specified coordinates and popup text
  const marker = L.marker(coordinates, { icon: myIcon }).addTo(mymap);
  marker.bindPopup(popupText);

  // Add the marker to the markers array.
  markers.push(marker);
}

const getExactLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
  } else {
    notificationEl.innerHTML = "<p>Browser doesn't support Geolocation</p>";
  }
};

const setPosition = (position) => {
  const { latitude, longitude } = position.coords;
  getGeoLocation(latitude, longitude);
};

const showError = (error) => {
  notificationEl.innerHTML = `<p>${error.message}</p><br>Just Enter City and State</p>`;
};

// Get the geographic location using latitude and longitude
const getGeoLocation = (latitude, longitude) => {
  // Fetch reverse geocoding data using latitude and longitude
  fetch(`https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`)
    .then(response => response.json())
    
    // If successful, get charge stations near the location. If unsuccessful, log the error
    .then(data => {
      getChargeStation(data.lat, data.lon);
    })
    .catch(error => console.log('error', error));
};

buttonSubmit.addEventListener('click', function () {
  removeMarkers();
  const stateInput = inputValue1.value;
  if (!isValidState(stateInput)) {
    notificationEl.innerHTML = "<p>Please input valid State!!!</p>";
  } else {
    notificationEl.innerHTML = "<p>Valid State Entered</p>";
  }

  if (!isValidCity(inputValue.value) || inputValue1.value === "") {
    notificationEl.innerHTML = "<p>Please input valid city!!!</p>";
  }

  if (inputValue.value !== "" && inputValue1.value !== "") {
    getLocation();
  }
});

// Validate the state input against a list of valid states
const isValidState = (state) => {
  // Check if the state is included in the list of valid states
  const validStates = "wa|or|ca|ak|nv|id|ut|az|hi|mt|wy|co|nm|nd|sd|ne|ks|ok|tx|mn|ia|mo|ar|la|wi|il|ms|mi|in|ky|tn|al|fl|ga|sc|nc|oh|wv|va|pa|ny|vt|me|nh|ma|ri|ct|nj|de|md|dc";
  return validStates.indexOf(state.toLowerCase() + "|") > -1;
};

// Validate the city input against a regex pattern
const isValidCity = (city) => {
  // Check if the city matches the regex pattern
  const cityRegex = /^[a-zA-z] ?([a-zA-z]|[a-zA-z] )*[a-zA-z]$/;
  return city.match(cityRegex) && city !== "";
};

const getLocation = () => {
  fetch(`https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&city=${inputValue.value}&state=${inputValue1.value}&country=United States of America&format=json`)
    .then(response => response.json())
    .then(data => {
      const [result] = data;
      getChargeStation(result.lat, result.lon);
    })
    .catch(err => alert("Wrong City"));
};

// Get charge stations near the specified location
const getChargeStation = (latitude, longitude) => {
  // Fetch charge station data using latitude and longitude
  fetch(`https://api.openchargemap.io/v3/poi/?output=json&key=${OPENCHARGE_API_KEY}&latitude=${latitude}&longitude=${longitude}&countrycode=US&maxresults=20&compact=true&verbose=false`)
    .then(response => response.json())
    
    // If successful, populate the map with charge stations
    .then(data => {
      populateMapWithChargeStations(data);
    })
    .catch(error => console.log('error', error));
};

const populateMapWithChargeStations = (data) => {
  try {
    // Set addressList to an empty string
    let addressList = "";

    // Clear existing markers
    removeMarkers();

    // Loop through each element in the 'data' array
    data.forEach(element => {
      // Destructure relevant properties from 'AddressInfo' object
      const { Latitude, Longitude, AddressLine1, AccessComments } = element.AddressInfo;
      
      // Check if Latitude, Longitude, and AddressLine1 are truthy
      if (Latitude && Longitude && AddressLine1) {
        // Construct text for marker popup, include 'AccessComments' or 'Not Found' if unavailable
        const text = `Address is: ${AddressLine1}, Hours: ${AccessComments || 'Not Found'}`;

        // Create a marker at the given Latitude and Longitude with the constructed text
        createMarker([Latitude, Longitude], text);

        // Append an HTML list item containing the address to the 'addressList' string
        addressList += `<li class="cityVal">${AddressLine1}</li>`;
      };
    });

    // Populating wrapper with collected list items
    addressListWrapper.innerHTML = addressList;

    // HTML and Console notifications
    document.getElementById("notify");
    console.log(markers);
  } catch (error) {
    // broadcast error message to console
    console.log('An error has occurred when handling charge station data:', error)
  }
};

// Event Listeners
buttonSearchEV.addEventListener('click', () => getExactLocation());
markerButton.addEventListener('click', () => removeMarkers());

initializeMap();