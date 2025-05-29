from flask import Flask, render_template, redirect, url_for
import os
import sys

# Set working directory
root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root)
os.chdir(root)

from config import SECRET_KEY
from shared import metadata_manager

# Import Blueprint from auth.py
from auth import auth_bp, login_required

# Import your other Blueprints here
from video_routes import video_bp
from collections_routes import collections_bp
from favorites_routes import favorites_bp
from rating import rating_bp
from tags import tags_bp
from explore_routes import explore_bp

app = Flask(__name__)
app.secret_key = SECRET_KEY

# Enable the do extension
app.jinja_env.add_extension('jinja2.ext.do')

# Register Blueprints
app.register_blueprint(auth_bp)  # Auth blueprint registered under /login, /logout
app.register_blueprint(video_bp)
app.register_blueprint(collections_bp)
app.register_blueprint(favorites_bp)
app.register_blueprint(rating_bp)  # Rating blueprint registered under /rate_video
app.register_blueprint(tags_bp)  # Tags blueprint registered under /tags
app.register_blueprint(explore_bp)  # Explore blueprint registered under /explore

@app.route("/")
def root(): 
    # Redirect to login page by default
    return redirect(url_for("auth.login_route"))

@app.route("/home")
@login_required
def home():
    totalvideos = len(metadata_manager.videos)  # Your video metadata count
    collections_count = len(metadata_manager.get_collections())
    favorites_count = len(metadata_manager.get_favorites())
    return render_template(
        "index.html",
        totalvideos=totalvideos,
        collections_count=collections_count,
        favorites=favorites_count
    )

@app.template_filter('filename')
def filename_filter(path):
    return path.rsplit('/', 1)[-1]

if __name__ == "__main__":
    print("Generating metadata before starting server...")
    metadata_manager.generate_metadata()
    try:
        metadata_manager.load_metadata()
    except Exception as e:
        print(f"Warning: Could not load metadata: {e}")

    print("Starting Flask server...")
    app.run(host="0.0.0.0", port=8080, debug=True)
