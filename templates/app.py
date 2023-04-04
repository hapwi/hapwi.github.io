from flask import Flask, render_template
import os

app = Flask(__name__)

app.config['APIKEY'] = os.environ.get('APIKEY')
app.config['PLAYERAPI'] = os.environ.get('PLAYERAPI')
app.config['LEADAPI'] = os.environ.get('LEADAPI')
app.config['ENTRIESAPI'] = os.environ.get('ENTRIESAPI')


@app.route('/')
def home():
  api_key = app.config['APIKEY']
  player_api_key = app.config['PLAYERAPI']
  lead_api_key = app.config['LEADAPI']
  entries_api_key = app.config['ENTRIESAPI']
  return render_template('index.html',
                         page_title="Leaderboard",
                         APIKEY=api_key,
                         PLAYERAPI=player_api_key,
                         LEADAPI=lead_api_key,
                         ENTRIESAPI=entries_api_key)


@app.route('/players')
def players():
  api_key = app.config['APIKEY']
  player_api_key = app.config['PLAYERAPI']
  lead_api_key = app.config['LEADAPI']
  entries_api_key = app.config['ENTRIESAPI']
  return render_template('players.html',
                         page_title="Players",
                         APIKEY=api_key,
                         PLAYERAPI=player_api_key,
                         LEADAPI=lead_api_key,
                         ENTRIESAPI=entries_api_key)


@app.route('/entries')
def entries():
  api_key = app.config['APIKEY']
  player_api_key = app.config['PLAYERAPI']
  lead_api_key = app.config['LEADAPI']
  entries_api_key = app.config['ENTRIESAPI']
  return render_template('entries.html',
                         page_title="Entries",
                         APIKEY=api_key,
                         PLAYERAPI=player_api_key,
                         LEADAPI=lead_api_key,
                         ENTRIESAPI=entries_api_key)


@app.route('/form')
def form():
  return render_template('form.html', page_title='Form')


@app.route('/beback.html')
def beback():
  return render_template('beback.html', page_title='Back')


if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0', port=8080)
