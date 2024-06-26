const LOCATIONIQ_API_KEY = 'pk.ad5fee34ab1e2ea0bd879a1133833e20';
const OPENCHARGE_API_KEY = '3a67b0b5-eb1a-4f31-b226-2f994d496e41';

const cityInput = document.getElementById("city");
const notificationEl = document.querySelector(".notification");
const buttonSearchEV = document.querySelector("#searchEV");
const buttonSubmit = document.querySelector('#submitBtn');
const inputValue = document.querySelector('#inputValue');
const inputValue1 = document.querySelector('#inputValue1');
const mapContainer = document.getElementById("mapID");
const markerButton = document.querySelector('#delMark');
const addressListWrapper = document.querySelector('.address-list-wrapper');
const modalElement = document.getElementById('modal-popup');

// Set markers to initially be an empty array
let markers = [];
let chargeStationData = [];

// notificationMessage accepts two arguments, message and style.
const notificationMessage = (message, styles) => {
  // Sets the text content to the user's message
  notificationEl.textContent = message;

  // styles is passed as a javascript object. Object.entries collects styles into an array
  for (const [property, value] of Object.entries(styles)) {
    // taking the property [key] and the value, each are used to stage notificationEl
    notificationEl.style[property] = value;
  };

  // Add a blinking effect
  notificationEl.classList.add('blinkingEffect');

  // Display notification container
  notificationEl.style.display = 'block';

  // Set a timeout to hide the notification after 3000 miliseconds
  setTimeout(() => {
    notificationEl.style.display = 'none';
  }, 3000); 
};

// Initialize the OpenStreetMap
const initializeMap = () => {
  // Initialize the map with default view and attribution
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  mymap = L.map(mapContainer).setView([37.09024, -95.712891], 4);
  tiles = L.tileLayer(tileURL, { attribution }).addTo(mymap);

  // Initialize marker as null
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
  // Remove each marker from the map
  markers.forEach(marker => {
    mymap.removeLayer(marker);
  });

  // Clear the markers array
  markers = [];

  // Set addressList to an empty string
  let addressList = "";

  // Populating wrapper with collected list items
  addressListWrapper.innerHTML = addressList;

  notificationMessage("Map reset: All markers have been successfully cleared", {color: 'hsl(0, 0%, 100%))', backgroundColor: 'hsl(348, 100%, 61%)'});

  // Reset the map view
  resetMapView();
};

// Resets the map back to original view
const resetMapView = () => {
  mymap.flyTo([37.09024, -95.712891], 4);
};

// Create a marker at the given coordinates with a popup text
const createMarker = (coordinates, popupText) => {
  // Create a marker with the specified coordinates and popup text
  const marker = L.marker(coordinates, { icon: myIcon }).addTo(mymap);
  marker.bindPopup(popupText);

  // Add the marker to the markers array.
  markers.push(marker);
}

const showError = (error) => {
  notificationEl.innerHTML = `<p>${error.message}</p><br>Just Enter City and State</p>`;
};

// Wrap the geolocation method in a promise
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    //  retrieves the current position of the user
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

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

// Function to update button state
const updateButtonState = () => {
  const cityInputValue = inputValue.value.trim();
  
  if (cityInputValue !== '') {
    buttonSubmit.classList.remove('is-dark');
    buttonSubmit.disabled = false;
  } else {
    buttonSubmit.classList.add('is-dark');
    buttonSubmit.disabled = true;
  }
};

const resetModal = () => {
  // Reset input values
  inputValue1.value = '';
  inputValue.value = '';
  updateButtonState();
}

// Check if the key pressed is 'Enter'
const handleKeyDown = (event) => {
  const cityInputValue = inputValue.value.trim()

  if (cityInputValue == '') {
    return;
  } else if (cityInputValue !== '' && event.key === 'Enter') {
    // Run the search method and reset the modal
    searchValidation();
    resetModal();

    // Deactivate the modal status
    modalElement.classList.remove('is-active');
  };
};

const searchValidation = () => {
  const stateInput = inputValue1.value;
  const cityInput = inputValue.value.trim();

  // Check if state input is valid
  if (!isValidState(stateInput)) {
    notificationEl.innerHTML = "<p>Please input a valid state.</p>";
    return;
  }
  
  // Check if city input is valid
  if (!isValidCity(cityInput)) {
    notificationEl.innerHTML = "<p>Please input a valid city.</p>";
    return;
  }

  // If both state and city inputs are valid, proceed to fetchLocationData()
  fetchLocationData();

  // Reset input values
  resetModal();
};

// getGeoLocation collects users current coordinates and uses the lat and long to gather station locations
const getGeoLocation = async () => {
  try {
    // Check if browser supports Geolocation
    if (!('geolocation' in navigator)) {
      throw new Error("Browser doesn't support Geolocation");
    }

    // Retrieve current user position 
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;

    // Fetch reverse geocoding data using latitude and longitude
    const response = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`)
    const data = await response.json();
      
    // If successful, get charge stations near the location. 
    getChargeStation(data.lat, data.lon);
  } catch (error) {
    // Handle errors
    console.log('Error in getGeoLocation:' , error);
  };
};

// Activated when searchValidation accepts user input, fetches location coordinates 
const fetchLocationData = async () => {
  try {
    // Fetch the location of the user input
    const response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&city=${inputValue.value}&state=${inputValue1.value}&country=United States of America&format=json`)
    
    // Check if the response is successful
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    // Parse the response data
    const data = await response.json();

    // Check if any results were returned
    if (data.length === 0) {
      throw new Error('No results found');
    }

    // Extract latitude and longitude from the first result
    const [result] = data;
    
    // Pass the results to the getChargeStation method for processing
    getChargeStation(result.lat, result.lon);
  } catch (error) {
    // Handle any errors
    console.log('Error in fetchLocationData:', error);
  };
};

// Get charge stations near the specified location
const getChargeStation = async (latitude, longitude) => {
  try {
    removeMarkers();

    mymap.flyTo([latitude, longitude], 13)
    // Fetch charge station data using latitude and longitude
    const response = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&key=${OPENCHARGE_API_KEY}&latitude=${latitude}&longitude=${longitude}&countrycode=US&maxresults=20&compact=true&verbose=false`)

    // Check if response is successful
    if (!response.ok) {
      throw new Error('Failed to fetch charge-station data');
    }

    // Extract the data collected from the response
    const chargeStationData = await response.json();

    // Pass the collected data to populateMapWithChargeStations to process results
    notificationMessage('Search Successful!', {color: 'hsl(0, 0%, 100%))', backgroundColor: 'hsl(141, 71%, 48%)'});
    populateMapWithChargeStations(chargeStationData);
  } catch(error) {
    // Handle any errors
    console.log('Error in getChargeStations:', error);
  }
};

const populateMapWithChargeStations = (data) => {
  try {
    chargeStationData = data; 

    // Set addressList to an empty string
    let addressList = "";

    // Loop through each element in the 'data' array
    data.forEach((element, index) => {
      // Destructure relevant properties from 'AddressInfo' object
      const { Latitude, Longitude, AddressLine1, AccessComments } = element.AddressInfo;
      
      // Check if Latitude, Longitude, and AddressLine1 are truthy
      if (Latitude && Longitude && AddressLine1) {
        // Construct text for marker popup, include 'AccessComments' or 'Not Found' if unavailable
        const text = `Address is: ${AddressLine1}, Hours: ${AccessComments || 'Not Found'}`;

        // Create a marker at the given Latitude and Longitude with the constructed text
        createMarker([Latitude, Longitude], text);

        // Append an HTML list item containing the address to the 'addressList' string
        addressList += `<li class="cityVal m-1 pl-2 is-uppercase" data-index="${index}">${AddressLine1}</li>`;
      };
    });

    // Populating wrapper with collected list items
    addressListWrapper.innerHTML = addressList;

    // Add click event listeners to each address item
    document.querySelectorAll('.cityVal').forEach(address => {
      address.addEventListener('click', (event) => {
        // Collect the index of the clicked 'address' based on the data-index attribute
        const index = event.target.getAttribute('data-index');

        // Gather 'station' data from the index from chargeStationData
        const station = chargeStationData[index];

        if (station) {
          // If station data is found, move the map to the station
          moveToStation(station);
        } else {
          // Error log if nothing is found for the index.
          console.log( `No station data found for index: ${index}`);
        }
      });
    });

    console.log(markers);
  } catch (error) {
    // broadcast error message to console
    console.log('An error has occurred when handling charge station data:', error)
  }
};

// Function that locates and moves to a selected station and displays its details
const moveToStation = (station) => {
  const { Latitude, Longitude } = station.AddressInfo;

  // Move the map to the selected address
  mymap.flyTo([Latitude, Longitude], 15);

  // Find a marker in the 'markers' array based on its latitude and longitude coordinates
  // The 'find' method iterates over each marker in the array and returns the first marker that satisfies conditions
  // 'm.getLatLng()' retrieves the latitude and longitude of the current marker being evaluated
  // Both lat and lng are then checked if it matches the assigned Latitude and Longitude
  // If a matching marker is found, it is assigned to the 'marker' variable
  const marker = markers.find(m => m.getLatLng().lat === Latitude && m.getLatLng().lng === Longitude);

  // If markers exist
  if (marker) {
    // Set timed response to open station details
    setTimeout(() => {
      // leaflet.js method
      marker.openPopup();
    }, 300);
  } else {
    // Log errors
    console.error('No marker found at the coordinates!');
  }
};

updateButtonState();

// Event Listeners
buttonSubmit.addEventListener('click', () => searchValidation());
buttonSearchEV.addEventListener('click', () => getGeoLocation());
markerButton.addEventListener('click', () => removeMarkers());

// Attaching an event listener to the city input field to monitor changes
document.addEventListener('DOMContentLoaded', () => {
  inputValue.addEventListener('input', updateButtonState);
});

initializeMap();