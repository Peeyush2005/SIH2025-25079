from flask import Flask, render_template, jsonify, redirect, url_for, abort
import subprocess
import sys
import json
import webbrowser
from threading import Timer

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index')
@app.route('/index.html')
def index_alias():
    return redirect(url_for('index'))

@app.errorhandler(404)
def not_found(_):
    # Serve the main page for any unknown route (useful if the browser hits a wrong path)
    return render_template('index.html'), 200

@app.route('/test')
def test():
    return "Test page is working!"

@app.route('/run_simulation')
def run_simulation():
    try:
        # We will make this more robust later
        result = subprocess.check_output([sys.executable, 'bcf_detecter.py'], 
                                         stderr=subprocess.STDOUT, 
                                         text=True)
        return jsonify({'output': result})
    except subprocess.CalledProcessError as e:
        return jsonify({'output': e.output})

@app.route('/get_chart_data')
def get_chart_data():
    try:
        result = subprocess.check_output([sys.executable, 'bcf_detecter.py', '--json'],
                                         stderr=subprocess.STDOUT,
                                         text=True)
        return jsonify(json.loads(result))
    except subprocess.CalledProcessError as e:
        return jsonify({'error': e.output})

def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000/')

# Catch-all must be registered LAST so explicit routes above win
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Allow API routes to 404 normally if hit directly by mistake
    api_routes = {'run_simulation', 'get_chart_data', 'test'}
    if path in api_routes:
        abort(404)
    return render_template('index.html')

if __name__ == '__main__':
    Timer(1, open_browser).start()
    app.run(debug=True)
