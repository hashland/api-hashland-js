"use strict";

const {inflateMiners, inflateRacks, inflateSensors, inflateFans, inflatePdus, inflatePduTypes} = require('./lib/inflators'),
    fetch = typeof window !== 'undefined' && window.fetch ? window.fetch : require('node-fetch');

class ApiClient {
    constructor(endPoint, token) {
        this.endPoint = endPoint;
        this.session = null;
        this.token = token;
    }

    JSONRequest(method, resource, data) {
        return new Promise((resolve, reject) => {

            let headers = {'Content-Type': 'application/json'};

            if (this.token) {
                headers['Authorization'] = 'Bearer ' + this.token;
            }

            fetch(`${this.endPoint}/${resource}`, {
                method: method,
                body: data ? JSON.stringify(data) : null,
                headers: headers,

            }).then((res) => {
                res.text().then((text) => {

                    try {
                        const json = JSON.parse(text);

                        if (res.status != 200) {
                            json.httpStatus = res.status;
                            reject(json);

                        } else {
                            resolve(json);
                        }


                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
    }

    /**
     * Tries to login with the given credentials. If successful the jwt token will be returned.
     * @param username
     * @param password
     * @returns {Promise<boolean>}
     */
    async login(username, password) {
        const res = await this.JSONRequest('POST', 'login_check',
            {
                '_username': username,
                '_password': password
            });

        this.token = res.token;
        return res.token;
    }

    async getMe() {
        const res = await this.JSONRequest('GET', 'users/me');
        return res.data.user;
    }

    connect() {
        return new Promise((resolve, reject) => {
            const connection = new autobahn.Connection({url: 'wss://hashland.de/wamp/ws', realm: 'realm1'});

            connection.onopen = (session, details) => {
                this.session = session;
                resolve(session);
            };

            connection.open();
        });
    }

    async _create(route, data) {
        if (!Array.isArray(data))
            data = [data];

        const promises = data.map(d => this.JSONRequest('POST', route, d));
        return await Promise.all(promises);
    }

    async _get(route) {
        return await this.JSONRequest('GET', `${route}?deflate=true`);
    }

    async _update(route, entities) {
        if (!Array.isArray(entities))
            entities = [entities];

        const promises = entities.map(d => this.JSONRequest('PUT', `${route}/${d.id}`, d));
        return await Promise.all(promises);
    }

    async _delete(route, entities) {
        if (!Array.isArray(entities))
            entities = [entities];

        const promises = entities.map(d => this.JSONRequest('DELETE', `${route}/${d.id}`));
        return await Promise.all(promises);
    }

    async _call(route, method, entity, data) {
        if (Array.isArray(entity)) {
            const promises = entity.map(i => this.JSONRequest('PATCH', `${route}/${i.id}/${method}`, data));
            return await Promise.all(promises);

        } else {

            return await this.JSONRequest('PATCH', `${route}/${entity.id}/${method}`, data);
        }
    }

    /**
     * Create the given miners
     * @param miners
     * @returns {Promise<*>}
     */
    async createMiner(miners) {
        return inflateMiners(await this._create('miners', miners))
    }

    /**
     * Get all miners
     * @returns {Promise<*>}
     */
    async getMiners() {
        return inflateMiners(await this._get('miners'))
    }

    /**
     * Update the given miners
     * @param miners
     * @returns {Promise<*>}
     */
    async updateMiner(miners) {
        return inflateMiners(await this._update('miners', miners))
    }

    /**
     * Delete given miners
     * @param miners
     * @returns {Promise<*>}
     */
    async deleteMiner(miners) {
        return await this._delete('miners', miners)
    }

    /**
     * Trigger a soft reboot for the given miners
     * @param miner
     * @returns {Promise<*>}
     */
    async rebootMiner(miner) {
        return await this._call('miners', 'reboot', miner)
    }

    /**
     * Get all racks
     * @returns {Promise<*>}
     */
    async getRacks() {
        return inflateRacks(await this._get('racks'))
    }

    /**
     * Get all fans
     * @returns {Promise<*>}
     */
    async getFans() {
        return inflateFans(await this._get('fans'))
    }

    /**
     * Get all sensors
     * @returns {Promise<*>}
     */
    async getSensors() {
        return inflateSensors(await this._get('sensors'))
    }

    /**
     * Get all pdus
     * @returns {Promise<*>}
     */
    async getPdus() {
        return inflatePdus(await this._get('pdus'))
    }

    /**
     * Set the power state of given pdu_slot
     * @param pdu - The pdu entity
     * @param pdu_slot - index of the pdu slot
     * @param state - the desired state [on|off|cycle]
     * @returns {Promise<*>}
     */
    async setPduPowerState(pdu, pdu_slot, state) {
        return await this._call('pdus', 'power', pdu, {pdu_slot, state})
    }


    async getPduTypes() {
        return inflatePduTypes(await this._get('pdu-types'))
    }
}

module.exports = ApiClient;