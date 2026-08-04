// search-data.js — static index of individual skills for client-side search
// NOTE: If new skills are added, add them here so the library search surfaces them.
const SWAY_SKILLS = [
  // Figures — 10U (6)
  { title: "Barracuda", url: "figures/10u.html#barracuda", category: "Figures — 10U" },
  { title: "Ballet Leg Single", url: "figures/10u.html#ballet-leg-single", category: "Figures — 10U" },
  { title: "Neptunus", url: "figures/10u.html#neptunus", category: "Figures — 10U" },
  { title: "Blossom Walkout", url: "figures/10u.html#blossom-walkout", category: "Figures — 10U" },
  { title: "Surface Prawn", url: "figures/10u.html#surface-prawn", category: "Figures — 10U" },
  { title: "Kipnus", url: "figures/10u.html#kipnus", category: "Figures — 10U" },

  // Figures — 12U (8)
  { title: "Swordfish", url: "figures/12u.html#swordfish", category: "Figures — 12U" },
  { title: "Straight Ballet leg", url: "figures/12u.html#straight-ballet-leg", category: "Figures — 12U" },
  { title: "Barracuda", url: "figures/12u.html#barracuda-12u", category: "Figures — 12U" },
  { title: "Front Ariana", url: "figures/12u.html#front-ariana", category: "Figures — 12U" },
  { title: "Tower", url: "figures/12u.html#tower", category: "Figures — 12U" },
  { title: "Swanita Spinning 180°", url: "figures/12u.html#swanita-spinning-180", category: "Figures — 12U" },
  { title: "Water Drop", url: "figures/12u.html#water-drop", category: "Figures — 12U" },
  { title: "Kip", url: "figures/12u.html#kip", category: "Figures — 12U" },

  // Figures — 13 - 15 (Youth) (12)
  { title: "Ipanema Spinning 180°", url: "figures/youth-13-15.html#ipanema-spinning-180", category: "Figures — 13 - 15 (Youth)" },
  { title: "Saturn", url: "figures/youth-13-15.html#saturn", category: "Figures — 13 - 15 (Youth)" },
  { title: "London Continuous Spin 720°", url: "figures/youth-13-15.html#london-continuous-spin-720", category: "Figures — 13 - 15 (Youth)" },
  { title: "Flamingo Bent Knee Combined Spin 360°+360°", url: "figures/youth-13-15.html#flamingo-bent-knee-combined-spin", category: "Figures — 13 - 15 (Youth)" },
  { title: "Venus", url: "figures/youth-13-15.html#venus", category: "Figures — 13 - 15 (Youth)" },
  { title: "Barracuda Airborne Split Spin Up 180°", url: "figures/youth-13-15.html#barracuda-airborne-split-spin-up-180", category: "Figures — 13 - 15 (Youth)" },
  { title: "Flying Fish Spinning 360°", url: "figures/youth-13-15.html#flying-fish-spinning-360", category: "Figures — 13 - 15 (Youth)" },
  { title: "Whip Continuous Spin 720°", url: "figures/youth-13-15.html#whip-continuous-spin-720", category: "Figures — 13 - 15 (Youth)" },
  { title: "Albatross Spin Up 360°", url: "figures/youth-13-15.html#albatross-spin-up-360", category: "Figures — 13 - 15 (Youth)" },
  { title: "Cyclone Open 180°", url: "figures/youth-13-15.html#cyclone-open-180", category: "Figures — 13 - 15 (Youth)" },
  { title: "Walkover Back Closing 360°", url: "figures/youth-13-15.html#walkover-back-closing-360", category: "Figures — 13 - 15 (Youth)" },
  { title: "Swordfish Straight Leg Ariana Rotation", url: "figures/youth-13-15.html#swordfish-straight-leg-ariana-rotation", category: "Figures — 13 - 15 (Youth)" },

  // Elements — Solo Technical (9 total; 5 named + 4 placeholders)
  { title: "Thrust Continuous Spin 720°/360°", url: "elements/solo-technical.html#thrust-continuous-spin", category: "Elements — Solo Technical" },
  { title: "Combined Spin 1080°/720°", url: "elements/solo-technical.html#combined-spin-1080-720", category: "Elements — Solo Technical" },
  { title: "Swordfish Straight Leg - Knight", url: "elements/solo-technical.html#swordfish-straight-leg-knight", category: "Elements — Solo Technical" },
  { title: "Fishtail Half Twist/Continuous Spin", url: "elements/solo-technical.html#fishtail-half-twist", category: "Elements — Solo Technical" },
  { title: "Rocket Split Bent Knee Joining/Bent Knee", url: "elements/solo-technical.html#rocket-split-bent-knee", category: "Elements — Solo Technical" },
  { title: "Solo Technical Skill (placeholder 6)", url: "elements/solo-technical.html#solo-placeholder-6", category: "Elements — Solo Technical" },
  { title: "Solo Technical Skill (placeholder 7)", url: "elements/solo-technical.html#solo-placeholder-7", category: "Elements — Solo Technical" },
  { title: "Solo Technical Skill (placeholder 8)", url: "elements/solo-technical.html#solo-placeholder-8", category: "Elements — Solo Technical" },
  { title: "Solo Technical Skill (placeholder 9)", url: "elements/solo-technical.html#solo-placeholder-9", category: "Elements — Solo Technical" },

  // Elements — Duet Technical (9 placeholders)
  { title: "Duet Technical Skill 1 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-1", category: "Elements — Duet Technical" },
  { title: "Duet Technical Skill 2 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-2", category: "Elements — Duet Technical" },
  { title: "Duet Technical Skill 3 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-3", category: "Elements — Duet Technical" },
  { title: "Duet Technical Skill 4 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-4", category: "Elements — Duet Technical" },
  { title: "Duet Technical Skill 5 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-5", category: "Elements — Duet Technical" },
  { title: "Duet Technical Skill 6 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-6", category: "Elements — Duet Technical" },
  { title: "Duet Technical Skill 7 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-7", category: "Elements — Duet Technical" },
  { title: "Duet Technical Skill 8 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-8", category: "Elements — Duet Technical" },
  { title: "Duet Technical Skill 9 (placeholder)", url: "elements/duet-technical.html#duet-placeholder-9", category: "Elements — Duet Technical" },

  // Elements — Mixed Duet Technical (5 placeholders)
  { title: "Mixed Duet Technical Skill 1 (placeholder)", url: "elements/mixed-duet-technical.html#mixed-placeholder-1", category: "Elements — Mixed Duet Technical" },
  { title: "Mixed Duet Technical Skill 2 (placeholder)", url: "elements/mixed-duet-technical.html#mixed-placeholder-2", category: "Elements — Mixed Duet Technical" },
  { title: "Mixed Duet Technical Skill 3 (placeholder)", url: "elements/mixed-duet-technical.html#mixed-placeholder-3", category: "Elements — Mixed Duet Technical" },
  { title: "Mixed Duet Technical Skill 4 (placeholder)", url: "elements/mixed-duet-technical.html#mixed-placeholder-4", category: "Elements — Mixed Duet Technical" },
  { title: "Mixed Duet Technical Skill 5 (placeholder)", url: "elements/mixed-duet-technical.html#mixed-placeholder-5", category: "Elements — Mixed Duet Technical" },

  // Elements — Team Technical (5 placeholders)
  { title: "Team Technical Skill 1 (placeholder)", url: "elements/junior.html#team-placeholder-1", category: "Elements — Team Technical" },
  { title: "Team Technical Skill 2 (placeholder)", url: "elements/junior.html#team-placeholder-2", category: "Elements — Team Technical" },
  { title: "Team Technical Skill 3 (placeholder)", url: "elements/junior.html#team-placeholder-3", category: "Elements — Team Technical" },
  { title: "Team Technical Skill 4 (placeholder)", url: "elements/junior.html#team-placeholder-4", category: "Elements — Team Technical" },
  { title: "Team Technical Skill 5 (placeholder)", url: "elements/junior.html#team-placeholder-5", category: "Elements — Team Technical" }
];
