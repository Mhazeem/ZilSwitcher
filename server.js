const taskkill = require('taskkill');
const ospath = require('path');
const cliCursor = require('cli-cursor');
const isWindowsOS = require('os').type() == "Windows_NT" ? true : "Linux";

cliCursor.hide();
console.log('\033[2J');
console.log("\r\nThank you for using...\r\n");

var figlet = require('figlet');
 
  console.log(figlet.textSync('ZIL\r\nSWITCHER', {
    font: 'Sub-Zero',
  }));

console.log("BTC donation address: 34Eqh9swghaN91Xv6KJ2pPAWiNEd1ieBzX\r\n\r\n");

global.ZilPOWRunning = false;
global.inWarmupState = false;
var twirlTimer;

[process.env.SECONDARY_MINER_PATH, process.env.ZIL_MINER_PATH].forEach(function(path){
    // test to make sure things are set before attempting to continue.
    if(!path || path == "."){
        console.log(`ERROR - Make sure you set the SECONDARY_MINER, SECONDARY_MINER_PATH,\r\nand ZIL_MINER_PATH environment variables without quotes (\" or \') and try again.`);
        process.exit(0);
    }
    
    var fs = require('fs');
        if ( ! fs.existsSync(path)) {
            console.log(`ERROR - ${path} does not exist. Cannot continue.`);
            process.exit(0);
    }
});

global.secondaryMiner = process.env.SECONDARY_MINER;  // The executable name of your secondaryminer, such as "ccminer.exe"
global.secondaryMinerPath = ospath.normalize(process.env.SECONDARY_MINER_PATH);  // Path to the batch file you want to use to launch your secondary miner.
global.zilMinerPath = ospath.normalize(process.env.ZIL_MINER_PATH); // Path to the batch file to launch your ZilMiner.
global.APIServer = process.env.ZIL_API_SERVER ? process.env.ZIL_API_SERVER : "https://api.zilliqa.com/";  // Default: https://api.zilliqa.com/



if (!APIServer){
    console.log(`Did you forget to specify your Zil node's IP, port and path in ZIL_GETWORK_NODE?`);
    console.log(`Use the format https://api.zilliqa.com/`)
    process.exit(1);
}

function getWork(){
    waitAnimation('stop');

    const axios = require('axios');

    axios.post(APIServer, {
        id: 1,
        jsonrpc: "2.0",
        method: "GetBlockchainInfo",
        params: [""]
    })
    .then((res) => {
        const DSEpochNum = parseInt(res.data.result.CurrentDSEpoch);
        const TXBlockNum = parseInt(res.data.result.CurrentMiniEpoch);
        const TXBlockRate = res.data.result.TxBlockRate;
        const secsToNextPow = Math.floor((Math.ceil(TXBlockNum/100)*100 - TXBlockNum) / (TXBlockRate));
        const secsToNextCheck = Math.floor((secsToNextPow / 2) > 5 ? secsToNextPow / 2 : 5);
        const isPoW = parseInt(TXBlockNum.toString().slice(-2)) > 98;
        console.log(`\r\nWe're currently at TX block ${TXBlockNum}\r\n\
Estimated next PoW window in: ${secsToNextPow} seconds.`);
        if (ZilPOWRunning){
            if (parseInt(TXBlockNum.toString().slice(-2)) != 99 && parseInt(TXBlockNum.toString().slice(-2)) > 0){
                console.log("Were at block 1 or higher in the new epoch. Switching to secondary miner.");
                FinishPoWWindow();
            }
            else{
                console.log(`We're still in the PoW TX block for DS Epoch ${DSEpochNum}}, check again in ${secsToNextCheck} seconds...`)
                setTimer(secsToNextCheck);
            }
        }
        else if (isPoW) {
            console.log("\r\nLast block before the new epoch! Start our miners!");
            ZilPOWRunning = true;
            shutdownRunningMiners(secondaryMiner);
            console.log("Cooling off for 6 seconds before starting up ZilMiner.");
            setTimeout(spinUpMiner, 6000, 'zil');
            console.log("Setting a timer to check PoW status in 60 seconds...");
            setTimer(60);
        } else {
            if (TXBlockNum.toString().slice(-2) > 94 && secsToNextCheck > 30){
                console.log(`\r\nWe're close to the PoW Window. Forget the estimate and just check in 30 seconds.`);
                setTimer(secsToNextCheck > 900 ? 900 : secsToNextCheck);
            }
            else{
                console.log(`\r\nCheck again in ${secsToNextCheck > 900 ? 900 : secsToNextCheck} seconds.`);
                setTimer(secsToNextCheck > 900 ? 900 : secsToNextCheck);    
            }
        }
    })
    .catch((error) => {
        console.error(error.errcode);
        console.log("Encountered an error when retrieving PoW window data. Trying again in 10 seconds.");
        setTimer(10);
    });
}

function shutdownRunningMiners(minername){
    const processName = minername == secondaryMiner || minername == '' ? secondaryMiner : "zilminer.exe";
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
        console.error(`Failed to terminate ${minername}. Maybe it wasn't running or you left the .exe extension off?\r\n
This error should not happen.`)
    });
}

function spinUpMiner(minername){
    const batPath = minername == secondaryMiner ? secondaryMinerPath : zilMinerPath;
    console.log(
`--------------------------\r\n
-- Starting ${minername} --\r\n
---------------------------\r\n`);
    const { spawn } = require('child_process');
    const bat = spawn('cmd.exe', ['/c', batPath], {cwd: batPath.substr(0, batPath.lastIndexOf(isWindowsOS ? '\\' : '/') )});

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
    console.log(`${minername} exited with code ${code}.`);
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
    waitAnimation('start');
}

function waitAnimation(action){
if (action =="start"){
    twirlTimer = (function() {
        var P = ["\\", "|", "/", "-"];
        var x = 0;
        return setInterval(function() {
          process.stdout.write("\r" + P[x++]);
          x &= 3;
        }, 250);
      })();
} else {
    clearInterval(twirlTimer);
    process.stdout.write("\r\x1b[K")
}
}

console.log("Starting up...");
getWork();