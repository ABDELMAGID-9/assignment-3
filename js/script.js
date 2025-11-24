// === THEME, GREETING, TIMER, API, and FORM ===

// ----- THEME TOGGLE -----
const themeBtn = document.getElementById("themeToggle");

// Load saved theme or default to dark
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.classList.add(savedTheme);
themeBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  document.body.classList.toggle("dark", !isDark);
  document.body.classList.toggle("light", isDark);
  localStorage.setItem("theme", isDark ? "light" : "dark");
  themeBtn.textContent = isDark ? "🌙" : "☀️";
});

// ----- GREETING -----
const greetingName = document.getElementById("greetingName");

// Create change-name button dynamically
const changeBtn = document.createElement("button");
changeBtn.textContent = "✏️";
changeBtn.title = "Change Name";
changeBtn.style.marginLeft = "8px";
changeBtn.style.border = "none";
changeBtn.style.background = "transparent";
changeBtn.style.cursor = "pointer";
changeBtn.style.fontSize = "1.1rem";
greetingName.after(changeBtn);

// Load name or ask for it
function updateGreeting() {
  const name = localStorage.getItem("visitorName");
  if (name) greetingName.textContent = `– Hello, ${name}!`;
}
if (!localStorage.getItem("visitorName")) {
  const name = prompt("Welcome! What's your name?");
  if (name) localStorage.setItem("visitorName", name);
}
updateGreeting();

// Allow changing name anytime
changeBtn.addEventListener("click", () => {
  const newName = prompt("Enter a new name:");
  if (newName) {
    localStorage.setItem("visitorName", newName);
    updateGreeting();
  }
});

// ----- TIMER -----
const timerEl = document.getElementById("timer");
let seconds = 0;
setInterval(() => {
  seconds++;
  timerEl.textContent = seconds;
}, 1000);

// ----- GITHUB API INTEGRATION -----
const fetchBtn = document.getElementById("fetchBtn");
const ghUser = document.getElementById("ghUser");
const repoList = document.getElementById("repoList");
const errorBanner = document.getElementById("errorBanner");

async function fetchRepos() {
  const username = ghUser.value.trim();
  repoList.innerHTML = "";
  errorBanner.hidden = true;

  if (!username) {
    errorBanner.hidden = false;
    errorBanner.textContent = "Please enter a GitHub username.";
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos`);
    if (!res.ok) throw new Error("GitHub user not found.");
    const data = await res.json();

    if (data.length === 0) {
      repoList.innerHTML = "<li>No repositories found.</li>";
      return;
    }

    data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    data.forEach(repo => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        <p>${repo.description || "No description"}</p>
        <small>⭐ ${repo.stargazers_count} • Updated: ${new Date(repo.updated_at).toLocaleDateString()}</small>
      `;
      repoList.appendChild(li);
    });
  } catch (err) {
    errorBanner.hidden = false;
    errorBanner.textContent = "Error fetching repos: " + err.message;
  }
}
fetchBtn.addEventListener("click", fetchRepos);
// ----- SHOW / HIDE PROJECTS -----
const toggleProjectsBtn = document.getElementById("toggleProjectsBtn");
toggleProjectsBtn.addEventListener("click", () => {
  const repoSection = document.getElementById("repoList");
  if (repoSection.style.display === "none") {
    repoSection.style.display = "block";
    toggleProjectsBtn.textContent = "👁 Hide Projects";
  } else {
    repoSection.style.display = "none";
    toggleProjectsBtn.textContent = "👁 Show Projects";
  }
});

// ===== Helper: detect near-typo domains =====
function levenshteinDistance(a, b) {
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
}

// ----- CONTACT FORM -----
const form = document.getElementById("contactForm");
const msg = document.getElementById("contactMsg");

form.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("cName").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const message = document.getElementById("cMessage").value.trim();

  // Reset previous messages each time
  msg.textContent = "";
  msg.style.color = "";

  // --- Validation Rules ---
  if (!name || !email || !message) {
    msg.textContent = "All fields are required.";
    msg.style.color = "red";
    return;
  }

  // Improved Email Validation + domain check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|info|io|co|us|uk|ca|sa)$/i;
  if (!emailRegex.test(email)) {
    msg.textContent = "Please enter a valid email address.";
    msg.style.color = "red";
    return;
  }

  // Detect likely typos in common domains
  const domainPart = email.split("@")[1]?.toLowerCase();
  const commonDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "live.com"];

  // only warn if domain is NOT already one of the correct ones AND is similar to them
  const isKnown = commonDomains.includes(domainPart);
  const isClose = commonDomains.some(d => levenshteinDistance(domainPart, d) > 0 && levenshteinDistance(domainPart, d) <= 2);

  if (!isKnown && isClose) {
    msg.textContent = "⚠️ Did you mean gmail.com or another common provider?";
    msg.style.color = "orange";
    return;
  }

  if (message.length < 10) {
    msg.textContent = "Message must be at least 10 characters.";
    msg.style.color = "red";
    return;
  }

  // Success Message
  msg.textContent = "✅ Message sent successfully (simulation).";
  msg.style.color = "green";
  form.reset();
});
