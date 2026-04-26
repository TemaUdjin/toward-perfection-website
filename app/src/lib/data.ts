export type Lesson = {
  id: string
  title: string
  description: string
  duration: string
  videoUrl?: string
}

export type Level = {
  id: string
  title: string
  subtitle: string
  lessons: Lesson[]
}

export const COURSE_DATA: Level[] = [
  {
    id: 'foundation',
    title: 'Foundation',
    subtitle: 'Build the base — wrists, shoulders, hollow body',
    lessons: [
      { id: 'f1', title: 'Wrist Preparation', description: 'Essential wrist mobility and strengthening before any weight-bearing work.', duration: '8 min' },
      { id: 'f2', title: 'Shoulder Opening', description: 'Open the shoulder girdle and build the elevation pattern needed for handstand.', duration: '12 min' },
      { id: 'f3', title: 'Hollow Body', description: 'Learn the core shape of every handstand — lying down first.', duration: '10 min' },
      { id: 'f4', title: 'Wall Kick-Up', description: 'Safe and controlled entry into your first wall handstand.', duration: '15 min' },
    ],
  },
  {
    id: 'build',
    title: 'Build',
    subtitle: 'Develop balance, lines, and freestanding holds',
    lessons: [
      { id: 'b1', title: 'Pirouette Drill', description: 'Find your balance point through controlled rotation away from the wall.', duration: '12 min' },
      { id: 'b2', title: 'Finger Pressure', description: 'Learn to steer with your fingers — the key to freestanding balance.', duration: '10 min' },
      { id: 'b3', title: 'Freestanding Kick-Up', description: 'Your first attempts at a freestanding handstand with safe exits.', duration: '20 min' },
      { id: 'b4', title: 'Line Refinement', description: 'Perfect the straight line from wrists to toes. Fix banana back forever.', duration: '15 min' },
    ],
  },
  {
    id: 'mastery',
    title: 'Mastery',
    subtitle: 'Press, one arm, and advanced skills',
    lessons: [
      { id: 'm1', title: 'L-Sit Foundation', description: 'Build the compression strength required for press handstand.', duration: '15 min' },
      { id: 'm2', title: 'Tuck Press', description: 'First stage of pressing — tucked legs, full shoulder elevation.', duration: '20 min' },
      { id: 'm3', title: 'Straddle Press', description: 'The full straddle press from floor to handstand.', duration: '25 min' },
      { id: 'm4', title: 'One Arm Preparation', description: 'Lateral weight shift drills and one-arm balance conditioning.', duration: '20 min' },
    ],
  },
]
