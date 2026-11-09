/* ==========================================================================
   Content data (pilot)
   --------------------------------------------------------------------------
   Structure mirrors what the future admin panel will save to the database:
   Book -> Chapters -> Sessions (~10 sentences) -> 1 quiz question per session.
   Word counts are NOT typed by hand: prepareBook() computes them, the same
   way the admin "register story" flow will compute them when content is saved.
   ========================================================================== */

const BOOKS = [
  {
    id: "snow-white",
    title: "Snow White",
    ageRange: "Ages 6–8",
    coverColor: "#BFE3EE",
    coverEmoji: "🍎",
    available: true,
    synopsis:
      "A kind princess, a jealous queen and a magic mirror that never lies. When Snow White runs into the forest to escape the queen, she finds a tiny house, seven new friends — and a very dangerous apple.",
    chapters: [
      {
        title: "The Beautiful Queen",
        icon: "👑",
        sessions: [
          {
            sentences: [
              "Once upon a time, there lived a kind queen.",
              "She had skin as white as snow.",
              "Her lips were red as cherries.",
              "Her hair was black as night.",
              "One winter day, she sat by the window and sewed.",
              "She pricked her finger with the needle.",
              "Three drops of red blood fell on the snow.",
              "\"I wish for a daughter as white as snow,\" she said.",
              "Soon, she had a baby girl.",
              "She named her Snow White.",
            ],
            quiz: {
              question: "What did the queen name her daughter?",
              options: ["Rose Red", "Snow White", "Little Cherry", "Winter"],
              answer: 1,
            },
          },
          {
            sentences: [
              "Sadly, the kind queen died.",
              "A year later, the king married again.",
              "The new queen was beautiful, but proud and cruel.",
              "She had a magic mirror on her wall.",
              "Every day she asked, \"Mirror, mirror on the wall, who is the fairest of them all?\"",
              "The mirror always answered, \"You, my queen, are the fairest of all.\"",
              "The queen was happy with this answer.",
              "But Snow White grew more beautiful every year.",
            ],
            quiz: {
              question: "What did the new queen have on her wall?",
              options: ["A painting", "A big clock", "A magic mirror", "A window"],
              answer: 2,
            },
          },
        ],
      },
      {
        title: "Into the Forest",
        icon: "🌲",
        sessions: [
          {
            sentences: [
              "One day, the queen asked her mirror again.",
              "This time, the mirror gave a new answer.",
              "\"Snow White is now the fairest of all.\"",
              "The queen turned green with anger.",
              "She called a hunter to the castle.",
              "\"Take Snow White into the forest,\" she said.",
              "\"And never let her come back.\"",
              "The hunter took the girl deep into the woods.",
              "But he had a good heart.",
              "\"Run away, child,\" he told her, \"and never return to the castle.\"",
            ],
            quiz: {
              question: "Why was the queen angry?",
              options: [
                "Snow White broke the mirror",
                "The mirror said Snow White was the fairest",
                "The hunter ran away",
                "The king left the castle",
              ],
              answer: 1,
            },
          },
          {
            sentences: [
              "Snow White ran through the dark forest.",
              "The trees looked like monsters in the night.",
              "At last, she found a little house.",
              "Inside, there was a little table with seven little plates.",
              "There were also seven little beds.",
              "Snow White was very tired.",
              "She lay down across the beds and fell asleep.",
            ],
            quiz: {
              question: "How many beds were in the little house?",
              options: ["Three", "Five", "Seven", "Ten"],
              answer: 2,
            },
          },
        ],
      },
      {
        title: "Seven New Friends",
        icon: "⛏️",
        sessions: [
          {
            sentences: [
              "At night, the owners of the house came home.",
              "They were seven dwarfs who worked in the mountains.",
              "They found Snow White sleeping in their beds.",
              "\"Who is this girl?\" they whispered.",
              "In the morning, Snow White told them her story.",
              "The dwarfs felt sorry for her.",
              "\"You can stay with us,\" they said.",
              "\"But be careful, and don't open the door to anyone.\"",
            ],
            quiz: {
              question: "Where did the dwarfs work?",
              options: ["In the castle", "On a farm", "In the mountains", "By the river"],
              answer: 2,
            },
          },
          {
            sentences: [
              "Back at the castle, the queen asked her mirror again.",
              "\"Snow White is still the fairest of all,\" it said.",
              "\"She lives with the seven dwarfs.\"",
              "The queen was furious.",
              "She made a poisoned apple.",
              "Then she dressed as an old woman and went to the little house.",
              "\"Try this sweet apple, my dear,\" she said.",
              "Snow White took one bite and fell to the floor.",
            ],
            quiz: {
              question: "What did the old woman give Snow White?",
              options: ["A poisoned apple", "A golden comb", "A red dress", "A piece of bread"],
              answer: 0,
            },
          },
        ],
      },
      {
        title: "Happily Ever After",
        icon: "✨",
        sessions: [
          {
            sentences: [
              "The dwarfs came home and found Snow White on the floor.",
              "They cried and cried for days.",
              "They put her in a glass box on top of a hill.",
              "One day, a prince rode by and saw her.",
              "He asked the dwarfs to let him take her to his castle.",
              "As his servants carried the box, they tripped on a root.",
              "The piece of apple fell out of Snow White's mouth.",
              "She opened her eyes and sat up.",
              "Snow White and the prince were soon married.",
              "And they lived happily ever after.",
            ],
            quiz: {
              question: "How did Snow White wake up?",
              options: [
                "The dwarfs sang to her",
                "The piece of apple fell out of her mouth",
                "The mirror broke",
                "The queen said sorry",
              ],
              answer: 1,
            },
          },
        ],
      },
    ],
  },

  /* ---- Visual-only books (no content in the pilot) ---- */
  { id: "lighthouse-cat", title: "The Lighthouse Cat", ageRange: "Ages 6–8", coverColor: "#F6C9C1", coverEmoji: "🐈", available: false,
    synopsis: "Every night, a small orange cat climbs the lighthouse stairs to make sure the light stays on. But one stormy night, the light goes out." },
  { id: "moon-balloon", title: "Max and the Moon Balloon", ageRange: "Ages 5–7", coverColor: "#C9DDF6", coverEmoji: "🎈", available: false,
    synopsis: "Max finds a silver balloon that pulls him higher and higher — all the way to the moon." },
  { id: "garden-gate", title: "The Secret Garden Gate", ageRange: "Ages 9–11", coverColor: "#CDEBC5", coverEmoji: "🗝️", available: false,
    synopsis: "Behind an old wall covered in ivy, Lily discovers a garden nobody has visited for fifty years." },
  { id: "pip-penguin", title: "Pip the Brave Penguin", ageRange: "Ages 5–7", coverColor: "#E3D7F5", coverEmoji: "🐧", available: false,
    synopsis: "Pip is the smallest penguin on the ice, but when the colony gets lost, he is the one who finds the way home." },
  { id: "rainy-detectives", title: "Rainy Day Detectives", ageRange: "Ages 8–10", coverColor: "#FBE3B5", coverEmoji: "🔍", available: false,
    synopsis: "Stuck inside on a rainy Saturday, three cousins try to solve the mystery of grandma's missing cookie jar." },
  { id: "clockmaker", title: "The Clockmaker's Apprentice", ageRange: "Ages 10–12", coverColor: "#F5D0E3", coverEmoji: "🕰️", available: false,
    synopsis: "Theo works in a strange shop where every clock shows a different time — and one of them shows the future." },
  { id: "fox-juniper", title: "A Fox Named Juniper", ageRange: "Ages 7–9", coverColor: "#D2EFEA", coverEmoji: "🦊", available: false,
    synopsis: "A curious young fox leaves the forest for the first time and learns that the city is full of surprises." },
  { id: "paper-town", title: "Tales from Paper Town", ageRange: "Ages 6–8", coverColor: "#EADCC8", coverEmoji: "📜", available: false,
    synopsis: "In a town made entirely of paper, everyone is afraid of one thing: rain." },
  { id: "dragon-egg", title: "The Last Dragon Egg", ageRange: "Ages 9–12", coverColor: "#C8D3F2", coverEmoji: "🥚", available: false,
    synopsis: "When a farm girl finds a warm, glowing stone in the hay, she has no idea it is about to hatch." },
];

/* Count words the way the platform will at register time:
   split on whitespace, keep tokens that contain at least one letter or digit. */
function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

/* Simulates the "register story" step: computes word counts per
   sentence, per session and per chapter, and gives everything stable ids. */
function prepareBook(book) {
  if (!book.chapters) return book;
  let bookWords = 0;
  book.chapters.forEach((ch, ci) => {
    ch.id = `${book.id}-c${ci + 1}`;
    ch.words = 0;
    ch.sessions.forEach((se, si) => {
      se.id = `${ch.id}-s${si + 1}`;
      se.sentences = se.sentences.map((text, ti) => ({
        id: `${se.id}-t${ti + 1}`,
        text,
        words: countWords(text),
      }));
      se.words = se.sentences.reduce((a, s) => a + s.words, 0);
      ch.words += se.words;
    });
    bookWords += ch.words;
  });
  book.words = bookWords;
  return book;
}

BOOKS.forEach(prepareBook);
