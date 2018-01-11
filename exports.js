var https = require('https');
var awsIot = require('aws-iot-device-sdk');
var AWS = require('aws-sdk');

const AWS_IOT_HOST = ''; //aws iot > 管理 > モノ > 操作 > HTTPS
const LINE_AUTH = 'Bearer ' + '';  // LINE Developers > 企業 > アカウント > Channel Access Token
const LINE_USER_ID = ''; // LINE Developers > 企業 > アカウント > Your user ID

var device = awsIot.device({
    region: 'ap-northeast-1',
    clientId: 'lambda-client',
    privateKey: 'certs/3b58ae830a-private.pem.key',
    clientCert: 'certs/3b58ae830a-certificate.pem.crt',
    caCert: 'certs/root-CA.crt',
    host: AWS_IOT_HOST
});

//var dynamo = new AWS.DynamoDB({
//    region: 'ap-northeast-1'
//});

var need_temper = false;
var show_temper = false;
var show_humid  = false;
var show_cpu    = false;

exports.handler = (event, context, callback) => {
    var data = null;
    var opts = null;

    if(event.temperature != null){
        //from Iot    
        var text = "";
        if(event.show_temper){
            text = "temperature:" + event.temperature + "C"
        }else if(event.show_humid){
            text = "湿度:" + event.humid + "％"
        }else if(event.show_cpu){
            text = "CPU温度:"+ event.cpu_temperature + "C"
        }
        
        var data = JSON.stringify({
            to: LINE_USER_ID,
            messages: [{type: "text", text: text}]
        });
        opts = {
            hostname: 'api.line.me',
            path: '/v2/bot/message/push',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": LINE_AUTH
            },
            method: 'POST',
        };
    }else{
        //from LINE
        data = event.events[0];
        
        var replyToken = data.replyToken;
        var message = data.message;
        
        console.log(data.source);

        var text = "";
        if(message.text == "todays average temperature?"){
//dynamoDB parameter
//            var params = {
//                "TableName": "temper",
//                //key-index search
//                "KeyConditionExpression":
//                "temper_date Contains :dateVal",
//                //define Placeholder
//                "ExpressionAttributeValues": {":dateVal" : getNowDate()}
//            };
        }else if(message.text == "todays temperature?"){
            need_temper = true;
            show_temper = true;
        }else if(message.text == "todays humid?"){
            need_temper = true;
            show_humid = true;
        }else if(message.text == "cpu temperature?"){
            need_temper = true;
            show_cpu = true;
        }

        var record = {
            "message": message.text,
            "request_temper": need_temper,
            "show_temper": show_temper,
            "show_humid": show_humid,
            "show_cpu": show_cpu
        };

        var message = JSON.stringify(record);
        console.log("Publish: " + message);
        device.publish('line/request', message, {'qos': 0}, function (err){
            console.log("err: " + err);
        });

        if(text != ""){
            var data = JSON.stringify({
                replyToken: replyToken,
                messages: [{type: "text", text: text}]
            });
        }else{
            data = "";
        }

        //for Line POST option
        opts = {
            hostname: 'api.line.me',
            path: '/v2/bot/message/reply',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": LINE_AUTH
            },
            method: 'POST',
        };
    }
    

    if(data != ""){
        var req = https.request(opts, function(res) {
            res.on('data', function(res) {
                console.log("RESPONSE:" + res.toString());
            }).on('error', function(e) {
                console.log('ERROR: ' + e.stack);
            });
        });

        req.write(data);

        req.end(function(){
            if(event.temperature != null){
                context.done(null, "CONTEXT SUCCESSED");
            }
        });
    }
};

function getNowDate(){
    return date.getFullYear() + '' +  ('00' + (date.getMonth() + 1)).slice(-2) + ('00' + date.getDate()).slice(-2);
}
