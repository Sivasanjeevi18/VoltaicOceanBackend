const express = require('express');
const axios = require('axios');
const Trip = require('../models/trip');
const Electricvehicle = require('../models/electricvehicle');
const ObjectId = require('mongoose').Types.ObjectId;
const userprefs = require('../models/userprefs');

const router = express.Router();

router.post('/', async (req, res) => {
    if (!ObjectId.isValid(req.body.user) || !ObjectId.isValid(req.body.vehicle))
        return res.status(400).send(`failed to decode ID`);
    Trip.find({}, async (err, trip) => {
        if (trip.length !== 0) {
            calculateRemainingCharge(trip[0], req.body.vehicle, req, res);
        }
    })
})

const calculateRemainingCharge = async (trip, vehicleId, req, res) => {
    let data = {}
    data['chargingModes'] = []
    Electricvehicle.findById(vehicleId, (err, vehicle) => {
        if (!err) {
            if (vehicle.length !== 0) {
                for (let i = 0; i < vehicle.chargingModel.length; i++) {
                    let chargingConnections = []
                    chargingConnections.push({
                        facilityType: vehicle.chargingModel[i].facilityType,
                        plugType: vehicle.chargingModel[i].plugType
                    })
                    data.chargingModes.push({
                        chargingConnections: chargingConnections,
                        chargingCurve: vehicle.chargingModel[i].chargingCurve
                    })
                }
                data = JSON.stringify(data);
                let _url = 'https://api.tomtom.com/routing/1/calculateLongDistanceEVRoute/' + trip.livecoordinates.latitude + ',' + trip.livecoordinates.longitude + ':' + trip.destinationcoordinates.latitude + ',' + trip.destinationcoordinates.longitude + '/json?vehicleEngineType=electric&currentChargeInkWh=' + vehicle.stateOfCharge + '&maxChargeInkWh=' + vehicle.maxCapacity + '&minChargeAtChargingStopsInkWh=4&minChargeAtDestinationInkWh=4&constantSpeedConsumptionInkWhPerHundredkm=32,10.87:77,18.01&key=Kdoprc6sNSfWsEF9AYGIGpTNhl1VwZLy'
                var config = {
                    method: 'post',
                    url: _url,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data
                };
                axios(config).then(async (response) => {
                    console.log(response.data.routes[0].summary.remainingChargeAtArrivalInkWh);
                    let = remainingChargeAtArrival = response.data.routes[0].summary.remainingChargeAtArrivalInkWh
                    userpref = await userprefs.find({ user: req.body.user });
                    if (remainingChargeAtArrival > userpref.batteryDepletionThreshold) {
                        res.JSON({ msg: 'Recomend Discharging' })
                    } else {
                        res.JSON({ msg: 'Recomend Charging' })
                    }
                }).catch(function (error) {
                    res.JSON({err: error})
                    console.log(error.response);
                });
            }
        }
    })
}

router.post('/v2', async (req,res)=>{
    if (!ObjectId.isValid(req.body.user) || !ObjectId.isValid(req.body.vehicle))
        return res.status(400).send(`failed to decode ID`);
    Trip.find({}, async (err, trip) => {
        if (trip.length !== 0) {
            calculateDistance(trip[0], req.body.vehicle, req, res);
        }
    })
})

const calculateDistance = async (trip, vehicleId, req, res) => {
    Electricvehicle.findById(vehicleId, (err, vehicle) => {
        let _url = 'https://api.tomtom.com/routing/1/calculateRoute/' + trip.livecoordinates.latitude + ',' + trip.livecoordinates.longitude + ':' + trip.destinationcoordinates.latitude + ',' + trip.destinationcoordinates.longitude + '/json?routeType=eco&traffic=true&travelMode=car&vehicleMaxSpeed='+ 100 + '&vehicleEngineType=electric&key=Kdoprc6sNSfWsEF9AYGIGpTNhl1VwZLy'
        var config = {
            method: 'get',
            url: _url,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        axios(config).then(async (response) => {
            console.log(response.data.routes[0].summary.lengthInMeters);
            var tripDist = response.data.routes[0].summary.lengthInMeters;
            var SOCTrip = 1.8 * (tripDist / 250000) //maxRange
            userpref = await userprefs.find({ user: req.body.user });
            if(vehicle.stateOfCharge > SOCTrip + 4.8){
                res.send({msg: 'Recommend Disharging', charge: vehicle.stateOfCharge - SOCTrip + 4.8})
            } else if(vehicle.stateOfCharge < SOCTrip + 4.8){
                res.send({msg: 'Recommend Charging', charge: SOCTrip + 4.8 - vehicle.stateOfCharge})
            }
        }).catch(function (error) {
            if(error.response)
                console.log(error.response);
            else
                console.log(error);
        });
    })
}


module.exports = router;