"use strict";

const assert = require('chai').assert,
    ApiClient = require('../index'),
    API_KEY = process.env.API_KEY,
    testEndpoint = 'https://hashland.de/api';


describe('ApiClient', () => {

    it('fail login with bad credentials', (done) => {
        const api = new ApiClient(testEndpoint);

        api.login("test", "test").then((token) => {
            done("Login was success but should have raised an exception");

        }).catch(e => {
            assert.include(e, {code: 401}, 'Error Response contains code 401')
            done();

        });
    });

    it('should return a list of miners', (done) => {
        const api = new ApiClient(testEndpoint, API_KEY);

        api.getMiners().then(miners => {
            console.log(miners);
            assert.isNotEmpty(miners, 'Miners should not be empty');
            done();

        }).catch(e => {
            done(e);
        });
    });

});
