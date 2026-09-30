const state = {
  world: null,
  currentScreen: "homeScreen",
  previousScreen: "homeScreen",
  selectedPerson: null
};

const firstNames = [
  "Alex", "Jordan", "Taylor", "Morgan",
  "Sam", "Jamie", "Riley", "Casey",
  "Avery", "Cameron", "Drew", "Logan",
  "Parker", "Quinn", "Skyler", "Rowan"
];

const lastNames = [
  "Smith", "Johnson", "Brown", "Davis",
  "Miller", "Wilson", "Moore", "Taylor",
  "Anderson", "Thomas", "Jackson", "White"
];

const jobs = [
  "Teacher",
  "Engineer",
  "Doctor",
  "Artist",
  "Builder",
  "Chef",
  "Farmer",
  "Scientist",
  "Mechanic",
  "Writer",
  "Designer",
  "Student"
];

const traits = [
  "Friendly",
  "Curious",
  "Brave",
  "Quiet",
  "Creative",
  "Funny",
  "Patient",
  "Ambitious",
  "Adventurous",
  "Careful",
  "Kind",
  "Competitive",
  "Calm",
  "Energetic",
  "Logical",
  "Social"
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function randomTraits() {
  const selected = [];

  while (selected.length < 3) {
    const trait = randomItem(traits);

    if (!selected.includes(trait)) {
      selected.push(trait);
    }
  }

  return selected;
}

function createWorld() {
  const population = randomNumber(12, 25);
  const people = [];

  for (let i = 0; i < population; i++) {

    people.push({
      id: crypto.randomUUID(),

      name:
        randomItem(firstNames) +
        " " +
        randomItem(lastNames),

      age: randomNumber(8, 75),

      job: randomItem(jobs),

      traits: randomTraits(),

      x: randomNumber(5, 95),
      y: randomNumber(5, 95),

      happiness: randomNumber(40, 95),

      health: randomNumber(50, 100),

      relationships: []
    });
  }

  state.world = {
    day: 1,
    people
  };

  saveWorld();
  renderWorld();
  updateStats();
  showScreen("worldScreen");
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(screenId);

  if (!target) return;

  target.classList.add("active");

  state.previousScreen = state.currentScreen;
  state.currentScreen = screenId;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function goBack() {
  if (state.currentScreen === "personScreen") {
    showScreen("worldScreen");
    return;
  }

  if (state.currentScreen === "worldScreen") {
    showScreen("homeScreen");
    return;
  }

  showScreen("homeScreen");
}

function renderWorld() {
  if (!state.world) return;

  const map = document.getElementById("worldMap");
  const list = document.getElementById("peopleList");

  map.innerHTML = "";
  list.innerHTML = "";

  state.world.people.forEach(person => {

    const dot = document.createElement("button");

    dot.className = "person-dot";
    dot.textContent = "👤";
    dot.style.left = person.x + "%";
    dot.style.top = person.y + "%";
    dot.title = person.name;

    dot.addEventListener("click", () => {
      openPerson(person.id);
    });

    map.appendChild(dot);

    const row = document.createElement("button");

    row.className = "person-row";

    row.innerHTML = `
      <div class="avatar">👤</div>

      <div class="person-info">
        <strong>${person.name}</strong>
        <small>
          ${person.age} years old • ${person.job}
        </small>
      </div>
    `;

    row.addEventListener("click", () => {
      openPerson(person.id);
    });

    list.appendChild(row);
  });

  document.getElementById("peopleCount").textContent =
    state.world.people.length;

  document.getElementById("worldDay").textContent =
    "Day " + state.world.day;

  document.getElementById("worldStatus").textContent =
    "World active • Day " + state.world.day;
}

function openPerson(id) {
  const person = state.world.people.find(
    p => p.id === id
  );

  if (!person) return;

  state.selectedPerson = person;

  const profile =
    document.getElementById("personProfile");

  profile.innerHTML = `

    <div class="profile-header">

      <div class="profile-avatar">
        👤
      </div>

      <div>
        <h3>${person.name}</h3>
        <p>${person.age} years old</p>
      </div>

    </div>

    <div class="profile-grid">

      <div class="profile-stat">
        <span>💼 Job</span>
        <strong>${person.job}</strong>
      </div>

      <div class="profile-stat">
        <span>😊 Happiness</span>
        <strong>${person.happiness}%</strong>
      </div>

      <div class="profile-stat">
        <span>❤️ Health</span>
        <strong>${person.health}%</strong>
      </div>

      <div class="profile-stat">
        <span>📅 Age</span>
        <strong>${person.age}</strong>
      </div>

    </div>

    <div class="profile-section">

      <h4>🧬 Traits</h4>

      <div class="traits">

        ${person.traits
          .map(trait =>
            `<span class="trait">${trait}</span>`
          )
          .join("")}

      </div>

    </div>

    <div class="profile-section">

      <h4>📜 History</h4>

      <p style="color: var(--muted); line-height: 1.6;">
        ${person.name} was born into the RealSim world
        and is currently living their life on day
        ${state.world.day}.
      </p>

    </div>
  `;

  showScreen("personScreen");
}

function saveWorld() {
  if (!state.world) return;

  localStorage.setItem(
    "realsim_world",
    JSON.stringify(state.world)
  );
}

function loadWorld() {
  const saved = localStorage.getItem(
    "realsim_world"
  );

  if (!saved) return false;

  try {
    state.world = JSON.parse(saved);

    renderWorld();
    updateStats();

    return true;

  } catch (error) {
    console.error(
      "Failed to load RealSim world:",
      error
    );

    return false;
  }
}

function updateStats() {
  if (!state.world) {

    document.getElementById(
      "populationStat"
    ).textContent = "0";

    document.getElementById(
      "dayStat"
    ).textContent = "0";

    document.getElementById(
      "homeStat"
    ).textContent = "0";

    return;
  }

  document.getElementById(
    "populationStat"
  ).textContent =
    state.world.people.length;

  document.getElementById(
    "dayStat"
  ).textContent =
    state.world.day;

  document.getElementById(
    "homeStat"
  ).textContent =
    state.world.people.length;
}

function advanceDay() {
  if (!state.world) return;

  state.world.day++;

  state.world.people.forEach(person => {

    person.happiness += randomNumber(-4, 4);
    person.health += randomNumber(-2, 2);

    person.happiness = Math.max(
      0,
      Math.min(100, person.happiness)
    );

    person.health = Math.max(
      0,
      Math.min(100, person.health)
    );
  });

  saveWorld();
  renderWorld();
  updateStats();
}

document
  .getElementById("createWorldBtn")
  .addEventListener("click", createWorld);

document
  .getElementById("newWorldBtn")
  .addEventListener("click", () => {

    const confirmed = confirm(
      "Create a new world? Your current world will be replaced."
    );

    if (confirmed) {
      createWorld();
    }
  });

document
  .getElementById("saveBtn")
  .addEventListener("click", () => {

    saveWorld();

    alert("🌎 RealSim world saved!");
  });

document
  .getElementById("homeNav")
  .addEventListener("click", () => {
    showScreen("homeScreen");
  });

document
  .getElementById("worldNav")
  .addEventListener("click", () => {

    if (!state.world) {
      alert("Create a world first!");
      return;
    }

    showScreen("worldScreen");
  });

document
  .getElementById("personBackBtn")
  .addEventListener("click", goBack);

document
  .querySelectorAll("[data-back]")
  .forEach(button => {

    button.addEventListener(
      "click",
      goBack
    );
  });

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {
      goBack();
    }

  }
);

const loaded = loadWorld();

if (loaded) {

  document.getElementById(
    "worldStatus"
  ).textContent =
    "Saved world loaded • Day " +
    state.world.day;
}

setInterval(() => {

  if (state.world) {
    advanceDay();
  }

}, 30000);
