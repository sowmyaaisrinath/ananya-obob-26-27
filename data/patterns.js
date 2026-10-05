/* How OBOB battles actually ask questions, from the official handbook and
   public elementary practice sets. Official state cards are not published. */
const PATTERNS = {
  sources: [
    {
      label: "OBOB handbook, question-writing section",
      detail: "Each book is written to 100 questions: 50 “In Which Book” and 50 content, from all parts of the book. Questions stay short and specific. They get more trivial from local to state. The moderator’s card has the answer and a page.",
      url: "https://www.oregonbattleofthebooks.org/wp-content/uploads/2024/11/Handbook-2024-2025.pdf"
    },
    {
      label: "Same battle shape across the last seven seasons",
      detail: "Handbooks from 2019-20 through 2024-25 keep one shape: 16 questions in a normal battle, 8 “In Which Book” read first, then 8 content. Pool play is four battles. Seeding uses total points. Grades 3-5 have no steals in pool play. Knockout rounds allow steals. The Round to Go and the state final are 32 questions, 16 of each type. Teams get 15 seconds. A normal pronunciation of a hard name still scores."
    },
    {
      label: "Public practice battles, 2025-26 grades 3-5",
      detail: "Cedar Mill & Bethany sets, also posted by Newberg Public Library. Sets 2, 4, 10, and 11 each use all 16 books once: eight “In which book,” then eight content. That is a practice-set habit. The handbook says a real battle may hit the same book more than once and skip others.",
      url: "https://library.cedarmill.org/kids/obob/"
    },
    {
      label: "2024-25 elementary practice wording",
      detail: "Jackson County Library Services posted an “In Which Book” and content practice sheet for that year’s 3-5 list. Same two shapes: a unique concrete clue with no title, then a short fact asked inside a named book.",
      url: "https://jcls.org/wp-content/uploads/2024/08/Practice-Questions.pdf"
    },
    {
      label: "2019-20 handbook samples and a 2020-21 school practice page",
      detail: "The samples that have stayed in the handbook are scene clues (“a postcard with a skyscraper,” “saving money to buy a gorilla”) and two-part content joined by AND. School practice lists from 2020-21, such as Front Desk sheets, are the same kind of clue written by coaches: one odd detail, one book."
    }
  ],
  scoring: [
    "Every question is worth 5 points.",
    "“In Which Book” is answered with the title and the author, as printed on the official list. The first correct piece scores 3. The other piece scores 2. In a steal round the other team may take those 2.",
    "Dropping a starting A, An, or The is accepted. Adding one that is not in the title is wrong. “The Frindle” would miss.",
    "Two authors must both be said. Order does not matter. A second author on a one-author book is wrong.",
    "Content scores 5 for the whole answer. Partial credit exists only when the card says it is a two-part question: 3 for the first correct part and 2 for the other.",
    "Asking for a full name, or a city and a state, is not a two-part question unless the card says so. Miss any piece and the score is 0.",
    "Grades 3-5 pool play does not pass a miss to the other team. Knockout battles do."
  ],
  iwb: [
    {
      id: "action",
      label: "One specific action",
      hint: "Somebody does one odd thing. Food, a craft project, and a small errand show up constantly.",
      model: "In which book does a character build a wooden raft?",
      source: "2025-26 practice set 4"
    },
    {
      id: "object",
      label: "One object",
      hint: "A tattoo, a car, a toy, a pencil, a banner. If two books could contain it, add one more detail or throw it out.",
      model: "In which book does a character have an artificial leg?",
      source: "2025-26 practice set 11"
    },
    {
      id: "name",
      label: "A proper name",
      hint: "A minor person, an animal, a shop, or a place. Middle names and nicknames are favorites.",
      model: "In which book is there a parrot named Fletcher?",
      source: "2025-26 practice set 2"
    },
    {
      id: "quote",
      label: "A short quote or thought",
      hint: "One sentence a character says or thinks. Keep it short enough to read aloud once.",
      model: "In which book does a character say, “At least the moon remains unchanged.”",
      source: "2025-26 practice set 11"
    },
    {
      id: "number",
      label: "A number",
      hint: "An age, a count, a price, a date, a jersey, a room number.",
      model: "In which book does a character have nine siblings?",
      source: "2025-26 practice set 10"
    },
    {
      id: "setting",
      label: "A setting clue",
      hint: "Name the place the way the book names it, not “at school.”",
      model: "In which book is the setting Hickory Valley?",
      source: "2025-26 practice set 11"
    },
    {
      id: "paratext",
      label: "A note outside the story",
      hint: "Author’s notes, maps, and end puzzles are fair game except on titles OBOB treats as classics, where writers stay in the original text.",
      model: "In which book is there an author’s note prompting the reader to solve a puzzle that was not in the story?",
      source: "2025-26 practice set 4"
    }
  ],
  content: [
    {
      id: "who",
      label: "Who or what is the name",
      hint: "If you want the full name, the card must say so, and it still scores all-or-nothing unless you mark it two-part.",
      model: "In Elf Dog and Owl Head, what is the name of Clay’s best friend?",
      source: "2025-26 practice set 2"
    },
    {
      id: "number",
      label: "How many, what color, what date",
      hint: "The answer should be a few words, not a sentence of explanation.",
      model: "In The Lost Library, what is the date the library burns down?",
      source: "2025-26 practice set 2"
    },
    {
      id: "two-part",
      label: "Two parts, joined by AND",
      hint: "Say “this is a two-part question” before the question. Accept either order for a full score. One correct part is 3 points.",
      model: "Two parts: In The Tail of Emily Windsnap, what are Mr. Beeston’s two jobs?",
      source: "2025-26 practice set 2"
    },
    {
      id: "or",
      label: "Two wordings of one fact",
      hint: "Use OR when the book and a narrator would say the same thing two ways. That is still one answer, not a two-part.",
      model: "In Number the Stars, what is the illegal newspaper called? De Frie Danske OR The Free Danes.",
      source: "2025-26 practice set 2"
    }
  ],
  avoid: [
    "Theme questions. “In which book does a character learn about friendship?” fits too many books.",
    "Clues that repeat the title. A bathing suit, a museum murder, or the word frindle in the question gives the book away.",
    "Anything you cannot point to on a page in the official ISBN.",
    "A question whose answer is only in a movie, a study guide, or a different book in a series."
  ]
};
