import type { StepDef } from '../lib/types'

/**
 * Periodic Stretches — a separate, optional micro-practice distinct from the
 * regular daily yoga schedule. All six activities are 2-minute gentle holds.
 * Total duration: 720s (12 minutes).
 */
export const PERIODIC_STRETCHES_STEPS: StepDef[] = [
  {
    id: 'periodic-legs-on-the-wall',
    category: 'coolDown',
    name: 'Legs on the wall',
    sets: 1,
    reps: 60,
    durationSec: 120,
    cue: 'Lie on your back with hips near the wall and legs extended up; relax arms and breathe slowly.',
  },
  {
    id: 'periodic-legs-on-the-corner',
    category: 'coolDown',
    name: 'Legs on the corner',
    sets: 1,
    reps: 60,
    durationSec: 120,
    cue: 'Rest your legs along the corner of the wall, heels apart and toes toward the corner; soften the legs.',
  },
  {
    id: 'periodic-tadasana',
    category: 'coolDown',
    name: 'Tadasana',
    sets: 1,
    reps: 60,
    durationSec: 120,
    cue: 'Stand tall, feet together, weight evenly spread; lengthen the spine and breathe steadily.',
  },
  {
    id: 'periodic-seated-leg-lift',
    category: 'coolDown',
    name: 'Seated Leg Lift',
    sets: 1,
    reps: 60,
    durationSec: 120,
    cue: 'Sit tall, extend one leg and lift it with control, then lower; keep the core engaged.',
  },
  {
    id: 'periodic-legs-on-windows',
    category: 'coolDown',
    name: 'Legs on windows',
    sets: 1,
    reps: 60,
    durationSec: 120,
    cue: 'Prop your legs up on a windowsill or ledge; let the legs rest and breathe deeply.',
  },
  {
    id: 'periodic-half-forward-fold',
    category: 'coolDown',
    name: 'Half Forward fold - wall',
    sets: 1,
    reps: 60,
    durationSec: 120,
    cue: 'Hands on the wall, hinge at the hips with a long spine and gentle hamstring stretch.',
  },
]
