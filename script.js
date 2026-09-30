const state = {
  world: null,
  currentScreen: "homeScreen",
  selectedPerson: null,
  placingPerson: false
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

/*
  Simple procedural terrain generator.

  Each cell receives several layers of smooth-ish
  random values. Combining them creates natural-looking
  islands instead of random square blobs.
*/
function generateTerrain(width = 70, height = 45) {

  const terrain = [];

  const seed = Math.random() * 10000;

  function noise(x, y) {

    const value =
      Math.sin(
        x * 0.13 +
        Math.sin(y * 0.17 + seed)
      ) *
      Math.cos(
        y * 0.11 +
        Math.sin(x * 0.09 + seed)
      );

    return (value + 1) / 2;
  }

  for (let y = 0; y < height; y++) {

    const row = [];

    for (let x = 0; x < width; x++) {

      const nx = x / width;
      const ny = y / height;

      const edge =
        Math.min(
          nx,
          ny,
          1 - nx,
          1 - ny
        );

      const large =
        noise(x * 0.8, y * 0.8);

      const medium =
        noise(x * 1.8 + 50, y * 1.8 + 50);

      const small =
        noise(x * 4 + 100, y * 4 + 100);

      let elevation =
        large * 0.55 +
        medium * 0.3 +
        small * 0.15;

      /*
        Push the edges toward water.
        This creates island-like continents.
      */
      elevation += edge * 0.18;

      let type = "water";

      if (elevation > 0.58) {
        type = "grass";
      }

      if (elevation > 0.72) {
        type = "forest";
      }

      if (elevation > 0.84) {
        type = "mountain";
      }

      if (elevation > 0.48 && elevation <= 0.58) {
        type = "sand";
      }

      row.push(type);
    }

    terrain.push(row);
  }

  return {
    width,
    height,
    cells: terrain
  };
}

function isLand(x, y) {

  if (!state.world) return false;

  const tx = Math.floor(
    (x / 100) * state.world.terrain.width
  );

  const ty = Math.floor(
    (y / 100) * state.world.terrain.height
  );

  if (
    tx < 0 ||
    ty < 0 ||
    tx >= state.world.terrain.width ||
    ty >= state.world.terrain.height
  ) {
    return false;
  }

  const type =
    state.world.terrain.cells[ty][tx];

  return type !== "water";
}

function terrainColor(type) {

  switch (type) {

    case "water":
      return "#2879b8";

    case "sand":
      return "#d8c27a";

    case "grass":
      return "#5d9b52";

    case "forest":
      return "#326b42";

    case "mountain":
      return "#7d827c";

    default:
      return "#2879b8";
  }
}

function renderTerrain() {

  const map =
    document.getElementById("worldMap");

  map.querySelector(".terrain")?.remove();

  const canvas =
    document.createElement("canvas");

  canvas.className = "terrain";

  canvas.width = state.world.terrain.width;
  canvas.height = state.world.terrain.height;

  const ctx = canvas.getContext("2d");

  for (
    let y = 0;
    y < state.world.terrain.height;
    y++
  ) {

    for (
      let x = 0;
      x < state.world.terrain.width;
      x++
    ) {

      const type =
        state.world.terrain.cells[y][x];

      ctx.fillStyle =
        terrainColor(type);

      ctx.fillRect(x, y, 1, 1);
    }
  }

  map.appendChild(canvas);
}

function createPerson(x = null, y = null) {

  if (!state.world) return null;

  let px = x;
  let py = y;

  if (px === null || py === null) {

    let attempts = 0;

    do {

      px = randomNumber(5, 95);
      py = randomNumber(5, 95);

      attempts++;

    } while (
      !isLand(px, py) &&
      attempts < 100
    );

    if (attempts >= 100) {
      return null;
    }
  }

  return {

    id:
      crypto.randomUUID(),

    name:
      randomItem(firstNames) +
      " " +
      randomItem(lastNames),

    age:
      randomNumber(8, 75),

    job:
      randomItem(jobs),

    traits:
      randomTraits(),

    x: px,
    y: py,

    happiness:
      randomNumber(40, 95),

    health:
      randomNumber(50, 100),

    relationships: []
  };
}

function createWorld() {

  const terrain =
    generateTerrain();

  state.world = {

    day: 1,

    terrain,

    people: []
  };

  /*
    Start with a small population.
    Every person is placed on land.
  */
  for (let i = 0; i < 18; i++) {

    const person =
      createPerson();

    if (person) {
      state.world.people.push(person);
    }
  }

  saveWorld();

  renderWorld();

  updateStats();

  showScreen("worldScreen");
}

function showScreen(screenId) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.remove("active");
    });

  const target =
    document.getElementById(screenId);

  if (!target) return;

  target.classList.add("active");

  state.currentScreen =
    screenId;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function goBack() {

  if (
    state.currentScreen ===
    "personScreen"
  ) {

    showScreen("worldScreen");

    return;
  }

  if (
    state.currentScreen ===
    "worldScreen"
  ) {

    showScreen("homeScreen");

    return;
  }

  showScreen("homeScreen");
}

function renderWorld() {

  if (!state.world) return;

  const map =
    document.getElementById("worldMap");

  const list =
    document.getElementById("peopleList");

  map
    .querySelectorAll(".person-dot")
    .forEach(dot => dot.remove());

  list.innerHTML = "";

  renderTerrain();

  state.world.people.forEach(person => {

    const dot =
      document.createElement("button");

    dot.className = "person-dot";

    dot.textContent = "👤";

    dot.style.left =
      person.x + "%";

    dot.style.top =
      person.y + "%";

    dot.title =
      person.name;

    dot.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        openPerson(person.id);
      }
    );

    map.appendChild(dot);

    const row =
      document.createElement("button");

    row.className =
      "person-row";

    row.innerHTML = `
      <div class="avatar">
        👤
      </div>

      <div class="person-info">

        <strong>
          ${person.name}
        </strong>

        <small>
          ${person.age}
          years old •
          ${person.job}
        </small>

      </div>
    `;

    row.addEventListener(
      "click",
      () => openPerson(person.id)
    );

    list.appendChild(row);
  });

  document.getElementById(
    "peopleCount"
  ).textContent =
    state.world.people.length;

  document.getElementById(
    "worldDay"
  ).textContent =
    "Day " + state.world.day;

  document.getElementById(
    "worldStatus"
  ).textContent =
    "World active • Day " +
    state.world.day;
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
      "landStat"
    ).textContent = "0%";

    return;
  }

  const cells =
    state.world.terrain.cells;

  let land = 0;
  let total = 0;

  cells.forEach(row => {

    row.forEach(type => {

      total++;

      if (type !== "water") {
        land++;
      }
    });
  });

  const landPercent =
    Math.round(
      (land / total) * 100
    );

  document.getElementById(
    "populationStat"
  ).textContent =
    state.world.people.length;

  document.getElementById(
    "dayStat"
  ).textContent =
    state.world.day;

  document.getElementById(
    "landStat"
  ).textContent =
    landPercent + "%";
}

function openPerson(id) {

  const person =
    state.world.people.find(
      p => p.id === id
    );

  if (!person) return;

  state.selectedPerson =
    person;

  const profile =
    document.getElementById(
      "personProfile"
    );

  profile.innerHTML = `

    <div class="profile-header">

      <div class="profile-avatar">
        👤
      </div>

      <div>

        <h3>
          ${person.name}
        </h3>

        <p>
          ${person.age} years old
        </p>

      </div>

    </div>

    <div class="profile-grid">

      <div class="profile-stat">
        <span>💼 Job</span>
        <strong>
          ${person.job}
        </strong>
      </div>

      <div class="profile-stat">
        <span>😊 Happiness</span>
        <strong>
          ${person.happiness}%
        </strong>
      </div>

      <div class="profile-stat">
        <span>❤️ Health</span>
        <strong>
          ${person.health}%
        </strong>
      </div>

      <div class="profile-stat">
        <span>📅 Age</span>
        <strong>
          ${person.age}
        </strong>
      </div>

    </div>

    <div class="profile-section">

      <h4>🧬 Traits</h4>

      <div class="traits">

        ${person.traits
          .map(
            trait =>
              `<span class="trait">
                ${trait}
              </span>`
          )
          .join("")}

      </div>

    </div>

    <div class="profile-section">

      <h4>📍 Location</h4>

      <p style="
        color: var(--muted);
        line-height: 1.6;
      ">

        X: ${Math.round(person.x)}%
        <br>

        Y: ${Math.round(person.y)}%

      </p>

    </div>

    <div class="profile-section">

      <h4>📜 History</h4>

      <p style="
        color: var(--muted);
        line-height: 1.6;
      ">

        ${person.name}
        is currently living in
        the RealSim world on
        day ${state.world.day}.

      </p>

    </div>
  `;

  showScreen("personScreen");
}

function startAddingPerson() {

  if (!state.world) return;

  state.placingPerson = true;

  const map =
    document.getElementById(
      "worldMap"
    );

  map.classList.add("placing");

  document.getElementById(
    "placementStatus"
  ).textContent =
    "Tap a land area to place the person.";
}

function stopAddingPerson() {

  state.placingPerson = false;

  document
    .getElementById("worldMap")
    .classList.remove("placing");

  document.getElementById(
    "placementStatus"
  ).textContent =
    "Click Add Person to place someone.";
}

function handleMapClick(event) {

  if (!state.placingPerson) return;

  const map =
    document.getElementById(
      "worldMap"
    );

  const rect =
    map.getBoundingClientRect();

  const x =
    ((event.clientX - rect.left) /
      rect.width) *
    100;

  const y =
    ((event.clientY - rect.top) /
      rect.height) *
    100;

  if (!isLand(x, y)) {

    document.getElementById(
      "placementStatus"
    ).textContent =
      "🌊 That's water. Pick a land area.";

    return;
  }

  const person =
    createPerson(x, y);

  if (!person) return;

  state.world.people.push(
    person
  );

  saveWorld();

  renderWorld();

  updateStats();

  stopAddingPerson();

  openPerson(person.id);
}

function saveWorld() {

  if (!state.world) return;

  localStorage.setItem(
    "realsim_world",
    JSON.stringify(
      state.world
    )
  );
}

function loadWorld() {

  const saved =
    localStorage.getItem(
      "realsim_world"
    );

  if (!saved) return false;

  try {

    state.world =
      JSON.parse(saved);

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

function advanceDay() {

  if (!state.world) return;

  state.world.day++;

  state.world.people.forEach(
    person => {

      person.happiness +=
        randomNumber(-4, 4);

      person.health +=
        randomNumber(-2, 2);

      person.happiness =
        Math.max(
          0,
          Math.min(
            100,
            person.happiness
          )
        );

      person.health =
        Math.max(
          0,
          Math.min(
            100,
            person.health
          )
        );
    }
  );

  saveWorld();

  renderWorld();

  updateStats();
}

document
  .getElementById("createWorldBtn")
  .addEventListener(
    "click",
    createWorld
  );

document
  .getElementById("newWorldBtn")
  .addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "Create a new world? Your current world will be replaced."
        );

      if (confirmed) {
        createWorld();
      }
    }
  );

document
  .getElementById("saveBtn")
  .addEventListener(
    "click",
    () => {

      saveWorld();

      alert(
        "🌎 RealSim world saved!"
      );
    }
  );

document
  .getElementById("addPersonBtn")
  .addEventListener(
    "click",
    startAddingPerson
  );

document
  .getElementById("worldMap")
  .addEventListener(
    "click",
    handleMapClick
  );

document
  .getElementById("homeNav")
  .addEventListener(
    "click",
    () => {
      showScreen("homeScreen");
    }
  );

document
  .getElementById("worldNav")
  .addEventListener(
    "click",
    () => {

      if (!state.world) {

        alert(
          "Create a world first!"
        );

        return;
      }

      showScreen(
        "worldScreen"
      );
    }
  );

document
  .getElementById("personBackBtn")
  .addEventListener(
    "click",
    goBack
  );

document
  .querySelectorAll(".back-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      goBack
    );
  });

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {
      goBack();
    }
  }
);

const loaded =
  loadWorld();

if (loaded) {

  document.getElementById(
    "worldStatus"
  ).textContent =
    "Saved world loaded • Day " +
    state.world.day;
}

setInterval(
  () => {

    if (state.world) {
      advanceDay();
    }

  },
  30000
);
