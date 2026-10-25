import sys
from pathlib import Path

# Ensure project root is on sys.path before test modules import `pages`
sys.path.insert(0, str(Path(__file__).resolve().parent))