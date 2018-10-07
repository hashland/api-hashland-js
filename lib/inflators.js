const inflate = require('./inflate');

module.exports = {
    inflateMiners: (response) => {
        return inflate(response, 'miner', ['mining_pool_account', 'miner_type', 'rack', 'pdu']);
    },

    inflateRacks: (response) => {
        return inflate(response, 'rack', []);
    },

    inflateSensors: (response) => {
        return inflate(response, 'sensor', []);
    },

    inflateFans: (response) => {
        return inflate(response, 'fan', []);
    },

    inflatePdus: (response) => {
        return inflate(response, 'pdu', ['rack', 'pdu_type']);
    },

    inflatePduTypes: (response) => {
        return inflate(response, 'pdu_type', []);
    }
}

