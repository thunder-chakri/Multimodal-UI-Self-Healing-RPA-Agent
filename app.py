
from flask import Flask, render_template, jsonify
from self_healing import main
from contextlib import redirect_stdout
from io import StringIO

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/run", methods=["POST"])
def run_automation():
    output = StringIO()

    try:
        with redirect_stdout(output):
            main()

        logs = output.getvalue()
        success = "TEST PASSED" in logs

        return jsonify({
            "success": success,
            "logs": logs
        })

    except Exception as error:
        return jsonify({
            "success": False,
            "logs": str(error)
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
