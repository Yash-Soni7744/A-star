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


async function fetchUser(){
    const userID = document.getElementById("userID").value;

    if (!userID) {
        alert("Please enter a User ID");
        return;
    }

    try {
        const response = await fetch(`/api/users/${userID}`);
        const data = await response.json();

        if (data.error) {
            document.getElementById("userResponse").textContent = "User not found yaar!";
        } else {
            // Display user data in a structured format
            document.getElementById("userResponse").innerHTML = `
                <p><strong>User ID:</strong> ${data.user_id}</p>
                <p><strong>Name:</strong> ${data.display_name}</p>
                <p><strong>Email:</strong> ${data.primary_email}</p>`;
                
        }  
    }
    catch (error) {
        document.getElementById("userResponse").textContent = "Failed to fetch the user data.";
    }
}