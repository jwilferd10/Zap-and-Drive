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
let marker
const notificationEl = document.querySelector('.notification');

// Initialize the map
const initializeMap = () => {
  map = L.map('mapID').setView([37.09024,-95.712891], 3);
  const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(tileURL, { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
  tiles.addTo(map);
}

function removeLayer () {
  
  // mymap.remove(marker);
  // mymap.closePopup();
  
  if (marker !== null) {
    mymap.remove(marker);
    mymap.closePopup ();
   
  }
  mymap = L.map('mapID').setView([37.09024,-95.712891], 3)
  attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
 tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; 
 tiles = L.tileLayer(tileURL, {attribution});

tiles.addTo(mymap);
  //marker.remove (mymap);
  //mymap.closePopup ();
}
//Setting up the marker
var myIcon = L.icon({
  iconUrl: './img/zap.png',
  iconSize: [50, 50],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
  
});

//Getting user geolocation function
function getexactLocation() {

  if ('geolocation' in navigator) {
    console.log('geolocation available');
    navigator.geolocation.getCurrentPosition(setPosition, showError);
  } else {
    console.log('geolocation not available')
    notificationEl.innerHTML = "<p>Browser doesn't support Geolocation</p>";
  }
}

//Setting user exact location position

function setPosition(position) {


  console.log(position);

  latitude = position.coords.latitude;
  longitude = position.coords.longitude;

  getGeoLocation(latitude, longitude)

}

function showError(error) {
  
  notificationEl.innerHTML = `<p> ${error.message}</p> <br> Just Enter City and State</p>`;
  document.getElementById("userInput")

}

function getGeoLocation(latitude, longitude) {

  fetch('https://us1.locationiq.com/v1/reverse.php?key=be7dfdc7a8184f&lat=' + latitude + '&lon=' + longitude + '&format=json')

    .then(response => response.json())
    
    .then(data => {
      console.log(data);
      var newCity = cityTwo.innerHTML = data.address.city;
      city.innerHTML = data.display_name;
      var loc_lat = latitude1.innerHTML = data.lat;
      var loc_lon = longitude1.innerHTML = data.lon;
      
      localStorage.setItem  ('city' ,newCity);
      localStorage.getItem(newCity);
      getChargeStation(loc_lat, loc_lon)

      console.log("returning from getgeolocation function");
      //console.log(ret_lat);
      console.log("done");
      return (data);

    })

    .catch(error => console.log('error', error));

  //return(ret_lat);

}

function ValidState(sstate) {

  sstates = "wa|or|ca|ak|nv|id|ut|az|hi|mt|wy" +

    "co|nm|nd|sd|ne|ks|ok|tx|mn|ia|mo" +

    "ar|la|wi|il|ms|mi|in|ky|tn|al|fl" +

    "ga|sc|nc|oh|wv|va|pa|ny|vt|me|nh" +

    "ma|ri|ct|nj|de|md|dc";

  if (sstates.indexOf(sstate.toLowerCase() + "|") > -1) {

    return true;

  }

  return false;

}

function allLetter(inputtxt) {
  var letters = /^[A-Za-z]+$/;

  if (inputtxt.value.match(letters)) {
    return true;
  } else {
    alert("message");
    return false;
  }
}

function getLocation() {

  fetch('https://us1.locationiq.com/v1/search.php?key=be7dfdc7a8184f&city=' + input.value + '&state=' + input1.value + '&country=United States of America&format=json')

  .then(response => response.json())

  .then(data => {
    console.log(data);
    var my_lat = cityOne.innerHTML = data[0]['lat'];
    var my_lang = cityTwo.innerHTML = data[0]['lon'];
    console.log("I am here");
    getChargeStation(my_lat, my_lang);
    //console.log (ret_val);
  })

  .catch(err => alert("Wrong City"))

}

//Get charging station based on user location 

function getChargeStation(m_lat, m_lan) {

  console.log("Inside getcharge")
  
  var state = document.querySelector('.title1');
  var html = "";
  var newLatitude = m_lat;
  var newLongitude = m_lan;

  fetch('https://api.openchargemap.io/v3/poi/?output=json&latitude=' + newLatitude + '&longitude=' + newLongitude +'&countrycode=US&maxresults=20&compact=true&verbose=false')
    .then(response => {

      //console.log(response.json());
      console.log("end of getcharge");
      return response.json();

    })

    .then(data => {
      console.log(data)

      var my_index = 0;
      var my_address = "";
      data.forEach(element => {
        console.log(my_index);

        console.log("My Address:" + my_address);
        console.log("Element Address:" + element.AddressInfo.AddressLine1);

        if (my_address != element.AddressInfo.AddressLine1) {

          console.log(element);
          let cityVal = element.AddressInfo.AddressLine1;
          html += `<li>${cityVal}</li>`;
          state.innerHTML = html;
          document.getElementById("notify");

        }

        my_address = element.AddressInfo.AddressLine1;
        my_index++;

      })
      //Getting Data on Click event
      
document.getElementById('clickItems').addEventListener("click",listItemText);
var clickCity = "";
function listItemText(event) {
  var liClicked = event.target;
  if(liClicked.nodeName == "LI"){
     clickCity = liClicked.textContent     
      getEVMap(clickCity);
    }
  }
  
function getEVMap() {
  removeLayer();
  var clickLat ="";
  var clickLng = "";
  console.log (clickLat,clickLng );
  for (element of data) {
    console.log(clickLat, clickLng);
  
    clickLat = element.AddressInfo.Latitude;
    clickLng = element.AddressInfo.Longitude;
    
    var cityEVList = element.AddressInfo.AddressLine1;
    var cityDesc = element.AddressInfo.AccessComments;
    
    marker = L.marker([clickLat, clickLng],{icon: myIcon}).addTo(mymap);
    var text = `Address is: ${cityEVList}, Hours: ${cityDesc}`;
    
    marker.bindPopup(text);
  };
   
}


})

.catch(error => console.log('error', error))
}

const searchValidation = () => {
  console.log("input value:" + input1.value);
  removeLayer();
  var stateInput = input1.value;
  localStorage.setItem  ('State' ,stateInput);
  localStorage.getItem(input1);

  //var letters = /^[A-Za-z]+$/;
  var cityRegex = /^[a-zA-z] ?([a-zA-z]|[a-zA-z] )*[a-zA-z]$/;

  if (!(ValidState(input1.value))) {

    document.getElementById("notify")
    notificationEl.innerHTML = "<p>Please input valid State!!!</p>"
  } else {
    notificationEl.innerHTML = "<p>Valid State Entered</p>"
  }

  if (!(input.value.match(cityRegex)) || input1.value == "") {
    console.log("Please input valid city!!");
    document.getElementById("notify")
    notificationEl.innerHTML = "<p>Please input valid city!!!</p>"

  }

  if (input.value === "" || input1.value === "") {

  } else {
    getLocation();
  }
};

// Event Listeners
document.querySelector('#searchEV').addEventListener('click', getexactLocation);
document.querySelector('#submitBtn').addEventListener('click', getexactLocation);
document.querySelector('#deleteMarker').addEventListener('click', removeLayer);