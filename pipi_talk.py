#coding: utf-8
# argv取得目的
import sys
import subprocess

# POST通信用ライブラリ
import urllib
import urllib2

# JSONハンドリングライブラリ
import json

# コマンドライン引数取得
argvs = sys.argv  # 引数リスト
argc = len(argvs) # 引数の個数

# User Local社チャットボット情報
api_url = 'https://chatbot-api.userlocal.jp/api/chat'
api_key = ''

# jtalkを用いて喋らせる処理(text→wav変換→再生)
def jtalk(t):
    open_jtalk = ['open_jtalk']
    #mech = ['-x','/usr/local/OpenJTalk/dic']
    mech = ['-x','/usr/local/share/open_jtalk/open_jtalk_dic_utf_8-1.08/']
    #htsvoice = ['-m','/usr/local/OpenJTalk/voice/m001/nitech_jp_atr503_m001.htsvoice']
    htsvoice = ['-m','/usr/local/share/hts_voice/mei/mei_normal.htsvoice']
    speed = ['-r','0.6']
    outwav = ['-ow','pipi_talk.wav']
    cmd = open_jtalk+mech+htsvoice+speed+outwav
    c = subprocess.Popen(cmd,stdin=subprocess.PIPE)
    c.stdin.write(t)
    c.stdin.close()
    c.wait()
    aplay = ['aplay','-q','pipi_talk.wav']
    #aplay = ['afplay','pipi_talk.wav']
    wr = subprocess.Popen(aplay)

# チャットボットから応答をもらう
def get_bot_response(message):
    params = {"message":message, "key" : api_key }
    params = urllib.urlencode(params)

    req = urllib2.Request(api_url)
    # ヘッダ設定
    req.add_header('test', 'application/x-www-form-urlencoded')

    # パラメータ設定
    req.add_data(params)

    res = urllib2.urlopen(req)
    r = res.read()
    json_dict = json.loads(r)
    return format(json_dict['result'].encode('utf-8'))

# もらったテキストをそのまま再生orチャットボット回答再生か切り分ける
def say_text():
    text='' # jtalkに喋らせる値
    if argvs[1] == '0': 
        text = argvs[2]
    elif argvs[1] == '1':
        text = get_bot_response(argvs[2])

    jtalk(text)

if __name__ == '__main__':
    say_text()
