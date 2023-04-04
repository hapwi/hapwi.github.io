from flask import Flask, render_template
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.config['APIKEY'] = os.environ.get('APIKEY')
app.config['PLAYERAPI'] = os.environ.get('PLAYERAPI')
app.config['LEADAPI'] = os.environ.get('LEADAPI')
app.config['ENTRIESAPI'] = os.environ.get('ENTRIESAPI')


@app.route('/')
def home():
    return render_template('index.html',
                           page_title="Leaderboard",
                           APIKEY=os.environ.get('apiKey'),
                           PLAYERAPI=os.environ.get('spreadsheetId'),
                           LEADAPI=os.environ.get('spreadsheetId2'),
                           ENTRIESAPI=os.environ.get('spreadsheetId3'))



@app.route('/players')
def players():
    return render_template('players.html',
                           page_title="Players",
                           APIKEY=os.environ.get('apiKey'),
                           PLAYERAPI=os.environ.get('spreadsheetId'),
                           LEADAPI=os.environ.get('spreadsheetId2'),
                           ENTRIESAPI=os.environ.get('spreadsheetId3'))


@app.route('/entries')
def entries():
    return render_template('entries.html',
                           page_title="Entries",
                           APIKEY=os.environ.get('apiKey'),
                           PLAYERAPI=os.environ.get('spreadsheetId'),
                           LEADAPI=os.environ.get('spreadsheetId2'),
                           ENTRIESAPI=os.environ.get('spreadsheetId3'))


@app.route('/form')
def form():
  return render_template('form.html', page_title='Form')


@app.route('/beback.html')
def beback():
  return render_template('beback.html', page_title='Back')


if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0', port=8080)
