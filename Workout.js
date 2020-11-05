'use strict';

class Workout {
    date = new Date(); //date of log - get current date
    id = (Date.now() + '').slice(-10); //unique identifier - typically use a GUID
    clicks = 0;

    /**
     * Parent class that holds common properties to all workouts
     * @param {*} coords Coordinates of workout
     * @param {*} distance Distance traveled in kilometers
     * @param {*} duration Duration of workout in minutes
     */
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance; //in km
        this.duration = duration; //in minutes
    }

    /**
     * Set the description of workout
     */
    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; //prettier-ignore tells the pretier function to ignore the next line
        //Create the description for each object
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }

    /***
     * Increase the number of clicks associated with the workout
     */
    click() {
        this.clicks++;
    }
}

class Running extends Workout {
    type = 'running';
    /**
     * Child class that inherits from Workout to record a run
     * @param {*} coords Coordinates of workout
     * @param {*} distance Distance traveled in kilometers
     * @param {*} duration Duration of workout in minutes
     * @param {*} cadence Holds the cadence of the workout
     */
    constructor(coords, distance, duration, cadence) {
        super (coords, distance, duration);
        this.cadence = cadence;
        this._calcPace();
        this._setDescription();
    }

    /**
     * Calculate pace associated with the workout in min/km
     */
    _calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    /**
     * Child class that inherits from Workout to record a cycle
     * @param {*} coords Coordinates of workout
     * @param {*} distance Distance traveled in kilometers
     * @param {*} duration Duration of workout in minutes
     * @param {*} elevationGain Elevation gain associated with the workout
     */
    constructor(coords, distance, duration, elevationGain) {
        super (coords, distance, duration);
        this.elevationGain = elevationGain;
        this._calcSpeed();
        this._setDescription();
    }

    /**
     * Calculate speed associated with the workout in km / hr
     */
    _calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}