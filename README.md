# IotToLine

## 概要
会社の勉強会で作ったもの
raspiberry pi + aws + LINE連携

## フロー
1. LINEからメッセージ送信(LINE business -> api gateway -> lambda)
2. lambdaからraspberry piへmqtt publish(lambda -> aws Iot -> raspberry pi)
3. raspiberry piでsubscribeして、温度・湿度を取得(readtempture.js -> temperature.py -> readtempture.js)
4. aws Iotへmqtt publish(readtempture.js -> aws Iot)
5. aws Iotからlambdaイベント処理(exports.js)
   dynamo DBへ登録
6. lambdaからLINEへ送信(lambda -> api gateway -> LINE business)

## おまけ
たぶん音声入力・出力
pipi_talk.py
recognizer.py
record.py
voice_recorder.py

