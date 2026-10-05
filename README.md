# OBOB 3–5, 2026–27

A reading plan and flip-card deck for the Oregon Battle of the Books elementary list.

There is nothing to type and nothing to sign into. The site has no database, so it keeps no record of anything — reloading the page starts fresh.

## Live site

https://sowmyaaisrinath.github.io/ananya-obob-26-27/

Visit counts (no cookies) are in GoatCounter: https://ananya-obob.goatcounter.com

## Open it locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder.

**Plan** is the reading order, shortest careful read first, plus a split of the list across five readers. Print it and tick the boxes with a pen. There are no due dates, because a group does not all read the same book on the same day.

**Books** has the facts for all 16 titles plus a list of details worth hunting while you read.

**Cards** is the full deck. Tap a card to turn it over. Filter by book, by round, or by how hard the card should feel.

**Battle** deals 16 cards in the real shape: eight "In Which Book," then eight content, each from a different book. Read them aloud, give 15 seconds, keep score on paper.

**Patterns** is what the handbooks and public practice sets show about how real battle questions are written.

## About the answers

Official OBOB question cards are never released, so these are written from the books and from the published summaries. They have not been checked against the official ISBNs, and they carry no page numbers, because pages move between printings. Confirm anything before you use it in a real battle.

Each card is labeled with where it came from: **From the summary** (restates the publisher blurb), **Core plot**, **Smaller detail**, or **Trivia**.

## Adding your own

The site cannot save what you write. Use index cards or a notebook, copy a pattern from the Patterns tab, and note the page number while the book is still open. OBOB asks its own writers for 100 questions a book, half of each kind.

## Deploy to GitHub Pages

This is a static site. The workflow in `.github/workflows/deploy.yml` publishes it the same way as [usa-science-timeline](https://github.com/sowmyaaisrinath/usa-science-timeline), without a build step.

1. Push `main` to GitHub.
2. In the repo **Settings → Pages**, set source to **GitHub Actions**.
3. Every later push to `main` updates the live site.
