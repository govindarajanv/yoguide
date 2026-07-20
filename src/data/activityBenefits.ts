import type { Category, PracticeStep } from '../lib/types'

export type ActivityBenefit = {
  primary: string
  secondary: string[]
}

const BENEFITS: Record<string, ActivityBenefit> = {
  'Beginning Prayer': { primary: 'Breath & posture', secondary: ['Spine', 'Diaphragm'] },
  'End Prayer': { primary: 'Breath & posture', secondary: ['Spine', 'Diaphragm'] },
  'Spot Jogging': { primary: 'Cardiovascular system', secondary: ['Calves', 'Quadriceps', 'Glutes'] },
  'Arm Rotation': { primary: 'Shoulders', secondary: ['Upper back', 'Chest'] },
  'Wrist Rotation': { primary: 'Wrists', secondary: ['Forearms', 'Hands'] },
  'Finger Stretches': { primary: 'Hands', secondary: ['Fingers', 'Forearms'] },
  'Ankle Circles': { primary: 'Ankles', secondary: ['Calves', 'Feet'] },
  'Neck Rotation': { primary: 'Neck mobility', secondary: ['Upper trapezius', 'Shoulders'] },
  'Torso Twist': { primary: 'Obliques', secondary: ['Spine', 'Core'] },
  'Standing Side Bend': { primary: 'Side body', secondary: ['Obliques', 'Lats'] },
  'Waist Rotation': { primary: 'Core mobility', secondary: ['Obliques', 'Lower back'] },
  Dandasana: { primary: 'Postural muscles', secondary: ['Hamstrings', 'Core', 'Spine'] },
  'Dead Bug': { primary: 'Deep core', secondary: ['Hip flexors', 'Lower back stability'] },
  'High Knees': { primary: 'Hip flexors', secondary: ['Quadriceps', 'Core', 'Calves'] },
  'Oblique Twist Jump': { primary: 'Obliques', secondary: ['Legs', 'Cardiovascular system'] },
  Superman: { primary: 'Lower back', secondary: ['Glutes', 'Upper back'] },
  'Push Ups': { primary: 'Chest', secondary: ['Triceps', 'Shoulders', 'Core'] },
  'Butt Kickers': { primary: 'Hamstrings', secondary: ['Quadriceps', 'Calves'] },
  'Jumping Jacks': { primary: 'Cardiovascular system', secondary: ['Shoulders', 'Glutes', 'Calves'] },
  'Side Jack': { primary: 'Outer hips', secondary: ['Shoulders', 'Calves'] },
  'Bird Dog': { primary: 'Core stability', secondary: ['Glutes', 'Back', 'Shoulders'] },
  'Deep Squats': { primary: 'Quadriceps & glutes', secondary: ['Hamstrings', 'Hips', 'Core'] },
  Vrikshasana: { primary: 'Balance & ankles', secondary: ['Glutes', 'Core', 'Posture'] },
  Planks: { primary: 'Core', secondary: ['Shoulders', 'Chest', 'Glutes'] },
  'Crescent Low Lunge': { primary: 'Hip flexors', secondary: ['Quadriceps', 'Glutes', 'Spine'] },
  Agnisara: { primary: 'Abdominal wall', secondary: ['Diaphragm', 'Pelvic region'] },
  'Wall Sit': { primary: 'Quadriceps', secondary: ['Glutes', 'Calves', 'Core'] },
  'Kick - Legs': { primary: 'Hip flexors', secondary: ['Quadriceps', 'Core'] },
  Suptakapotasana: { primary: 'Outer hips', secondary: ['Glutes', 'Lower back'] },
  'Side Lunge': { primary: 'Inner thighs & glutes', secondary: ['Quadriceps', 'Hip flexors', 'Core'] },
  'Leg Swings': { primary: 'Hip mobility', secondary: ['Hamstrings', 'Hip flexors', 'Glutes'] },
  'Mountain Climbers': { primary: 'Core', secondary: ['Shoulders', 'Hip flexors', 'Cardiovascular system'] },
  'Cat and Cow Pose': { primary: 'Spinal mobility', secondary: ['Core', 'Neck', 'Shoulders'] },
  'Leg Raise': { primary: 'Lower abdominals', secondary: ['Hip flexors', 'Core'] },
  Bridges: { primary: 'Glutes', secondary: ['Hamstrings', 'Lower back', 'Core'] },
  Sukhasana: { primary: 'Hips & posture', secondary: ['Spine', 'Knees', 'Breath'] },
  'Surya Namaskar': { primary: 'Full body', secondary: ['Shoulders', 'Core', 'Hips', 'Hamstrings'] },
  Savasana: { primary: 'Whole-body relaxation', secondary: ['Breath', 'Nervous system'] },
  'Leg Up the wall': { primary: 'Hamstrings & calves', secondary: ['Lower back', 'Circulation'] },
  'Quadriceps Stretch': { primary: 'Quadriceps', secondary: ['Hip flexors', 'Knees'] },
  'Half Forward Fold (Wall)': { primary: 'Hamstrings', secondary: ['Spine', 'Shoulders', 'Calves'] },
  'Towel Stretch': { primary: 'Shoulders', secondary: ['Chest', 'Upper back'] },
  'Shoulder Stretch': { primary: 'Shoulders', secondary: ['Upper back', 'Triceps'] },
  'Hand Stretches (4 Directions)': { primary: 'Wrists & hands', secondary: ['Forearms', 'Fingers'] },
  'Eye Rotation': { primary: 'Eye mobility', secondary: ['Focus', 'Facial relaxation'] },
  'Straight-knee calf raise': { primary: 'Calves', secondary: ['Ankles', 'Feet'] },
  Vajrasana: { primary: 'Posture', secondary: ['Ankles', 'Knees', 'Hips'] },
  'Kapalapathi (B & A)': { primary: 'Diaphragm', secondary: ['Abdominal wall', 'Breath control'] },
  'Abdominal Breath -CN/U': { primary: 'Diaphragm', secondary: ['Abdominal wall', 'Breath control'] },
  'Chest Breath - CM/U': { primary: 'Rib cage', secondary: ['Chest', 'Breath control'] },
  'Shoulder Breath - AM/U': { primary: 'Upper chest', secondary: ['Shoulders', 'Breath control'] },
  'Naadi Shuddhi (U)': { primary: 'Breath control', secondary: ['Focus', 'Diaphragm'] },
  Seethali: { primary: 'Breath control', secondary: ['Tongue', 'Diaphragm'] },
  Seethkari: { primary: 'Breath control', secondary: ['Jaw', 'Diaphragm'] },
  Sadanta: { primary: 'Breath control', secondary: ['Jaw', 'Diaphragm'] },
  Brahmari: { primary: 'Breath & resonance', secondary: ['Throat', 'Face', 'Focus'] },
  'AUM BM': { primary: 'Breath & resonance', secondary: ['Throat', 'Chest', 'Focus'] },
  Meditation: { primary: 'Attention & breath', secondary: ['Posture', 'Whole-body relaxation'] },
}

const CATEGORY_FALLBACKS: Record<Category, ActivityBenefit> = {
  prayer: { primary: 'Breath & posture', secondary: ['Spine'] },
  warmUp: { primary: 'Joint mobility', secondary: ['Circulation'] },
  relaxation: { primary: 'Recovery', secondary: ['Breath'] },
  core: { primary: 'Core', secondary: ['Stability'] },
  asanas: { primary: 'Full body', secondary: ['Mobility', 'Strength'] },
  coolDown: { primary: 'Mobility & recovery', secondary: ['Flexibility'] },
  pranayama: { primary: 'Breath control', secondary: ['Diaphragm'] },
  meditation: { primary: 'Attention & breath', secondary: ['Posture'] },
}

export function getActivityBenefit(step: PracticeStep): ActivityBenefit {
  return BENEFITS[step.name] ?? CATEGORY_FALLBACKS[step.category]
}

export function hasCuratedActivityBenefit(activityName: string): boolean {
  return activityName in BENEFITS
}
