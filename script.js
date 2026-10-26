
const runBtn = document.getElementById("runBtn");
const statusText = document.getElementById("status");
const logs = document.getElementById("logs");

runBtn.addEventListener("click", async () => {
    runBtn.disabled = true;
    statusText.textContent = "Running...";
    logs.textContent = "Starting automation...";

    try {
        const response = await fetch("/run", {
            method: "POST"
        });

        const data = await response.json();

        logs.textContent = data.logs;
        statusText.textContent = data.success
            ? "Completed Successfully"
            : "Automation Failed";

    } catch (error) {
        statusText.textContent = "Connection Error";
        logs.textContent = error.message;
    } finally {
        runBtn.disabled = false;
    }
});
