//=============================================================================
// dayNightCycle.js
//=============================================================================

/*:
 * @plugindesc This plugin allows you to simulate day/night cycles easily in your game with a lot of customisability
 * @author 4n0nh4x0r
 *
 * @param Start_Time
 * @desc Define the time your game starts at
 * @default 720
 *
 * @param Start_Day
 * @desc Define the day your game starts at
 * @default 0
 *
 * @param Speed
 * @desc Define the speed of your day/night cycles                   1000(ms) = 1 second -> 1440 seconds per day = 24 minutes per day
 * @default 1000
 *
 * @param Autostart
 * @desc Start the time system automatically or not
 * @default true
 *
 * @param Language
 * @desc Define the language that the daytimes will be displayed in
 * @default en
 *
 * @help
 *
 * Plugin Command:
 *   timeCycle init          # initialise the time flow
 *   timeCycle pause         # pause the time flow
 *   timeCycle resume        # resume the time flow
 */

(function() {
    //  ---------------- Global Values
    var parameters = PluginManager.parameters('dayNightCycle');
    console.log(parameters['Start_Time'])
    var myValue = 0
    var paused  = 0

    var currentTime
    var currentDay
    var speed =         parseInt(parameters['Speed']);
    var language =      String(parameters['Language']);
    var tintDuration =  Math.floor(3600 * (speed / 1000))
    var autoStart =     Boolean(parameters['Autostart'])
    const texts = {
        en:["Morning", "Morning",   "Noon",   "Afternoon",  "Evening", "Night"],
        de:["Morgen",  "Vormittag", "Mittag", "Nachmittag", "Abend",   "Nacht"]
    }
    const tints = {
        day:    [  0,   0, 0,  0],
        night:  [-68, -68, 0, 68]
    }

    var currentTimeReadable = "00:00"
    var timeTimer
    var timerPaused = false



    setTimeout(() => {
        if($gameParty.anonTimeSystem == undefined){
            currentTime =   parseInt(parameters['Start_Time']);
            currentDay =    parseInt(parameters['Start_Day']);

            $gameParty.anonTimeSystem = {}
            $gameParty.anonTimeSystem.timeStore = currentTime
            $gameParty.anonTimeSystem.currentDay = currentDay

            if(currentTime >= 360 && currentTime < 1080){
                $gameScreen.startTint(tints.day, 1)
            }else{
                $gameScreen.startTint(tints.night, 1)
            }
        }else{
            currentTime =   $gameParty.anonTimeSystem.timeStore;
            currentDay =    $gameParty.anonTimeSystem.currentDay;
        }
        if(currentTime >= 360 && currentTime < 1080){
            $gameScreen.startTint(tints.day, 1)
        }else{
            $gameScreen.startTint(tints.night, 1)
        }
    }, 1000);

    // -----------------



    //  ---------------- Plugin Command Handler

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'timeCycle') {
            switch (args[0]) {
                case 'init':
                    $gameSystem.initTimer();
                break;
                case 'pause':
                    $gameSystem.pauseTimer();
                break;
                case 'resume':
                    $gameSystem.resumeTimer();
                break;
            }
        }
    };
    // -----------------


    //  ---------------- Functions
    Game_System.prototype.initTimer = function() {
        if(timeTimer == null){
            // console.log(currentTime)
            // console.log($gameParty)
            // console.log($gameParty.anonTimeSystem)
            // console.log($gameParty.anonTimeSystem.timeStore)
            timeTimer = setInterval(() => {
                // console.log("Timer started")
                if(!timerPaused){
                    currentTime++
                    // console.log(currentTime)
                    // $gameParty.anonTimeSystem.timeStore = currentTime
                    handleTint(currentTime)
                    if(currentTime == 1440){
                        currentTime = 0
                        currentDay++
                    }
                }
            }, speed);
        }
    };

    Game_System.prototype.pauseTimer = function() {
        timerPaused = true
    };

    Game_System.prototype.resumeTimer = function() {
        timerPaused = false
    };

    handleTint = function (currentTime) {
        switch(currentTime){
            case 360:
                $gameScreen.startTint(tints.day, tintDuration)
            break;
            case 1080:
                $gameScreen.startTint(tints.night, tintDuration)
            break;
        }
    }

    returnTime = function(){
        return getCurrentTime(currentTime)
    }

    returnDay = function(){
        return getCurrentDay(currentDay)
    }
    returnDaytime = function(){
        var cuDayTime
        // console.log(currentTime)
        switch (true) {
            case (currentTime >= 360 && currentTime < 600):
                return texts[language][0]
            break;
            case (currentTime >= 600 && currentTime < 720):
                return texts[language][1]
            break;
            case (currentTime >= 720 && currentTime < 840):
                return texts[language][2]
            break;
            case (currentTime >= 840 && currentTime < 1080):
                return texts[language][3]
            break;
            case (currentTime >= 1080 && currentTime < 1320):
                return texts[language][4]
            break;
            case ((currentTime >= 1320 && currentTime < 1440) || (currentTime >= 0 && currentTime < 360)):
                return texts[language][5]
            break;
        }
    }

    getCurrentTime = function(curTime) {
        currentMinute = 0
        for(var i = 0; i*60<=curTime; i++){
            currentMinute = i
        }
        var currentTime = curTime - (currentMinute*60)
        if(currentMinute <= 9){
            currentMinute = `0${currentMinute}`
        }
        if(currentTime <= 9){
            currentTime = `0${currentTime}`
        }
        return `${currentMinute}:${currentTime}`
    };


    getCurrentDay = function(currentDay){
        return currentDay
    }


    // -----------------


    if(autoStart){
        setTimeout(() => {
            $gameSystem.initTimer()
            console.log("Start Timer automatically")
        }, 3000);
    }else{
        console.log("Dont start Timer automatically")
    }
})();