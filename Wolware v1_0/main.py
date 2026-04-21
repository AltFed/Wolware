import sys, os, threading, time, webbrowser
from pathlib import Path

def resource(rel):
    base = getattr(sys, '_MEIPASS', Path(__file__).parent)
    return os.path.join(base, rel)

os.environ['FLASK_TEMPLATES'] = resource('templates')
os.environ['FLASK_STATIC']    = resource('static')

def open_browser():
    time.sleep(1.5)
    webbrowser.open('http://127.0.0.1:5000')

threading.Thread(target=open_browser, daemon=True).start()

sys.path.insert(0, resource('.'))
from app import app
app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)