const axios = require('axios');

const launchesDB = require('./launches.mongo');
const planets = require('./planets.mongo')

// const launches = new Map()

const DEFAULT_FLIGHT_NUMBER = 100
// let lastestFlightNumber = 100

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches(){
    console.log('Downloading data...');

    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    if ( response.status !== 200 ) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed')
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload.customers
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            // target: launchDoc['no'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers,
        }
        // console.log(`${launch.flightNumber} ${launch.mission} `);

        await saveLaunch(launch);
    }
}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })

    // console.log(firstLaunch);
    if (firstLaunch.length !== 0) {
        console.log('Launch data already loaded');
    } else{
        // console.log('No se encontro');
        await populateLaunches()
    }


}

async function getLastFlightNumber() {
    const lastestLaunch = await launchesDB
        .findOne()
        .sort('-flightNumber')
    if (!lastestLaunch){
        return DEFAULT_FLIGHT_NUMBER
    }

    return lastestLaunch.flightNumber
}

async function findLaunch(filter){
    return await launchesDB.find(filter)
}

async function existLaunchWithId(launchId){
    return awaitfindLaunch({
        flightNumber: launchId,
    })
}

async function getAllLaunches(skip,limit) {
    // return Array.from(launches.values())
    return await launchesDB
        .find({},{ '__id': 0, '__v': 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {
    
    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch,{
        upsert: true
    })
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        'keplerName': launch.target
    })

    if (!planet){
        throw new Error('No matching planets found');
    }

    const newFlightNumber = await getLastFlightNumber() + 1
    const newLaunch = Object.assign(launch,{
        success: true,
        upcoming: true,
        customers: ['Zero to Maestry', 'NASA'],
        flightNumber: newFlightNumber  
    })

    await saveLaunch(newLaunch)

}

async function abortLaunchById(launchId){
    const aborted = await launchesDB.updateOne({
        flightNumber: launchId
    },{
        upcoming: false,
        success: false,
        // rocket: 'muaja'
    })
    console.log(aborted);
    return aborted.acknowledged === true && aborted.modifiedCount === 1;
}

module.exports = {
    existLaunchWithId,
    getAllLaunches,
    abortLaunchById,
    scheduleNewLaunch,
    loadLaunchData,
}