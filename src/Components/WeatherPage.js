import React, { Component } from 'react'
import WeatherCard from "./WeatherCard";
import { Container, Grid, Button, Dropdown } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'

import { API_KEY } from "../secrets";

const ONE_CALL_URL  = "https://api.openweathermap.org/data/2.5/onecall"
const DEFAULT_UNITS = "imperial" // [standard, metric, imperial]

const locationLookup = {
    "New Berlin" : {
        "latitude"  :  42.992,
        "longitude" : -88.111
    },
    "Cleveland" : {
        "latitude"  :  41.434,
        "longitude" : -88.641
    },
    "Las Vegas" : {
        "latitude"  :   36.052,
        "longitude" : -115.025
    }
}

export default class WeatherPage extends Component{
    constructor(props){
        super(props);
        this.state={
            "latitude"    : null,
            "longitude"   : null,
            "weatherData" : null
        };

        this.locationDropdownOptions = [
            {
                key: "My Location",
                text: "My Location",
                value: "My Location",
                icon: {name: "location arrow"}
            },
            {
                key: "New Berlin",
                text: "New Berlin",
                value: "New Berlin"
            },
            {
                key: "Cleveland",
                text: "Cleveland",
                value: "Cleveland"
            },
            {
                key: "Las Vegas",
                text: "Las Vegas",
                value: "Las Vegas"
            }
        ]

        this.userInputCoords          = this.userInputCoords.bind(this);
        this.updateCoords             = this.updateCoords.bind(this);
        this.createOneCallQueryString = this.createOneCallQueryString.bind(this);
        this.sendXHRRequest           = this.sendXHRRequest.bind(this);
        this.doOneCallQuery           = this.doOneCallQuery.bind(this);
        this.locationDropdownOnChange = this.locationDropdownOnChange.bind(this);
    }

    // Updates the position if valid
    updateCoords(lat, lon) {
        if(typeof(lat) === "number" && typeof(lon) === "number" &&
            lat <= 90  && lat >= -90 &&
            lon <= 180 && lon >= -180) {
            this.setState({
                "latitude": lat,
                "longitude": lon
            }, () => {
                this.doOneCallQuery(); // When coords are updated, redo query with new coords
            })
        }
    }

    // Gets the user's coords via location services
    getUserLocation(){
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                (position) => this.updateCoords(position.coords.latitude, position.coords.longitude),
                () => {console.error("Error: Couldn't get user location.")}
            )
        }
    }

    // Called when a different location is selected from the dropdown
    locationDropdownOnChange(event, data) {
        if(data.value === "My Location"){
            this.getUserLocation();
        } else {
            let { latitude, longitude } = locationLookup[data.value];
            this.updateCoords(latitude, longitude)
        }
    }

    // Builds and sends query and then updates the state
    doOneCallQuery(){
        if(!(this.state.latitude && this.state.longitude)){
            // latitude and longitude not set, wait and try again
            setTimeout(this.doOneCallQuery, 500);
        } else {
            let queryString = this.createOneCallQueryString(this.state.latitude, this.state.longitude, API_KEY, ["hourly", "minutely", "daily", "alerts"], DEFAULT_UNITS);
            this.sendXHRRequest(queryString, (data) => {this.setState({"weatherData" : data})});
        }
    }

    // Gets coords from user using prompts
    userInputCoords() {
        let lat = parseFloat(prompt("Enter latitude:"));
        let lon = parseFloat(prompt("Enter longitude:"));
        this.updateCoords(lat, lon)
    }

    /**
     * Builds a query string for OpenWeather's One Call API
     * @param latitude : Number, -90 <= latitude  <= 90
     * @param longitude : Number, -180 <= longitude <= 180
     * @param key : String, API key
     * @param excludes : String[], List of fields to exclude from query. Nullable for no exclusion
     *                   Possible: [current, minutely, hourly, daily, alerts]
     * @param units : String, Type of units to receive data in
     */
    createOneCallQueryString(latitude, longitude, key, excludes, units){
        // Ensure necessary fields are present to build query
        if(latitude && longitude && key) {
            let queryString = "";
            queryString += ONE_CALL_URL + "?lat=" + latitude + "&lon=" + longitude;
            // If excludes list is specified, add them to the query
            if (excludes) {
                queryString += "&exclude=";
                for (let i = 0; i < excludes.length; i++) {
                    queryString += excludes[i];
                    queryString += ",";
                }
                queryString = queryString.slice(0, -1); // Remove last comma
            }
            queryString += "&appid=" + key;
            queryString += "&units=" + units;
            return queryString;
        }
    }

    /**
     * Sends an XMLHttpRequest
     * @param requestURL : String, URL to query
     * @param successCallback : function, handle JSON response from successful query
     */
    sendXHRRequest(requestURL, successCallback){
        let xhr = new XMLHttpRequest();
        xhr.open('GET', requestURL, true);
        xhr.onload = () => {
            let response = JSON.parse(xhr.responseText);
            if(xhr.readyState === 4 && xhr.status === 200){
                // Request is done and status is OK
                successCallback(response)
            } else if (xhr.readyState === 4 && xhr.status !== 200){
                console.error("Response Error:")
                console.dir(response)
            }
        }
        xhr.send(null);
    }

    render(){
        return (
            <Container>
                <br/>
                <Grid>
                    <Grid.Row >
                        {this.state.weatherData !== null ? (
                            <WeatherCard
                                currentTemp={this.state.weatherData.current.temp}
                                feelsLikeTemp={this.state.weatherData.current.feels_like}
                                weather={this.state.weatherData.current.weather}
                            />
                        ) : (
                           <WeatherCard loading={true}/>
                        )
                        }
                    </Grid.Row>
                    <br/>
                    <Grid.Row>
                        <Dropdown
                            selection
                            text={"Location"}
                            options={this.locationDropdownOptions}
                            onChange={(event, data) => this.locationDropdownOnChange(event, data)}
                        />
                        <Button onClick={this.userInputCoords}>Custom Coords</Button>
                    </Grid.Row>
                </Grid>
            </Container>
        )
    }
}