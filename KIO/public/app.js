const prompt = document.getElementById("prompt");
const send = document.getElementById("send");
const tasks = document.getElementById("tasks");
const mobileMenu = document.getElementById("mobileMenu");
const explorer = document.getElementById("explorer");

function addTask(text) {
  const item = document.createElement("div");
  item.className = "task";
  item.innerHTML = `
    <span class="task-icon">◉</span>
    <span>${text}</span>
    <strong>Working...</strong>
  `;

  tasks.prepend(item);

  setTimeout(() => {
    const status = item.querySelector("strong");
    status.textContent = "Done ✓";
    status.style.color = "#08e6d1";
  }, 900);
}

function runPrompt() {
  const value = prompt.value.trim();

  if (!value) {
    prompt.focus();
    return;
  }

  addTask("KIO Copilot: " + value.replace(/[<>]/g, ""));
  prompt.value = "";
  prompt.focus();
}

send.addEventListener("click", runPrompt);

prompt.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runPrompt();
  }
});

mobileMenu.addEventListener("click", () => {
  explorer.classList.toggle("mobile-open");
});

document.querySelectorAll(".rail-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".rail-btn")
      .forEach(x => x.classList.remove("active"));

    button.classList.add("active");
  });
});

document.querySelectorAll(".quick-links button").forEach(button => {
  button.addEventListener("click", () => {
    const old = button.textContent;
    button.textContent = "✓ " + old;

    setTimeout(() => {
      button.textContent = old;
    }, 700);
  });
});

console.log("KIO.AI Copilot UI ready");
