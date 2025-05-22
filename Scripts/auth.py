# auth.py
from flask import Blueprint, session, redirect, url_for, request, render_template
from functools import wraps
from config import USERNAME, PASSWORD

auth_bp = Blueprint("auth", __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if logged in and username matches current config username
        if not session.get("logged_in") or session.get("username") != USERNAME:
            session.clear()  # Clear session if credentials don't match
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
            session["username"] = username  # Store username in session
            return redirect(url_for("home"))
        error = "Login failed. Please try again."
    return render_template("login.html", error=error)

@auth_bp.route("/logout")
def logout_route():
    session.clear()  # Clear session on logout
    return redirect(url_for("auth.login_route"))
