async function fetchUserReport() {
  const query = document.getElementById("searchQuery").value.trim();
  if (!query) {
      alert("Please enter a User ID, Name, or Email.");
      return;
  }

  try {
      const response = await fetch(`/api/user-report?query=${query}`);
      const data = await response.json();

      if (data.error) {
          alert(data.error);
          return;
      }

      // Populate User Details
      document.getElementById("userId").innerText = data.user.id;
      document.getElementById("userName").innerText = data.user.name;
      document.getElementById("userEmail").innerText = data.user.email;
      document.getElementById("userAvatar").src = data.user.avatar; // Add this line to update the avatar image

      // Format Strong Topics
      let strongHTML = "";
      data.strongTopics.forEach(topic => {
          strongHTML += `<span class="badge strong-topic me-1">${topic}</span>`;
      });
      document.getElementById("strongTopics").innerHTML = strongHTML || "<p class='text-muted'>No strong topics.</p>";

      // Format Weak Topics
      let weakHTML = "";
      data.weakTopics.forEach(topic => {
          weakHTML += `<span class="badge weak-topic me-1">${topic}</span>`;
      });
      document.getElementById("weakTopics").innerHTML = weakHTML || "<p class='text-muted'>No weak topics.</p>";

      // AI Suggestions
      document.getElementById("aiSuggestions").innerHTML = `<p>${data.aiReport.replace(/\n/g, "<br>")}</p>`;

  } catch (error) {
      console.error("Error fetching user report:", error);
      alert("Failed to fetch report. Please try again.");
  }
}
