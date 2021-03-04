const express = require('express');
const axios = require('axios');
const router = express.Router();
const Trip = require('../models/trip');
const Electricvehicle = require('../models/electricvehicle');


router.post('/charge', async(req,res)=>{
    if(req.body.isTripActive){
        Trip.find({}, async (err, trip) => {
            if (trip.length !== 0) {
                await Schedule(trip[0].livecoordinates.latitude, trip[0].livecoordinates.longitude, req.body.vehicle, req, res);
            }
        })
    } else {
        await Schedule(req.body.latitude, req.body.longitude, req.body.vehicle, req, res);
    }
})

const Schedule = async (latitude, longitude, vehicleId, req, res) => {
    let data = {}
    range = req.body.range;
    var connectorSet = '';
    data['chargingModes'] = []
    Electricvehicle.findById(vehicleId, async (err, vehicle) => {
        if (!err) {
            if (vehicle.length !== 0) {
                for (let i = 0; i < vehicle.chargingModel.length; i++) {
                    let chargingConnections = []
                    chargingConnections.push({
                        facilityType: vehicle.chargingModel[i].facilityType,
                        plugType: vehicle.chargingModel[i].plugType
                    })
                    connectorSet = vehicle.chargingModel[i].plugType.split("_").join("") + ',';
                    data.chargingModes.push({
                        chargingConnections: chargingConnections,
                        chargingCurve: vehicle.chargingModel[i].chargingCurve
                    })
                }
                data = JSON.stringify(data);
                let _url = `https://api.tomtom.com/search/2/nearbySearch/.json?lat=${latitude}&lon=${longitude}&radius=${range}&limit=10&categorySet=7309&connectorSet=${connectorSet}&key=9oDdmG81fAuXae5sU2MLGMt1CAg2AVxR`
                var config = {
                    method: 'get',
                    url: _url,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                console.log(_url)
                await axios(config).then(async (response) => {
                    console.log({responseCount: response.data.summary.numResults});
                    if(response.data.summary.numResults === 0){
                        res.send({msg: 'No stations found in range'})
                    } else {
                        for(let i = 0;i < 10; i++){
                            const stationId = response.data.results[i].dataSources.chargingAvailability.id
                            console.log({id: response.data.results[i].dataSources.chargingAvailability.id});
                            let _url = `https://api.tomtom.com/search/2/chargingAvailability.json?key=9oDdmG81fAuXae5sU2MLGMt1CAg2AVxR&chargingAvailability=${stationId}&connectorSet=${connectorSet}`
                            var config = {
                                method: 'get',
                                url: _url,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            };
                            console.log(config);
                            await axios(config).then(async (responseAva) => {
                                console.log(responseAva.data.connectors.length);
                                for(let j = 0;j < responseAva.data.connectors.length; j++) {
                                    console.log({available: responseAva.data.connectors[j].availability.current.available})
                                    if(responseAva.data.connectors[j].availability.current.available > 0){
                                        let _url = `https://api.tomtom.com/routing/1/calculateLongDistanceEVRoute/${latitude},${longitude}:${response.data.results[i].position.lat},${response.data.results[i].position.lon}/json?avoid=unpavedRoads&vehicleEngineType=electric&constantSpeedConsumptionInkWhPerHundredkm=50.0,6.5:100.0,8.5&currentChargeInkWh=${vehicle.stateOfCharge}&maxChargeInkWh=${vehicle.maxCapacity}&minChargeAtDestinationInkWh=${vehicle.maxCapacity}&minChargeAtChargingStopsInkWh=1.5&key=9oDdmG81fAuXae5sU2MLGMt1CAg2AVxR`
                                        var config = {
                                            method: 'post',
                                            url: _url,
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            data: data
                                        };
                                        console.log(config);
                                        await axios(config).then(async (responseStation) => {
                                            res.send({
                                                msg: 'Free spots available',
                                                distance: responseStation.data.routes[0].summary.lengthInMeters,
                                                totalTimeInSeconds: responseStation.data.routes[0].summary.travelTimeInSeconds,
                                                trafficDelayInSeconds: responseStation.data.routes[0].summary.trafficDelayInSeconds,
                                                totalChargingTimeInSeconds: responseStation.data.routes[0].summary.totalChargingTimeInSeconds,
                                            })
                                        }).catch(function (error) {
                                            if(error.response)
                                                console.log(error.response);
                                            else
                                                console.log(error);
                                        });
                                    } else {
                                        let _url = `https://api.tomtom.com/routing/1/calculateLongDistanceEVRoute/${latitude},${longitude}:${response.data.results[i].position.lat},${response.data.results[i].position.lon}/json?avoid=unpavedRoads&vehicleEngineType=electric&constantSpeedConsumptionInkWhPerHundredkm=50.0,6.5:100.0,8.5&currentChargeInkWh=${vehicle.stateOfCharge}&maxChargeInkWh=${vehicle.maxCapacity}&minChargeAtDestinationInkWh=${vehicle.maxCapacity}&minChargeAtChargingStopsInkWh=1.5&key=9oDdmG81fAuXae5sU2MLGMt1CAg2AVxR`
                                        var config = {
                                            method: 'post',
                                            url: _url,
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            data: data
                                        };
                                        await axios(config).then(async (responseStation) => {
                                            console.log(responseStation.data);
                                            res.send({
                                                msg: 'Spot information unknown',
                                                distance: responseStation.data.routes[0].summary.lengthInMeters,
                                                totalTimeInSeconds: responseStation.data.routes[0].summary.travelTimeInSeconds,
                                                trafficDelayInSeconds: responseStation.data.routes[0].summary.trafficDelayInSeconds,
                                                totalChargingTimeInSeconds: responseStation.data.routes[0].summary.totalChargingTimeInSeconds,
                                            })
                                        }).catch(function (error) {
                                            if(error.response)
                                                console.log(error.response);
                                            else
                                                console.log(error);
                                        });
                                    }
                                }
                            }).catch(function (error) {
                                if(error.response)
                                    console.log(error.response);
                                else
                                    console.log(error);
                            });
                        }
                    }
                }).catch(function (error) {
                    if(error.response)
                        console.log(error.response);
                    else
                        console.log(error);
                });
            }
        }
    })
}

module.exports = router;