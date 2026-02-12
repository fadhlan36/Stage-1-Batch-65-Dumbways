document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    themeToggle.classList.remove("fa-moon");
    themeToggle.classList.add("fa-sun");
  }

  themeToggle.addEventListener("click", function () {
    body.classList.toggle("dark-mode");

    const isDark = body.classList.contains("dark-mode");

    if (isDark) {
      themeToggle.classList.remove("fa-moon");
      themeToggle.classList.add("fa-sun");
      localStorage.setItem("theme", "dark");
    } else {
      themeToggle.classList.remove("fa-sun");
      themeToggle.classList.add("fa-moon");
      localStorage.setItem("theme", "light");
    }
  });
});
