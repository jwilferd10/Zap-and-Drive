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
  mymap = L.map(mapContainer).setView([37.09024, -95.712891], 3);
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
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

// Remove the marker when invoked
const removeMarkers = () => {
  console.log('Before removal:', markers);
  markers.forEach(marker => {
    mymap.removeLayer(marker);
  });

  // Clear the markers array
  markers = [];

  console.log('After removal:', markers);
};

const createMarker = (coordinates, popupText) => {
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

const getGeoLocation = (latitude, longitude) => {
  fetch(`https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`)
    .then(response => response.json())
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

const isValidState = (state) => {
  const validStates = "wa|or|ca|ak|nv|id|ut|az|hi|mt|wy|co|nm|nd|sd|ne|ks|ok|tx|mn|ia|mo|ar|la|wi|il|ms|mi|in|ky|tn|al|fl|ga|sc|nc|oh|wv|va|pa|ny|vt|me|nh|ma|ri|ct|nj|de|md|dc";
  return validStates.indexOf(state.toLowerCase() + "|") > -1;
};

const isValidCity = (city) => {
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

const getChargeStation = (latitude, longitude) => {
  fetch(`https://api.openchargemap.io/v3/poi/?output=json&key=${OPENCHARGE_API_KEY}&latitude=${latitude}&longitude=${longitude}&countrycode=US&maxresults=20&compact=true&verbose=false`)
    .then(response => response.json())
    .then(data => {
      handleChargeStationData(data);
    })
    .catch(error => console.log('error', error));
};

const handleChargeStationData = (data) => {
  // This html 
  let addressList = "";

  // Clear existing markers
  removeMarkers();

  data.forEach(element => {
    const cityVal = element.AddressInfo.AddressLine1;

    if (cityVal) {
      addressList += `<li class="cityVal">${cityVal}</li>`;
      const { Latitude, Longitude, AddressLine1, AccessComments } = element.AddressInfo;
      
      if (Latitude && Longitude) {
        
        const cityEVList = AddressLine1;
        const cityDesc = AccessComments;
        const text = `Address is: ${cityEVList}, Hours: ${cityDesc}`;

        // Pass collected data to createMarker
        createMarker([Latitude, Longitude], text);
      };
    };
  });

  addressListWrapper.innerHTML = addressList;

  document.getElementById("notify");
  document.getElementById('clickItems').addEventListener("click", listItemText);

  // function listItemText(event) {
  //   const liClicked = event.target;
  //   if (liClicked.nodeName === "LI") {
  //     const clickCity = liClicked.textContent;
  //     getEVMap(clickCity);
  //   }
  // }
  console.log(markers);
};

// const getEVMap = (clickCity) => {
//   data.forEach(element => {
//     const { Latitude, Longitude, AddressInfo } = element;
//     const { AddressLine1, AccessComments } = AddressInfo;
//     if (AddressLine1 === clickCity) {
//       const cityEVList = AddressLine1;
//       const cityDesc = AccessComments;
//       marker = L.marker([Latitude, Longitude], { icon: myIcon }).addTo(mymap);
//       const text = `Address is: ${cityEVList}, Hours: ${cityDesc}`;
//       marker.bindPopup(text);
//     }
//   });
// };

// Event Listeners
buttonSearchEV.addEventListener('click', () => getExactLocation());
markerButton.addEventListener('click', () => removeMarkers());

initializeMap();