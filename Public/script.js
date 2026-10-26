const placesGrid = document.getElementById("placesGrid");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const placeCount = document.getElementById("placeCount");
const categoryFilters = document.getElementById("categoryFilters");

let allPlaces = [];
let selectedCategory = "All";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getIcon(category) {
  const type = String(category || "").toLowerCase();

  if (type.includes("cafe") || type.includes("coffee")) return "☕";
  if (type.includes("fast")) return "🍔";
  if (type.includes("hangout")) return "🎉";
  if (type.includes("restaurant")) return "🍽️";

  return "📍";
}

function getMapsURL(place) {
  const query = [
    place.name,
    place.location,
    "near Kristu Jayanti University, Bengaluru"
  ].filter(Boolean).join(", ");

  return "https://www.google.com/maps/search/?api=1&query="
    + encodeURIComponent(query);
}

function renderPlaces() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = allPlaces.filter(place => {
    const matchesCategory =
      selectedCategory === "All" ||
      String(place.category || "").toLowerCase() ===
        selectedCategory.toLowerCase();

    const searchableText = [
      place.name,
      place.category,
      place.location,
      place.price
    ].join(" ").toLowerCase();

    return matchesCategory && searchableText.includes(query);
  });

  placeCount.textContent =
    `${filtered.length} ${filtered.length === 1 ? "place" : "places"} found`;

  if (!filtered.length) {
    placesGrid.innerHTML = `
      <div class="status-message">
        <h3>No places found</h3>
        <p>Try another search or select a different category.</p>
      </div>`;
    return;
  }

  placesGrid.innerHTML = filtered.map(place => {
    const name = escapeHTML(place.name || "Unnamed place");
    const category = escapeHTML(place.category || "Other");
    const location = escapeHTML(place.location || "Location not provided");
    const price = escapeHTML(place.price || "Price not provided");
    const icon = getIcon(place.category);
    const mapsURL = escapeHTML(getMapsURL(place));

    return `
      <article class="place-card">
        <div class="card-top">
          <div class="place-icon" aria-hidden="true">${icon}</div>
          <span class="category">${category}</span>
        </div>

        <h3>${name}</h3>
        <p class="place-price">${price}</p>

        <div class="card-bottom">
          <span class="location-hint">
            <span aria-hidden="true">📍</span>
            Hover for location
          </span>
          <a class="directions"
             href="${mapsURL}"
             target="_blank"
             rel="noopener noreferrer">
            Directions ↗
          </a>
        </div>

        <div class="location-reveal">
          <strong>📍 PLACE LOCATION</strong>
          <p>${location}</p>
          <a href="${mapsURL}"
             target="_blank"
             rel="noopener noreferrer">
            Open in Google Maps ↗
          </a>
        </div>
      </article>`;
  }).join("");
}

async function loadPlaces() {
  placesGrid.innerHTML =
    '<div class="status-message">Loading places from MongoDB...</div>';

  try {
    const response = await fetch("/api/places");

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("The places API did not return a list.");
    }

    allPlaces = data;
    renderPlaces();
  } catch (error) {
    console.error("Could not load places:", error);

    placeCount.textContent = "Unable to load";

    placesGrid.innerHTML = `
      <div class="status-message">
        <h3>Couldn't load places</h3>
        <p>Check that Node.js and MongoDB are running, then refresh.</p>
        <button class="filter" id="retryButton">Try again</button>
      </div>`;

    document.getElementById("retryButton")
      .addEventListener("click", loadPlaces);
  }
}

searchInput.addEventListener("input", renderPlaces);

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  selectedCategory = "All";

  categoryFilters.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  renderPlaces();
  searchInput.focus();
});

categoryFilters.addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");

  if (!button) return;

  selectedCategory = button.dataset.category;

  categoryFilters.querySelectorAll(".filter").forEach(filter => {
    filter.classList.toggle("active", filter === button);
  });

  renderPlaces();
});

loadPlaces();