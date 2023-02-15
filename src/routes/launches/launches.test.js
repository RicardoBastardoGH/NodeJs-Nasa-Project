// const { describe } = require('pm2');
const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
    beforeAll( async () => {
        await mongoConnect();
    });

    afterAll( async () => {
        await mongoDisconnect();
    })
    
    describe('Test GET /launches', () => {
        test('It should response with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/) // or string
                .expect(200)
        })
    })

    describe('Tests POST /launches', () => {
        
        const completeLaunchData = {
            mission:'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'January 4,2028'
        }
        const launchDataWithoutDate = {
            mission:'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
        }
        const launchDataWithInvalidDate = {
            mission:'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'Zoot'
        }
        
        test('It should response with 201 created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/) // or string
                .expect(201)

            const requestDate = new Date( completeLaunchData.launchDate ).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toBe(requestDate)


            expect(response.body).toMatchObject(launchDataWithoutDate);
        });

        test('Ts should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/) // or string
                .expect(400)
                
            expect(response.body).toStrictEqual({
                error: 'Missing required launch properties'
            })
        })
        test('Ts should catch invalid dates', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithInvalidDate)
            .expect('Content-Type', /json/) // or string
            .expect(400)
            
            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            })
            
        })
    })
})
