import { createCountedLoader, load, catUri, POSTER_BASE } from "./utils.js";

const pageUrl = new URL(location.href);
const pageQuery = pageUrl.searchParams;

const $d = document.querySelector(".highlights__list");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

const searchLoader = createCountedLoader(async (page) => {
  const res = await load("/search/movie", {
    query: pageQuery.get("query").trim(),
    page,
  });
  return res.results;
});

main().catch((err) => {
  document.querySelector(".highlights__footer").remove();

  $d.innerHTML = `
      <div class="alert alert-danger">
        <h4 class="alert-heading">Erro!</h4>
        <p>Ooops! Aconteceu um erro que a aplicação não foi capaz de responder corretamente.</p>
        <hr>
        <p class="mb-0" style="font-family: monospace;">${err.message}</p>
      </div>
    `;
});

async function main() {
  const query = pageQuery.get("query").trim();
  if (!query) {
    return;
  }

  document
    .querySelectorAll('[name="query"]')
    .forEach((node) => (node.value = query));

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
  const els = await Promise.race([
    searchLoader(4),
    new Promise((resolve) => setTimeout(resolve, 4000)).then(() => {
      throw new Error("Nenhum resultado encontrado em tempo hábil.");
    }),
  ]);

  function mapHighlight(entry) {
    return highlight({
      id: entry.id,
      imgSrc: catUri(POSTER_BASE, entry.poster_path),
      name: entry.title,
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
          </div>
        </div>
      </div>
      `;
}
