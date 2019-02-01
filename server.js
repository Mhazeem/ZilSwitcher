const taskkill = require('taskkill');
const ospath = require('path');

global.ZilPOWRunning = false;
global.inWarmupState = false;

global.secondaryMiner = process.env.SECONDARY_MINER;  // The executable name of your secondaryminer, such as "ccminer"
global.secondaryMinerPath = ospath.normalize(process.env.SECONDARY_MINER_PATH);  // Path to the batch file you want to use to launch your secondary miner.
global.zilMinerPath = ospath.normalize(process.env.ZIL_MINER_PATH); // Path to the batch file to launch your ZilMiner.
global.getWorkServer = process.env.ZIL_GETWORK_NODE;  // Example: http://192.168.1.14:4202/api

for(var path in [secondaryMinerPath, zilMinerPath]){
    // test to make sure things are set before attempting to continue.
    if(!path || path == "."){
        console.log(`ERROR - Make sure you set the SECONDARY_MINER, SECONDARY_MINER_PATH, and ZIL_MINER_PATH environment variables and try again.`);
        process.exit(1);
    }
    
    var fs = require('fs');
        if ( ! fs.existsSync(path)) {
            console.log(`ERROR - ${path} does not exist. Cannot continue.`);
            process.exit(1);
    }
}

if (!getWorkServer){
    console.log(`Did you forget to specify your Zil node's IP, port and path in ZIL_GETWORK_NODE?`);
    console.log(`Use the format http://192.168.1.14:4202/api`)
    process.exit(1);
}

function getWork(){

    const axios = require('axios');

    axios.post(getWorkServer, {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_getWork"
    })
    .then((res) => {
        const isPoW = (res.data.result[3] == 'true');
        const secsToNext = res.data.result[4];
        console.log(`\r\nAre we in a PoW window? ${isPoW}\r\n\
Seconds to next PoW window check: ${secsToNext}`);
        if (isPoW) {
            console.log("\r\nPoW window starting!");
            ZilPOWRunning = true;
            console.log("Setting a timer to finish Zil PoW phase in 90 seconds...");
            setTimeout(FinishPoWWindow, 90000);
        } else if (secsToNext < 30 && ! inWarmupState){
                inWarmupState = true;
                console.log(`\r\nPoW window is soon-- Warming up.`);
                shutdownRunningMiners(secondaryMiner);
                setTimeout(spinUpMiner, 8000, 'zil');
                setTimer(10);
        } else {
            console.log(`\r\nPoW isn't running, check again in ${secsToNext > 10 ? secsToNext : 1} seconds.`);
            setTimer(secsToNext > 10 ? secsToNext : 1);
        }
    })
    .catch((error) => {
        console.error(error);
        console.log("Encountered an error when retireving PoW window data. Trying again in 10 seconds.");
        setTimer(10);
    });
}

function shutdownRunningMiners(minername){
    const processName = minername == secondaryMiner || minername == '' ? secondaryMiner : "zilminer";
    const input = [processName,];
    const options = {
        tree: true,
        force: true
    };

    console.log(`Shutting down miner for ${minername}`);
    taskkill(input, options).then(() => {
        console.log(`Successfully terminated ${input.join(', ')}`);
    })
    .catch((error) => {
        console.error(error)
    });
}

function spinUpMiner(minername){
    const batPath = minername == secondaryMiner ? secondaryMinerPath : zilMinerPath;
    console.log(`Starting ${minername} miner in background.`);
    const { spawn } = require('child_process');
    const bat = spawn('cmd.exe', ['/c', batPath], {cwd: batPath.substr(0, batPath.lastIndexOf('\\'))});

    // Uncomment the below line groups to display miner output in the main console window.
    // This may or may not work correctly depending on the secondary miner you use.

    // Comment from --here--
    bat.stdout.on('data', (data) => {
    console.log(data.toString());
    });

    bat.stderr.on('data', (data) => {
    console.log(data.toString());
    });

    // To --here-- to disable miner output to stop clutter.

    bat.on('exit', (code) => {
    console.log(`${Minername} exited with code ${code}.`);
    });
}

function FinishPoWWindow(){
    console.log("Finishing Zil PoW phase...");
    ZilPOWRunning = false;
	inWarmupState = false;
    shutdownRunningMiners('zil');

    function startSecondaryMiner(){
        spinUpMiner(secondaryMiner);
    }

    console.log(`Starting ${secondaryMiner} miner after a 10 second cooldown.`);
    setTimeout(startSecondaryMiner, 10000);

    setTimer(10);
}

function setTimer(secsRemaining){
    setTimeout(getWork, secsRemaining * 1000);
}

console.log("Welcome to ZilSwitcher!\r\n");
getWork();