import sys
import json
import urllib.parse
import urllib.request

class VoiceRecognizer:
	__ENDPOINT = 'http://www.google.com/speech-api/v2/recognize'

	def __init__(self, apikey):
		self.apikey = apikey

	def recognize(self, wav):
		"""
		wav形式の音声データをテキストに変換する
		複数の候補が返ってくるので、一番確率が高い候補を返す

		音声データの条件
		  サンプリング: 16KHZ		  
		"""
		voice_data = open(wav, 'rb').read()
		query_string = {'output': 'json', 'lang': 'ja-JP', 'key': self.apikey}
		url = '{0}?{1}'.format(VoiceRecognizer.__ENDPOINT, urllib.parse.urlencode(query_string))
		headers = {'Content-Type': 'audio/l16; rate=44100'}

                try:
			request  = urllib.request.Request(url, data=voice_data, headers=headers)
			response = urllib.request.urlopen(request).read()
			result   = response.decode('utf-8').split("\n")[1]
			items    = json.loads(result)['result'][0]['alternative']
			text     = max(items, key=lambda item: item['confidence'])['transcript']  # 確率が一番高いテキストを取得
			return text
                except:
			return '認識出来ないぜ'

