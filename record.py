import RPi.GPIO as GPIO
import time
import signal
import sys

from voice_recorder import VoiceRecorder
from recognizer import VoiceRecognizer


API_KEY = ''

def start_record():
    print("<<< please speak text into the microphone >>>")
    recorder = VoiceRecorder()
    recorder.record_to_file('demo.wav')
    wav = 'demo.wav'

    recognizer = VoiceRecognizer(API_KEY)
    print(recognizer.recognize(wav))

if __name__ == '__main__':
  BUTTON = 25
  TIMEOUT = 10000

  GPIO.setmode(GPIO.BCM)
  GPIO.setup(BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

  try:
    while True:
      channel = GPIO.wait_for_edge(BUTTON, GPIO.RISING)
      if channel:
        print("Pushed!!")
        start_record()

  except KeyboardInterrupt:
    GPIO.cleanup()

  GPIO.cleanup()
