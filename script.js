'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// create objects that hold items from the HTML
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const run1 = new Running([39, -12], 5.2, 24, 178);
console.log(run1.pace);

/**
 * This is the main class to run the application and host all required event listeners
 * 
 */
class App {

    //Class Variables
    #map; //# is a private field
    #mapEvent;
    constructor() {
        this._getPosition(); //get the position when constructed

        //Add listener to form object to add a marker when enter is clicked
        form.addEventListener('submit', this._newWorkout.bind(this)); //bind the this keyword on the function call so that next function has a defined this keyword

        // Update differences between running and cycling
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition(){
        /*
        * Geolocation API
        * On page load we want the website to get the current location and of person running the site and display a map from leaflet API at current location
        */
        if (navigator.geolocation){ //get current location the website is running from
            navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this), //success function to run after recieving position - bind the this keyword on the function call so that next function has a defined this keyword
            function(){ //false function to alert user that the site could not gain position
                alert('Could not get your position!');
            }); 
        };
    }

    _loadMap(position) {
        /*
        * Load the map on the specific position of the user
        */
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`); //link to google maps to center on current location

        const coords = [latitude, longitude]; //current location coordinates

        //Displaying a map on a site using a 3rd party library called leaflet
        this.#map = L.map('map').setView(coords, 13); //L is namespace leaflet gives us. L.map maps it to the coordinates shown

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { //map is created by small layers from openstreetmap
            attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        

        //Add event listener to map object to allow for adding markers on geolocations clicked - Handling clicks on map
        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE){
        /*
        * Handling clicks on map
        */
        this.#mapEvent = mapE;
        form.classList.remove('hidden'); //show the input form on click of map
        inputDistance.focus(); //add focus (which is focusing on a specific element) to the distance input textbox
    }

    _toggleElevationField() {
        /*
        * closest finds the closest parent of the object in html, then we find the classlist and toggle the hidden style 
        * (since they initially started as opposites they will always remain opposites)
        */
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        /*
         * Mark a new workout on the map using the coordinates of the user click 
         */
        e.preventDefault(); //prevent default location

        //Clear input fields
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';

        //Display marker
        const {lat, lng} = this.#mapEvent.latlng; //get latitude and longitude location of click

        L.marker([lat, lng]) //add a marker to the leaflet map
            .addTo(this.#map) //select the object to add it to
            .bindPopup(L.popup({ //from documentation get properties to set for each click
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup'

            })) //message that comes with it
            .setPopupContent('Workout') //set information in the popup window
            .openPopup(); //show the popup
    }
}

const app = new App(); //Instantiate the application object






