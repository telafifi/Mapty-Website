'use strict';

// create objects that hold items from the HTML
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


/**
 * This is the main class to run the application and host all required event listeners
 * 
 */
class App {

    //Class Variables
    #map; //# is a private field
    #mapEvent;
    #mapZoomLevel = 13;
    #workouts = [];
    constructor() {
        //Get users position
        this._getPosition(); //get the position when constructed

        // Get data from local storage
        this._getLocalStorage();

        //Attach event handlers
        //Add listener to form object to add a marker when enter is clicked
        form.addEventListener('submit', this._newWorkout.bind(this)); //bind the this keyword on the function call so that next function has a defined this keyword

        // Update differences between running and cycling
        inputType.addEventListener('change', this._toggleElevationField);

        //Add event listener to move the map on event click
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel); //L is namespace leaflet gives us. L.map maps it to the coordinates shown

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { //map is created by small layers from openstreetmap
            attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        

        //Add event listener to map object to allow for adding markers on geolocations clicked - Handling clicks on map
        this.#map.on('click', this._showForm.bind(this));

        // Load the markers from the local storage
        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        });
    }

    _showForm(mapE){
        /*
        * Handling clicks on map
        */
        this.#mapEvent = mapE;
        form.classList.remove('hidden'); //show the input form on click of map
        inputDistance.focus(); //add focus (which is focusing on a specific element) to the distance input textbox
    }

    _hideForm() {
        /**
         * Hide the form after inserting a new workout to the list
         */
        //Clear input fields
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000);
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

        //define a function to check if an undefined number of inputs are finite numbers. Returns true is all inputs are finitie numbers
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp)); 

        //define a function to check if an undefined number of inputs are all positive numbers
        const allPositiveInputs = (...inputs) => inputs.every(inp => inp > 0);

        // Get data from the form
        const type = inputType.value; //get value of input type - running vs cycling
        const distance = +inputDistance.value; //+ converts the string to a number
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng; //get latitude and longitude location of click
        let workout;

        // If workout is running, create Running Object
        if (type === 'running') {
            const cadence = +inputCadence.value;
            // Check if the data is valid
            if (!validInputs(distance, duration, cadence) || !allPositiveInputs(distance, duration, cadence))
                return alert('Inputs have to be positive numbers!');

            //Create new workout object
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        // If workout is cycling, create Cycling Object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            // Check if the data is valid
            if (!validInputs(distance, duration, elevation) || !allPositiveInputs(distance, duration)) //elevation is allowed to be negative
                return alert('Inputs have to be positive numbers!');
            
            //Create new workout object
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // Add new object to workout array
        this.#workouts.push(workout);

        // Render workout on map as marker
        this._renderWorkoutMarker(workout);

        // Render workout on list
        this._renderWorkout(workout);

        // Hide form and clear input field
        this._hideForm();

        // Set local storage to all workouts
        this._setLocalStorage();
    }

    _renderWorkoutMarker(workout) {
        /**
         * Render the marker of the workout being added onto the map
         */
        L.marker(workout.coords) //add a marker to the leaflet map
            .addTo(this.#map) //select the object to add it to
            .bindPopup(L.popup({ //from documentation get properties to set for each click
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup` //string literal to take the type of action and assign the appropriate class

            })) //message that comes with it
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`) //set information in the popup window based on type of workout
            .openPopup(); //show the popup
    }

    _renderWorkout(workout) {
        /**
         * Render the workout as a list on the webpage
         */

        //General HTMl for both workouts
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
            <span class="workout__icon">${
                workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
        </div>
        `

        //Additional html if it is a running workout
        if (workout.type === 'running')
            html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`

        //Additional html if it is a cycling workout
        if (workout.type === 'cycling')
            html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      </ul>`

      form.insertAdjacentHTML('afterend', html);  //insert the html in the form at the end to show list
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout'); //e.target is the element that is clicked - get the closest html element that has the class of workout

        if (!workoutEl) return; //return the function if clicked on the form but not on an actual workout

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);

        //Move the map to the coordinates of the workout
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });

    }

    _setLocalStorage() {
        /**
         * Utilize the browser local storage function to hold the value of the workouts created previously
         */

        //Should not use local storage to store a large amount of data because it will make the browser run slowly
        localStorage.setItem('workouts', JSON.stringify(this.#workouts)); //JSON stringify takes an object and converts it to a string
    }

    _getLocalStorage() {
        /**
         * Get all objects in local storage and render them on page load
         */

        //get the workout object in local storage and parse the JSON data stored
        const data = JSON.parse(localStorage.getItem('workouts')); 

        if (!data) return; //return if there is no data

        this.#workouts = data; //set the workout array to the data parsed

        //render each workout in the array
        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        }); 
    }

    reset() {
        /**
         * Reload the page and remove any previously created data
         */
        localStorage.removeItem('workouts'); //remove data from local storage
        location.reload(); //refresh the page
    }
}

const app = new App(); //Instantiate the application object






