export function generateRandomUsername(str) {
  // List of positive adjectives related to regeneration, sustainability, etc.
  const adjectives = [
    "Green",
    "Sustainer",
    "Eco",
    "Renewable",
    "Clean",
    "Vital",
    "Flourishing",
    "Vibrant",
    "Thriving",
    "Pure",
    "Resilient",
    "Harmonious",
    "Balanced",
    "Radiant",
    "Blossoming",
    "Bountiful",
    "Organic",
    "Natural",
    "Nurturer",
    "Wholesome",
    "Healer",
    "Regenerator",
    "Restorator",
    "Rejuvenator",
    "builder",
    "creator",
    "gardener",
    "farmer",
    "maker",
    "artist",
    "artisan",
    "craftman",
    "witch",
    "wizard",
    "alchemist",
    "sorcerer",
    "shaman",
    "druid",
    "priest",
    "trickster",
    "lover",
    "fighter",
    "warrior",
    "hero",
    "champion",
    "protector",
    "guardian",
    "beautiful",
    "wise",
    "witty",
    "clever",
  ];

  // Extract the first name from the input string
  const firstName = str.split(" ")[0];

  // Generate a random adjective from the list
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  // Combine the first name and the random adjective to create the username
  const username = `${firstName}-the-${randomAdjective}`.toLowerCase();

  return username;
}
