import { load, createCountedLoader, catUri, POSTER_BASE } from "./utils.js";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

const loadCountedHighlights = createCountedLoader(async (page) => {
  const res = await load("/movie/popular", { page });
  return res.results;
});

main();

async function main() {
  await initHighlights();
}

////////////////////////////////////////////////////////////////////////////////
// HIGHLIGHTS
////////////////////////////////////////////////////////////////////////////////

async function initHighlights() {
  const $hl = document.querySelector(".highlights__list");

  $hl.innerHTML = await highlightRow();
  $hl.innerHTML += await highlightRow();
  document
    .querySelector("#hl-load-more")
    .addEventListener("click", async () => {
      $hl.innerHTML += await highlightRow();
    });
}

async function highlightRow() {
  const els = await loadCountedHighlights(4);

  function mapHighlight(entry) {
    return highlight({
      id: entry.id,
      imgSrc: catUri(POSTER_BASE, entry.poster_path),
      name: entry.title,
      date: dateFormatter.format(new Date(entry.release_date)),
      avg: entry.vote_average,
    });
  }

  return `
    <div class="row mb-4">${els.map(mapHighlight).join("\n")}</div>
  `;
}

function highlight({ id, name, imgSrc, date, avg }) {
  return `
    <div class="col-lg-3">
      <div class="highlights__film">
        <a href="./detalhes?id=${id}">
          <img
            loading="lazy"
            src="${imgSrc}"
            alt="${name}"
            title="${name}"
          />
        </a>
        <div class="highlights__film-details">
          <a href="./detalhes?id=${id}" class="highlights__film-name">${name}</a>
          <span class="highlights__film-date" title="Lançamento">${date}</span>, <span class="avg"><i class="bi bi-stars"></i> ${avg}/10</span>
        </div>
      </div>
    </div>
    `;
}
