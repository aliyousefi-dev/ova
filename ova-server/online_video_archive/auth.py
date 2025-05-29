from flask import Blueprint, session, redirect, url_for, request, render_template, jsonify
from functools import wraps
from config import USERNAME, PASSWORD

auth_bp = Blueprint("auth", __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("logged_in") or session.get("username") != USERNAME:
            session.clear()
            return redirect(url_for("auth.login_route"))
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route("/login", methods=["GET", "POST"])
def login_route():
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if username == USERNAME and password == PASSWORD:
            session["logged_in"] = True
            session["username"] = username
            return redirect(url_for("home"))
        error = "Login failed. Please try again."
    return render_template("login.html", error=error)

@auth_bp.route("/logout")
def logout_route():
    session.clear()
    return redirect(url_for("auth.login_route"))

# New API endpoint for login from mobile app
@auth_bp.route("/api/v1/login", methods=["POST"])
def api_login():
    # Accept both form data and JSON for flexibility
    if request.is_json:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
    else:
        username = request.form.get("username")
        password = request.form.get("password")

    if username == USERNAME and password == PASSWORD:
        # Optionally, you could create a session here or return a token for API auth
        return jsonify({"success": True, "message": "Login successful"}), 200
    else:
        return jsonify({"success": False, "message": "Invalid username or password"}), 200
