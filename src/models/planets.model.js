const fs = require('fs')
const path = require('path');
const parse = require('csv-parse');

const planets = require('./planets.mongo');

// const habitablePlanets = []

function loadPlanetsData() {
    return new Promise ((resolve, reject) => {
        fs.createReadStream(path.join(__dirname,'..','..','data','Kepler_data.csv'))
        .pipe(parse.parse({
          comment: '#',
          columns: true  
        }))
        .on('data', async (data) => {
          if (isHabitablePlanet(data)) {
              // habitablePlanets.push(data)
              //  TODO
              savePlanet(data)
          }
        })
        .on('error', (err) => {
          console.log(err);
          reject(err);
        })
        .on('end', async () => {
          const countPlanetsFound = ( await getAllPlanets()).length;
          console.log(`${countPlanetsFound} habitable planets found!`);
          resolve();
        })
    });
}

async function getAllPlanets(){
  return await planets.find({},{
    '__id': 0, '__v': 0
  });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name
    },{
      keplerName: planet.kepler_name
    },{
      upsert: true
    })
  } catch (error) {
    console.error(`Could not save the planet ${error}`);
  }
}

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
            && planet['koi_insol'] > 0.36
            && planet['koi_insol'] < 1.11 
            && planet['koi_prad'] < 1.6 ;
} 



module.exports = {
  loadPlanetsData,
  getAllPlanets,
}