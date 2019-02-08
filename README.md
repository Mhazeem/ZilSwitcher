# Zil Switcher
##### Automatically Switch between ZilMiner during the Zilliqa PoW Phase and any other miner when PoW is not running.

### Pre-requsites
1. Windows - Tested on Windows 10
    1. Linux support may be added in the future.
2. A recent copy of Node JS such as 10.15.1 LTS (Download https://nodejs.org/en/)

### Installation
1. Download this repository to a directory of your choice
2. Open a command prompt or powershell
3. Navigate to your ZilSwitcher directory
4. Run "npm install"
    1. NPM (Node Package Manager) will download and install dependencies automatically. The dependencies will be saved to the ZilSwitcher directory under "node_modules"

### Usage
1. Open a command prompt or powershell to the ZilSwitcher directory
2. Set the following environment variables as shown. Do not enclose any values in quotes ( " or ' ):
    1. If using command prompt, set environment variables using the format:
        `set variablename=value`
    1. If using Powershell, set environment variables using the format:
        `Env:variablename=value`
```
SECONDARY_MINER  // The executable name of your secondaryminer, such as "ccminer.exe"
SECONDARY_MINER_PATH  // FULL Path to the batch file you want to use to launch your secondary miner.
ZIL_MINER_PATH // FULL Path to the batch file to launch your ZilMiner.
ZIL_API_SERVER  // Default: https://api.zilliqa.com/ (This field may be left blank)
POW_WINDOW  // Default: 90 - Set a custom timer for the PoW window. Useful if you need to run PoW longer to try for the DS difficulty. (This field may be left blank)
```
3. run "npm start"
-- Node should autodetect what to run and start ZilSwitcher.
4. Sit back, relax, and watch ZilSwitcher do it's thing.

### Notes
1. The method ZilSwitcher uses to start your miners will try to display your miner's output in the ZilSwitcher window, but not all miner support this. If it's not clear if you're mining your secondary coin, use an application like MSI Afterburner to see if your cards are being used.
    1. Comment out line 159 - line 166 in "server.js" to disable your miner's output. This will tidy up the ZilSwitcher window, but you'll just have to trust that your miner is working in the background.
    1. You can check to make sure your graphics cards are mining by monitoring an application such as MSI Afterburner.


### Like ZilSwitcher? Donate some BTC for what you think it's worth!
34Eqh9swghaN91Xv6KJ2pPAWiNEd1ieBzX

##### Don't have btc, but want to donate? Email me and I'll take pretty much any currency. :D
#
#
### Problems? Open an "issue" on GitHub.