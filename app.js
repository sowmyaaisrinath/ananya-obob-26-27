const STATE_MEET = new Date(2027, 3, 17);
const HANDBOOK_PER_BOOK = 100;
const RECALL = ["", "Quick", "Gentle", "Steady", "Demanding", "Heavy"];
const LEVELS = {
  jacket: "From the summary",
  local: "Core plot",
  regional: "Smaller detail",
  state: "Trivia"
};
const SLUGS = {
  "end-of-the-world": "its-the-end-of-the-world-and-im-in-my-bathing-suit",
  "family-fletcher": "misadventures-of-the-family-fletcher"
};

/* Nothing here is saved. Reloading the page starts over, which is the point:
   there is no database behind this site. */
const view = { tab: "plan", book: "all", type: "all", level: "all", battle: [] };

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[ch]));
}

function bookById(id) {
  return BOOKS.find((book) => book.id === id);
}

function byline(book) {
  return book.authors.join(" and ");
}

function slugOf(book) {
  return SLUGS[book.id] || book.id;
}

function wordsOf(book) {
  if (book.wordCount) return { n: book.wordCount, estimated: !!book.wordCountEstimated };
  if (book.format === "graphic") return { n: null, estimated: true };
  return { n: book.pages * (book.wordsPerPage || 230), estimated: true };
}

function paceFor(ar) {
  if (ar >= 5.5) return 100;
  if (ar >= 5) return 120;
  if (ar >= 4) return 140;
  return 160;
}

function minutesOf(book) {
  if (book.format === "graphic") return Math.round(book.pages * 1.5);
  return Math.round(wordsOf(book).n / paceFor(book.ar));
}

function fmtMin(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return m + " min";
  if (m === 0) return h + " hr";
  return h + " hr " + m + " min";
}

function daysUntil(date) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(0, 0, 0, 0);
  return Math.round((end - start) / 86400000);
}

function cardsFor(bookId) {
  return QUESTIONS.filter((item) => item.bookId === bookId);
}

function isContent(item) {
  return item.type !== "iwb";
}

function answerOf(item) {
  const book = bookById(item.bookId);
  if (item.type === "iwb") return book.title + " by " + byline(book);
  if (item.parts) return item.parts.join(" AND ");
  return [item.answer, ...(item.alternates || [])].filter(Boolean).join(" OR ");
}

function kindOf(item) {
  if (item.type === "iwb") return "In Which Book";
  if (item.type === "two-part") return "Content · two parts";
  return "Content";
}

function orderedBooks() {
  return BOOKS.slice().sort((a, b) => minutesOf(a) - minutesOf(b));
}

function totalMinutes() {
  return BOOKS.reduce((sum, book) => sum + minutesOf(book), 0);
}

function splitReaders(n) {
  const piles = Array.from({ length: n }, (_, index) => ({
    name: "Reader " + (index + 1),
    minutes: 0,
    books: []
  }));
  BOOKS.map((book) => ({ book, minutes: minutesOf(book) }))
    .sort((a, b) => b.minutes - a.minutes)
    .forEach((item) => {
      let lightest = 0;
      piles.forEach((pile, index) => {
        if (pile.minutes < piles[lightest].minutes) lightest = index;
      });
      piles[lightest].books.push(item.book);
      piles[lightest].minutes += item.minutes;
    });
  return piles;
}

function shuffle(list) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function buildBattle() {
  const usable = shuffle(BOOKS.filter((book) =>
    QUESTIONS.some((item) => item.bookId === book.id && item.type === "iwb") &&
    QUESTIONS.some((item) => item.bookId === book.id && isContent(item))
  ));
  const picked = [];
  usable.slice(0, 8).forEach((book) => {
    const choice = shuffle(QUESTIONS.filter((item) => item.bookId === book.id && item.type === "iwb"))[0];
    if (choice) picked.push(choice);
  });
  usable.slice(8, 16).forEach((book) => {
    const choice = shuffle(QUESTIONS.filter((item) => item.bookId === book.id && isContent(item)))[0];
    if (choice) picked.push(choice);
  });
  view.battle = picked;
}

function render() {
  document.getElementById("app").innerHTML = `
    <div class="app">
      <header class="mast">
        <div>
          <p class="kicker">Oregon Battle of the Books · grades 3–5 · 2026–27</p>
          <h1>Read the list. Flip the cards.</h1>
          <p class="lede">Sixteen books, a careful-read plan, and ${QUESTIONS.length} practice cards in the two rounds a real battle uses. Tap a card to turn it over.</p>
        </div>
        <div class="scorebox">
          <strong>${QUESTIONS.length}</strong>
          <span>cards, answers on the back</span>
        </div>
      </header>
      <nav class="noprint">
        ${navButton("plan", "Plan")}
        ${navButton("books", "Books")}
        ${navButton("cards", "Cards")}
        ${navButton("battle", "Battle")}
        ${navButton("patterns", "Patterns")}
      </nav>
      ${body()}
      <p class="foot">Book facts from <a href="https://obob.dog/books/2026-2027/3-5">OBOB.dog</a> and the ISBN list posted by the <a href="https://cedarmillptc.org/oregon-battle-of-the-books">Cedar Mill PTC</a>. Battle rules from the <a href="https://www.oregonbattleofthebooks.org/wp-content/uploads/2024/11/Handbook-2024-2025.pdf">OBOB handbook</a>. Official battle cards are not public, and these answers have not been checked against the official printings. Confirm anything before you use it in a real battle.</p>
    </div>`;
  bind();
}

function navButton(id, label) {
  return `<button type="button" data-action="tab" data-tab="${id}" class="${view.tab === id ? "active" : ""}">${label}</button>`;
}

function body() {
  if (view.tab === "books") return renderBooks();
  if (view.tab === "cards") return renderCards();
  if (view.tab === "battle") return renderBattle();
  if (view.tab === "patterns") return renderPatterns();
  return renderPlan();
}

function renderPlan() {
  const total = totalMinutes();
  const stateDays = daysUntil(STATE_MEET);
  const piles = splitReaders(5);
  const share = Math.round(total / piles.length);
  const rows = orderedBooks().map((book, index) => `<tr>
      <td><span class="tick"></span></td>
      <td>${index + 1}</td>
      <td><strong>${esc(book.title)}</strong><br><span class="sub">${esc(byline(book))}</span></td>
      <td>${RECALL[book.recall]}</td>
      <td>${book.pages}</td>
      <td>${Number(book.ar).toFixed(1)}</td>
      <td>${book.lexile || "—"}</td>
      <td>${fmtMin(minutesOf(book))}</td>
      <td>${cardsFor(book.id).length}</td>
    </tr>`).join("");
  const pileCards = piles.map((pile) => `
    <article class="card">
      <h3>${esc(pile.name)}</h3>
      <p class="meta">${fmtMin(pile.minutes)} · ${pile.books.length} books</p>
      <ul>${pile.books.map((book) => `<li>${esc(book.title)} <span class="sub">(${fmtMin(minutesOf(book))})</span></li>`).join("")}</ul>
    </article>`).join("");
  return `
    <section class="grid">
      <div class="stat"><b>16</b><span>books on the 3–5 list</span></div>
      <div class="stat"><b>${fmtMin(total)}</b><span>careful reading for the whole list</span></div>
      <div class="stat"><b>${fmtMin(share)}</b><span>about this much if five readers split the hours</span></div>
      <div class="stat"><b>${QUESTIONS.length}</b><span>practice cards, ${Math.round(QUESTIONS.length / BOOKS.length)} a book on average</span></div>
    </section>
    <p class="note">The state tournament listed by the Cedar Mill PTC is April 17, 2027, at Chemeketa Community College${stateDays > 0 ? ", " + stateDays + " days from today" : ""}. That day count is figured from today's date whenever you open the page, so it stays current. School battles come earlier and depend on the school.</p>
    <div class="row noprint" style="margin-bottom:14px">
      <button type="button" class="btn" data-action="print">Print this plan</button>
      <span class="sub">Print it and tick the boxes with a pen. The site itself keeps no record.</span>
    </div>
    <h2>Reading order</h2>
    <p class="sub">Shortest careful read first, so the habit starts before the long fantasies. Recall is how hard a book is to master for questions, which is a different thing from how long it takes to read.</p>
    <div class="scroll"><table>
      <thead><tr><th>Done</th><th>#</th><th>Book</th><th>Recall</th><th>Pages</th><th>AR</th><th>Lexile</th><th>Careful read</th><th>Cards</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <h2 style="margin-top:26px">If five readers split the list</h2>
    <p class="sub">Balanced by hours, not by book count, so nobody gets all the long ones. A group of four can fold Reader 5's books into the lighter piles.</p>
    <div class="cards">${pileCards}</div>
    <details class="noprint">
      <summary>How the hours are estimated</summary>
      <p>Graphic novels use 1.5 minutes a page. Dogtown uses its published count of 26,008 words. Frindle uses 155 words a page because the type is large. Other prose uses 230 words a page, which is an estimate. The pace is a careful OBOB read, slower on harder books: 160 words a minute under AR 4, 140 from 4.0 to 4.9, 120 from 5.0 to 5.4, and 100 at 5.5 and above. These are planning numbers, not a measurement of any particular reader.</p>
    </details>`;
}

function renderBooks() {
  const cards = orderedBooks().map((book) => {
    const mine = cardsFor(book.id);
    const iwb = mine.filter((item) => item.type === "iwb").length;
    const content = mine.length - iwb;
    const words = wordsOf(book);
    return `<article class="card d${book.recall}">
      <div class="badges">
        <span class="badge">${RECALL[book.recall]} recall</span>
        ${book.studentVote ? '<span class="badge vote">Student vote winner</span>' : ""}
        ${book.authors.length > 1 ? '<span class="badge">Both authors required</span>' : ""}
        <span class="badge">${esc(book.genre)}</span>
      </div>
      <h3>${esc(book.title)}</h3>
      <p class="meta">${esc(byline(book))} · ISBN ${esc(book.isbn)} · ${book.pages} pages${book.chapters ? " · " + book.chapters + " chapters" : ""} · AR ${Number(book.ar).toFixed(1)}${book.lexile ? " · Lexile " + esc(book.lexile) : ""}</p>
      <p>${esc(book.blurb)}</p>
      <p class="meta">${fmtMin(minutesOf(book))} careful read${words.n ? " · about " + words.n.toLocaleString() + " words" + (words.estimated ? " (estimated)" : "") : ""}${book.spanishTitle ? " · Spanish edition: " + esc(book.spanishTitle) : ""}</p>
      <p>${esc(book.recallWhy)}</p>
      ${book.authorNote ? `<p class="warn">${esc(book.authorNote)}</p>` : ""}
      ${book.editionNote ? `<p class="note">${esc(book.editionNote)}</p>` : ""}
      ${book.arNote ? `<p class="meta">${esc(book.arNote)}</p>` : ""}
      <p class="meta"><strong>${mine.length} cards here</strong> — ${iwb} In Which Book, ${content} content. OBOB question writers build ${HANDBOOK_PER_BOOK} per book.</p>
      <div class="row noprint">
        <button type="button" class="btn small" data-action="see-cards" data-book="${book.id}">See the cards</button>
        <a href="https://obob.dog/books/2026-2027/3-5/${slugOf(book)}">Book page</a>
      </div>
      <details>
        <summary>Details to hunt while reading</summary>
        <ul>${book.hunts.map((hunt) => `<li>${esc(hunt)}</li>`).join("")}</ul>
      </details>
    </article>`;
  }).join("");
  return `<h2>The 16 books</h2><p class="sub">Ordered from the shortest careful read to the longest.</p><div class="cards">${cards}</div>`;
}

function renderCards() {
  const shown = QUESTIONS.filter((item) => {
    if (view.book !== "all" && item.bookId !== view.book) return false;
    if (view.type === "iwb" && item.type !== "iwb") return false;
    if (view.type === "content" && item.type === "iwb") return false;
    if (view.type === "two-part" && item.type !== "two-part") return false;
    if (view.level !== "all" && item.level !== view.level) return false;
    return true;
  });
  return `
    <h2>Flip cards</h2>
    <p class="sub">${shown.length} showing. Tap a card to turn it over. Nothing is saved, so a reload brings every card back face up.</p>
    <div class="filters noprint">
      <div class="pills"><span class="pill-label">Book</span>
        ${pill("book", "all", "All")}
        ${orderedBooks().map((book) => pill("book", book.id, book.title)).join("")}
      </div>
      <div class="pills"><span class="pill-label">Round</span>
        ${pill("type", "all", "All")}
        ${pill("type", "iwb", "In Which Book")}
        ${pill("type", "content", "Content")}
        ${pill("type", "two-part", "Two-part")}
      </div>
      <div class="pills"><span class="pill-label">Kind</span>
        ${pill("level", "all", "All")}
        ${Object.entries(LEVELS).map(([id, label]) => pill("level", id, label)).join("")}
      </div>
    </div>
    <div class="row noprint" style="margin-bottom:14px">
      <button type="button" class="ghost" data-action="flip-all">Turn them all over</button>
      <button type="button" class="ghost" data-action="flip-none">Turn them all back</button>
      <button type="button" class="ghost" data-action="print">Print these cards</button>
    </div>
    ${shown.length ? `<div class="deck">${shown.map(flipCard).join("")}</div>` : `<p class="note">No cards match that combination. Try a wider filter.</p>`}`;
}

function pill(group, value, label) {
  const on = view[group] === value;
  return `<button type="button" class="pill ${on ? "on" : ""}" data-action="filter" data-group="${group}" data-value="${esc(value)}">${esc(label)}</button>`;
}

function flipCard(item) {
  const book = bookById(item.bookId);
  return `<button type="button" class="flip" data-action="flip" aria-label="Flip card">
    <span class="flip-inner">
      <span class="face front">
        <span class="badges">
          <span class="badge">${kindOf(item)}</span>
          <span class="badge">${LEVELS[item.level]}</span>
        </span>
        <span class="prompt-sm">${esc(item.prompt)}</span>
        <span class="hint">${item.type === "iwb" ? "Answer with the title and the author" : esc(book.title)}</span>
      </span>
      <span class="face back">
        <span class="badges"><span class="badge">${kindOf(item)}</span></span>
        <span class="prompt-sm">${esc(answerOf(item))}</span>
        <span class="hint">${item.type === "iwb" ? "Title 3 points, author 2" : item.parts ? "3 points for one part, 2 for the other" : "5 points, all or nothing"}</span>
      </span>
    </span>
  </button>`;
}

function renderBattle() {
  if (!view.battle.length) {
    return `
      <h2>Practice battle</h2>
      <p class="sub">A full set is 16 cards: eight “In Which Book,” then eight content, each from a different book. That is the shape the public library practice sets use. A real battle may ask about one book twice and skip another.</p>
      <p class="note">Read the card aloud, give the team 15 seconds, then tap to turn it over. Keep score on paper. “In Which Book” is 5 points for the title and author together, 3 for whichever part comes first. Content is 5 points, all or nothing, unless the card says two parts.</p>
      <button type="button" class="btn" data-action="new-battle">Deal a 16-card set</button>`;
  }
  const iwb = view.battle.filter((item) => item.type === "iwb");
  const content = view.battle.filter(isContent);
  return `
    <h2>Practice battle</h2>
    <p class="sub">${view.battle.length} cards. Read them in this order.</p>
    <div class="row noprint" style="margin-bottom:14px">
      <button type="button" class="btn" data-action="new-battle">Deal a new set</button>
      <button type="button" class="ghost" data-action="flip-all">Turn them all over</button>
      <button type="button" class="ghost" data-action="flip-none">Turn them all back</button>
      <button type="button" class="ghost" data-action="print">Print this set</button>
    </div>
    <h3>Round one — In Which Book <span class="sub">(${iwb.length})</span></h3>
    <div class="deck">${iwb.map(flipCard).join("")}</div>
    <h3 style="margin-top:22px">Round two — Content <span class="sub">(${content.length})</span></h3>
    <div class="deck">${content.map(flipCard).join("")}</div>`;
}

function renderPatterns() {
  return `
    <h2>What seven seasons of battles ask</h2>
    <p class="note">Official question cards from regionals and state are not released. What repeats, in the handbooks from 2019–20 through 2024–25 and in the public practice sets still online, is the shape below. The 2021–22 through 2023–24 practice PDFs are mostly offline now, but their handbooks kept the same battle.</p>
    <ul class="sources">${PATTERNS.sources.map((source) => `<li><strong>${esc(source.label)}.</strong> ${esc(source.detail)}${source.url ? ` <a href="${esc(source.url)}">Source</a>` : ""}</li>`).join("")}</ul>
    <h2>Scoring</h2>
    <ul>${PATTERNS.scoring.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
    <h2>In Which Book</h2>
    ${PATTERNS.iwb.map(patternCard).join("")}
    <h2>Content</h2>
    ${PATTERNS.content.map(patternCard).join("")}
    <h2>Leave these out</h2>
    <ul>${PATTERNS.avoid.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
    <h2>Writing your own</h2>
    <p>This site has no way to save what you type, so write new questions on index cards or in a notebook. Copy a pattern above, use one detail from the page in front of you, and note the page number while the book is still open. The handbook asks its writers for ${HANDBOOK_PER_BOOK} questions a book, half of each kind, drawn from every part of the story.</p>`;
}

function patternCard(item) {
  return `<article class="pattern"><h3>${esc(item.label)}</h3><p>${esc(item.hint)}</p><p class="model">${esc(item.model)}</p><p class="meta">${esc(item.source)}</p></article>`;
}

function bind() {
  document.getElementById("app").onclick = (event) => {
    const flip = event.target.closest(".flip");
    if (flip) {
      flip.classList.toggle("on");
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "tab") {
      view.tab = target.dataset.tab;
      render();
      window.scrollTo(0, 0);
    }
    if (action === "see-cards") {
      view.tab = "cards";
      view.book = target.dataset.book;
      view.type = "all";
      view.level = "all";
      render();
      window.scrollTo(0, 0);
    }
    if (action === "filter") {
      view[target.dataset.group] = target.dataset.value;
      render();
    }
    if (action === "flip-all") {
      document.querySelectorAll(".flip").forEach((card) => card.classList.add("on"));
    }
    if (action === "flip-none") {
      document.querySelectorAll(".flip").forEach((card) => card.classList.remove("on"));
    }
    if (action === "new-battle") {
      buildBattle();
      render();
      window.scrollTo(0, 0);
    }
    if (action === "print") window.print();
  };
}

render();
