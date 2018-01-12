/*
 * PROCESS    : LINE message -> lambda -> AWS Iot -> raspberry pi
 * HOW TO RUN : regist to supervisor process
 *
 */
const DEVICE_TEMPERATURE = true;
const TALK_TO_PYTHON     = false;

var fs = require('fs');

// AWS IoT SDK
var deviceModule   = require('aws-iot-device-sdk').device;

var device = deviceModule({
    region: 'ap-northeast-1',
    protocol: 'mqtts',
    clientId: 'park-client',
    keyPath: '/home/pi/deviceSDK/certs/3b58ae830a-private.pem.key',
    certPath: '/home/pi/deviceSDK/certs/3b58ae830a-certificate.pem.crt',
    caPath: '/home/pi/deviceSDK/certs/root-CA.crt',
});

var execSync = require('child_process').execSync;

function getTemperature(){
    if(DEVICE_TEMPERATURE){
        return getTemperatureFromDevice();
    }else{
        return getTemperatureFromPython();
    }
}

/*
 * get temperature from python module
 * stdout to japanese text
 *
 * @return string
 */
function getTemperatureFromPython(){
    var strMatch = '';
    var result = execSync("python /home/pi/temperature.py");
    var pyReg = /temp:([0-9]+) C[\n\r].*:([0-9]+)%/g;

    strMatch = pyReg.exec(result);

    console.log('strMatch1: ' + strMatch[1]); 
    console.log('strMatch2: ' + strMatch[2]); 

    return strMatch;
}

/*
 * get temperature from raspberry pi device
 * 
 * @return int 
 */
function getTemperatureFromDevice(){
    var strOrgTemper = fs.readFileSync('/sys/bus/w1/devices/28-02146419daff/w1_slave', 'utf8');
    var strTemper = strOrgTemper.match(/.*t=(.*)/m);
    var iTemper = Math.round(strTemper[1] / 1000);

    console.log("temper:" + iTemper);

    return iTemper;
}

/*
 * get temperature from raspberry pi device
 * 
 * @return int 
 */
function getCpuTemperature(){
    var strCpuTemper = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    var iCpuTemper =  Math.round(strCpuTemper / 1000);

    console.log("cpu:" + iCpuTemper);

    return iCpuTemper;
}

/*
 * if not use LINE, push temperature to AWS Iot
 * use this function 
 *
 */
//setInterval(function(){
//    var iNewTemper = getTemperature();
//    var iNewCpuTemper = getCpuTemperature();
//    var date = new Date();
//
//    device.publish('temper_db', JSON.stringify({
//            temperature: iNewTemper, cpu_temperature: iNewCpuTemper, temper_date: date.toLocaleDateString(), temper_time: date.toLocaleTimeString()}));
//
//}, 60000 * 30);


/*
 * Iot connect event
 * for log
 *
 */
device.on('connect', function() {
    console.log('connected');

    device.subscribe('line/request', {'qos': 1}, function(error, result) {
      console.log(result);
    });
});

/*
 * Iot close event
 * for log
 * 
 */
device.on('close', function() {
    console.log('close');
});

/*
 * Iot message event
 * send to temperature to AWS Iot
 * 
 */
device.on('message', function(topic, payload) {
    console.log('message:', topic, payload.toString());
    payload_res = JSON.parse(payload);

    if(payload_res["request_temper"]){
        var arrayResult = getTemperature();
        var iNewCpuTemper = getCpuTemperature();
    
        console.log('arrayResult:' + arrayResult);
    
        var iNewTemper = arrayResult[1];
        var iNewHumid = arrayResult[2];
    
        var date = new Date();
        var dateNow = date.getFullYear() + '' +  ('00' + (date.getMonth() + 1)).slice(-2) + ('00' + date.getDate()).slice(-2) + ' ' + ('00' + date.getHours()).slice(-2) + ':' + ('00' + date.getMinutes()).slice(-2);
    
        console.log('now date:' + dateNow);
    
        device.publish('temper_line', JSON.stringify({
                temper_date: dateNow, temperature: iNewTemper, humid: iNewHumid, cpu_temperature: iNewCpuTemper}));
    }

    if(TALK_TO_PYTHON){
        var result = execSync("python /home/pi/pipi_talk.py 0 " + payload_res["message"]);
        console.log('run talk:' + result);
    }
});

