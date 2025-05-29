import os
import yaml

# Absolute path of current file (config.py in Scripts)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Scripts folder

# Project root folder (one level up from Scripts)
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

# Path to YAML config file (one directory up from Scripts)
CONFIG_FILE_PATH = os.path.join(PROJECT_ROOT, "settings.yaml")

# Default VIDEO_DIR folder is inside project root as Archive/
DEFAULT_VIDEO_DIR = os.path.join(PROJECT_ROOT, "Archive")

DEFAULT_CONFIG = {
    "VIDEO_DIR": DEFAULT_VIDEO_DIR,
    "USERNAME": "new",
    "PASSWORD": "new",
    "SECRET_KEY": "your_secret_key"
}

def create_default_config(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)  # Ensure config file dir exists
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(DEFAULT_CONFIG, f)
    print(f"Default config created at: {path}")

def load_config(path):
    if not os.path.exists(path):
        print(f"Config file not found at {path}, creating default config...")
        create_default_config(path)
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data

config = load_config(CONFIG_FILE_PATH)

VIDEO_DIR = config.get("VIDEO_DIR")
USERNAME = config.get("USERNAME")
PASSWORD = config.get("PASSWORD")
SECRET_KEY = config.get("SECRET_KEY")
