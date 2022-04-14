module.exports.config = {
    name: "checktt",
    version: "1.0.0",
    hasPermssion: 0 / 1 / 2,
    credits: "SenProject",
    description: "check tương tác",
    group: "group",
    usages: "[all/@tag]",
    cooldowns: 3,
    dependencies: {
        "fs": ""
    }
};

const path = __dirname + '/count-by-thread/';

module.exports.onLoad = () => {
    const fs = require('fs');
    if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
        fs.mkdirSync(path, { recursive: true });
    }
}

module.exports.handleEvent = function ({ event }) {
    const { messageID, threadID, senderID } = event;
    if (!global.data.allThreadID.some(tid => tid == threadID)) return;
    const fs = global.nodemodule['fs'];
    const threadPath = path + threadID + '.json';
    if (!fs.existsSync(threadPath) || fs.statSync(threadPath).isDirectory()) {
        fs.writeFileSync(threadPath, JSON.stringify({}, null, 4));
    }
    const getThreadJSON = JSON.parse(fs.readFileSync(threadPath)) || {};
    if (!getThreadJSON.hasOwnProperty(senderID)) {
        getThreadJSON[senderID] = 0;
    }
    getThreadJSON[senderID]++;
    fs.writeFileSync(threadPath, JSON.stringify(getThreadJSON, null, 4));
}

const getRankName = count => {
    return count > 2500 ? 'Cao Thủ'
        : count > 2400 ? 'Tinh Anh V'
            : count > 2200 ? 'Tinh Anh IV'
                : count > 2000 ? 'Tinh Anh III'
                    : count > 1800 ? 'Tinh Anh II'
                        : count > 1500 ? 'Tinh Anh I'
                            : count > 1400 ? 'Kim Cương V'
                                : count > 1300 ? 'Kim Cương IV'
                                    : count > 1200 ? 'Kim Cương III'
                                        : count > 1100 ? 'Kim Cương II'
                                            : count > 1000 ? 'Kim Cương I'
                                                : count > 900 ? 'Bạch Kim IV'
                                                    : count > 800 ? 'Bạch Kim III'
                                                        : count > 600 ? 'Bạch Kim II'
                                                            : count > 500 ? 'Bạch Kim I'
                                                                : count > 400 ? 'Vàng IV'
                                                                    : count > 250 ? 'Vàng III'
                                                                        : count > 200 ? 'Vàng II'
                                                                            : count > 150 ? 'Vàng I'
                                                                                : count > 100 ? 'Bạc III'
                                                                                    : count > 80 ? 'Bạc II'
                                                                                        : count > 50 ? 'Bạc I'
                                                                                            : count > 30 ? 'Đồng III'
                                                                                                : count > 10 ? 'Đồng II'
                                                                                                    : 'Đồng I'
}




module.exports.run = async function ({ api, event, args, Users }) {
    const fs = global.nodemodule['fs'];
    const { messageID, threadID, senderID, mentions } = event;
    const threadPath = path + threadID + '.json';
    if (!fs.existsSync(threadPath) || fs.statSync(threadPath).isDirectory()) {
        fs.writeFileSync(threadPath, JSON.stringify({}, null, 4));
    }
    const query = args[0] ? args[0].toLowerCase() : '';
    const getThreadJSON = JSON.parse(fs.readFileSync(threadPath)) || {};
    if (!getThreadJSON.hasOwnProperty(senderID)) {
        getThreadJSON[senderID] = 1;
    }
    var storage = [],
        msg = '';
    if (query == 'all') {
        const allThread = await api.getThreadInfo(threadID) || { participantIDs: [] };
        for (id of allThread.participantIDs) {
            if (!getThreadJSON.hasOwnProperty(id)) {
                getThreadJSON[id] = 0;
            }
        }
    }
    for (const id in getThreadJSON) {
        const name = await Users.getNameUser(id);
        storage.push({ id, name, count: getThreadJSON[id] });
    }
    storage.sort((a, b) => {
        if (a.count > b.count) return -1;
        else if (a.count < b.count) return 1;
        else return a.name.localeCompare(b.name);
    });
    if (query == 'all') {
        let count = 1;
        msg += '===CHECKTT===';
        for (const user of storage) {
            msg += `\n${count++}. ${user.name} - ${user.count}`;
        }
    } else if (query == 'rank') {
        msg += 'Đồng 1 (10tn)\nĐồng 2 (30tn)\nĐồng 3 (50tn)\nBạc 1 (80 tn)\nBạc 2 (100 tn)\nBạc 3 (150 tn)\nVàng 1 ( 200 tn)\nVàng2 (250 tn)\nVàng3 (400 tn)\nVàng 4 (500 tn)\nBạch kim 1 (600 tn)\nBạch kim  2 (800 tn)\nBạch kim 3 (900 tn)\nBạch kim 4 (1000 tn)\nKim cương 1( 1100 tn)\nKim cương 2 (1200)\nKim cương 3 (1300 tn)\nKim cương 4(1400 tn)\nKim cương 5 (1500 tn)\nTinh Anh 1 (1800 tn)\n2 (2000tn)\n3 (2200tn)\n4 (2400 tn)\n5 (2500tn)\nCao thủ'
    } else if (!query) {
        let userID = senderID;
        if (Object.keys(mentions).length > 0) {
            userID = mentions[0];
        }
        const rankUser = storage.findIndex(e => e.id == userID);
        msg += `${userID == senderID ? 'Bạn' : storage[rankUser].name} đứng thứ ${rankUser + 1}\nSố tin nhắn: ${storage[rankUser].count}\nRank ${getRankName(storage[rankUser].count)}`;
    }
    api.sendMessage(msg, threadID);
    return;
}
