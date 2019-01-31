# Zil Switcher
##### Automatically Switch between ZilMiner during the Zilliqa PoW Phase and any other miner when PoW is not running.

### Pre-requsites
1. Windows - Tested on Windows 10
2. A recent copy of Node JS such as 10.15.1 LTS (Download https://nodejs.org/en/)

### Installation
1. Download this repository to a directory of your choice
2. Open a command prompt or powershell
3. Navigate to your ZilSwitcher directory
4. Run "npm install"
-- NPM (Node Package Manager) will download and install dependencies automatically. The dependencies will be saved to the ZilSwitcher directory under "node_modules"

### Usage
1. Open a command prompt or powershell to the ZilSwitcher directory
2. Set the following environment variables as shown:
a. If using command prompt, set environment variables using the format:
`set variablename=value`
b. If using Powershell, set environment variables using the format:
`Env:variablename=value`
```
SECONDARY_MINER  // The executable name of your secondaryminer, such as "ccminer"
SECONDARY_MINER_PATH  // FULL Path to the batch file you want to use to launch your secondary miner.
ZIL_MINER_PATH // FULL Path to the batch file to launch your ZilMiner.
ZIL_GETWORK_NODE  // Example: http://192.168.1.14:4202/api
```
3. run "npm start"
-- Node should autodetect what to run and start ZilSwitcher.
4. Sit back, relax, and watch ZilSwitcher do it's thing.

### Notes
1. The method ZilSwitcher uses to start your miners will not display any visible output by default.
a. You can enable the output of your miners to show in ZilSWitcher's window, but depending on your miner, it may or may not provide it's output. See line 100 - line 106 in "server.js".
b. Miner output is dsabled to keep the ZilMiner window cleaner.
c. You can check to make sure your graphics cards are mining by monitoring an application such as MSI Afterburner.


### Like ZilSwitcher? Donate some BTC for what you think it's worth!
34Eqh9swghaN91Xv6KJ2pPAWiNEd1ieBzX

##### Don't have btc, but want to donate? Email me and I'll take pretty much any currency. :D
#
#
### Problems? Open an "issue" on GitHub.