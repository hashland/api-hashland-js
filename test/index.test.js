"use strict";

const assert = require('chai').assert,
    ApiClient = require('../index'),
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

});
