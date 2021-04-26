import React, { Component } from 'react';
import {Grid, Header, Card, Image, Placeholder, Segment} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import {capitalizeEachWord} from "../utilities"

/**
 * Produces a Card that displays the provided current temperature, feels like temperature,
 * weather name and weather image.
 * props : currentTemp   : Number
 *         feelsLikeTemp : Number
 *         weather       : Object, weather object from openweathermap ( For One Call API this is current.weather )
 */
export default class WeatherCard extends Component {
    constructor(props) {
        super(props);
        this.extractData = this.extractData.bind(this)
    }

    // Extracts data from props, called on non-loading render
    extractData () {
        this.currentTemp = this.props.currentTemp;
        this.feelsLikeTemp = this.props.feelsLikeTemp;
        this.weather = this.props.weather
    }

    render(){
        if(this.props.loading){
             return(
                 <Card>
                     <Segment loading>
                         <Placeholder>
                             <Placeholder.Image/>
                         </Placeholder>
                     </Segment>
                 </Card>
            )
        } else {
            this.extractData() // Get necessary information from props
            return (
                <Card raised color={"blue"}>
                    <Grid celled centered columns={2} padded={"vertically"} divided={"vertically"}>
                        <Grid.Column>
                        <Grid.Row>
                            <Grid.Column width={16}>
                                <Header as={"h4"}>
                                    Current Temp
                                </Header>
                            </Grid.Column>
                            <Grid.Column>
                                <Header style={{color: "black"}} as={"h1"}>
                                    {Math.round(this.currentTemp)} °F
                                </Header>
                            </Grid.Column>
                        </Grid.Row>
                            <br/>
                            <br/>
                        <Grid.Row>
                            <Grid.Column width={7}>
                                <Header as={"h4"}>
                                    Feels Like
                                </Header>
                            </Grid.Column>
                            <Grid.Column>
                                <Header style={{color: "black"}} as={"h1"}>
                                    {Math.round(this.feelsLikeTemp)} °F
                                </Header>
                            </Grid.Column>
                        </Grid.Row>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as={'h2'}>{capitalizeEachWord(this.weather[0].description)}</Header>
                            <Image size={"tiny"} src={"http://openweathermap.org/img/wn/" + this.weather[0].icon + "@2x.png"}/>
                        </Grid.Column>
                    </Grid>
                </Card>
            )
        }
    }
}