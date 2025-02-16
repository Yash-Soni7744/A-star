async function fetchReport() {
    const studentId = document.getElementById("studentReport").value;
    if (!studentId) {
        alert("Please enter a Student ID");
        return;
    }

    try {
        const response = await fetch(`/api/report/${studentId}`);
        const data = await response.json();

        if (data.error) {
            document.getElementById("response").textContent = `Error: ${data.error}`;
        } else {
            document.getElementById("response").textContent = `AI Report for ${studentId}:\n\n${data.report}`;
        }
    } catch (error) {
        document.getElementById("response").textContent = "Failed to fetch the report.";
    }
}
