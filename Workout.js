'use strict';

class Workout {
    date = new Date(); //date of log - get current date
    id = (Date.now() + '').slice(-10); //unique identifier - typically use a GUID

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
}

class Running extends Workout {
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
        this.calcPace();
    }

    /**
     * Calculate pace associated with the workout in min/km
     */
    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
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
        this.calcSpeed();
    }

    /**
     * Calculate speed associated with the workout in km / hr
     */
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}