const newColors = [
  '#FFC32B', 
  '#84C400', 
  '#54D09C', 
  '#40A7E8', 
  '#0066FF', 
  '#3D2CD4', 
  '#7E07E0', 
  '#EC2E4A', 
  '#403F36', 
];

export const ranks = [
  
  { name: 'Novice Reader', pointsRequired: 0, badgeUrl: '/badges/rank1.png', frameUrl: '/frames/frame1.png', color: newColors[0], gradientColors: ['#FFC32B', '#ED8200'] },
  { name: 'Apprentice Scholar', pointsRequired: 100, badgeUrl: '/badges/rank2.png', frameUrl: '/frames/frame2.png', color: newColors[1], gradientColors: ['#84C400', '#00877A'] },
  { name: 'Journeyman Researcher', pointsRequired: 250, badgeUrl: '/badges/rank3.png', frameUrl: '/frames/frame3.png', color: newColors[2], gradientColors: ['#54D09C', '#064B59'] },
  { name: 'Adept Analyst', pointsRequired: 500, badgeUrl: '/badges/rank4.png', frameUrl: '/frames/frame4.png', color: newColors[3], gradientColors: ['#40A7E8', '#2D69EB'] },
  { name: 'Expert Investigator', pointsRequired: 1000, badgeUrl: '/badges/rank5.png', frameUrl: '/frames/frame5.png', color: newColors[4], gradientColors: ['#0066FF', '#004DE6'] },
  { name: 'Master Archivist', pointsRequired: 2000, badgeUrl: '/badges/rank6.png', frameUrl: '/frames/frame6.png', color: newColors[5], gradientColors: ['#3D2CD4', '#2F22A6'] },
  { name: 'Sage of Science', pointsRequired: 4000, badgeUrl: '/badges/rank7.png', frameUrl: '/frames/frame7.png', color: newColors[6], gradientColors: ['#7E07E0', '#6305B0'] },
  { name: 'Enlightened Luminary', pointsRequired: 7500, badgeUrl: '/badges/rank8.png', frameUrl: '/frames/frame8.png', color: newColors[7], gradientColors: ['#EC2E4A', '#C4233B'] },
  { name: 'Ascended Transcendent', pointsRequired: 15000, badgeUrl: '/badges/rank9.png', frameUrl: '/frames/frame9.png', color: newColors[8], gradientColors: ['#403F36', '#292822'] },
];

export const getRankByPoints = (points) => {
  return ranks.slice().reverse().find(rank => points >= rank.pointsRequired);
};
