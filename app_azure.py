# Azure App Service Configuration
import os
from flask import Flask, render_template, jsonify, redirect, url_for, abort
import subprocess
import sys
import json
import webbrowser
from threading import Timer

app = Flask(__name__)

# Azure App Service configuration
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index')
@app.route('/index.html')
def index_alias():
    return redirect(url_for('index'))

@app.errorhandler(404)
def not_found(_):
    # Serve the main page for any unknown route
    return render_template('index.html'), 200

@app.route('/test')
def test():
    return "Test page is working! Deployed on Azure App Service."

@app.route('/health')
def health():
    """Health check endpoint for Azure"""
    return jsonify({'status': 'healthy', 'service': 'Broken Conductor Detection'}), 200

@app.route('/run_simulation')
def run_simulation():
    try:
        # Use python3 for Azure Linux App Service
        python_cmd = 'python3' if os.name != 'nt' else 'python'
        result = subprocess.check_output([python_cmd, 'bcf_detecter.py'], 
                                         stderr=subprocess.STDOUT, 
                                         text=True,
                                         timeout=30)  # Add timeout for Azure
        return jsonify({'output': result})
    except subprocess.TimeoutExpired:
        return jsonify({'output': 'Simulation timed out. Please try again.'})
    except subprocess.CalledProcessError as e:
        return jsonify({'output': f'Error running simulation: {e.output}'})
    except Exception as e:
        return jsonify({'output': f'Unexpected error: {str(e)}'})

@app.route('/get_chart_data')
def get_chart_data():
    try:
        python_cmd = 'python3' if os.name != 'nt' else 'python'
        result = subprocess.check_output([python_cmd, 'bcf_detecter.py', '--json'],
                                         stderr=subprocess.STDOUT,
                                         text=True,
                                         timeout=30)
        return jsonify(json.loads(result))
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Chart data generation timed out'})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'Error generating chart data: {e.output}'})
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'})

# Catch-all must be registered LAST
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Allow API routes to 404 normally if hit directly
    api_routes = {'run_simulation', 'get_chart_data', 'test', 'health'}
    if path in api_routes:
        abort(404)
    return render_template('index.html')

if __name__ == '__main__':
    # For local development
    port = int(os.environ.get('PORT', 5000))
    if not app.config['DEBUG']:
        # Production mode - don't open browser automatically
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        # Development mode
        Timer(1, open_browser).start() if 'open_browser' in globals() else None
        app.run(host='0.0.0.0', port=port, debug=True)

def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000/')