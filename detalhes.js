import { BANNER_BASE, catUri, load, POSTER_BASE } from "./utils.js";

const pageUrl = new URL(location.href);
const pageQuery = pageUrl.searchParams;

const $d = document.querySelector("#details");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

main().catch((err) => {
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
  const id = pageQuery.get("id") || "SHOULD-404";
  const data = await load(`/movie/${id}`);

  if (data.success === false) {
    throw new Error(data.status_message);
  }

  const posterUrl = catUri(POSTER_BASE, data.poster_path);
  const bannerUrl = catUri(BANNER_BASE, data.backdrop_path);

  const release = dateFormatter.format(new Date(data.release_date));
  const runt = durationString(data.runtime);

  const countries = data.production_countries
    .map((entry) => `(${entry.iso_3166_1})`)
    .join(" ");

  const genresItems = data.genres
    .map(({ name }) => `<li>${name}</li>`)
    .join("\n");

  $d.innerHTML = `
    <div class="poster-banner" style="background-image: url(${bannerUrl})"></div>
    <div class="container">
      <div class="poster-wrapper">
        <section class="poster">
          <img src="${posterUrl}" alt="${data.title}" />
        </section>
        <div class="details">
          <h1>${data.title}</h1>
          <p class="desc-data">
            ${countries} &middot; ${release} &middot; ${runt}
          </p>
          <p class="overview">${data.overview}</p>
          <p>
            <span class="avg"><i class="bi bi-stars"></i> ${data.vote_average}/10</span>
          </p>
          <ul>${genresItems}</ul>
        </div>
      </div>
    </div>
  `;
}

function durationString(durationMinutes) {
  const hh = Math.floor(durationMinutes / 60);
  const mm = durationMinutes - hh * 60;
  return `${hh}h ${mm}m`;
}
