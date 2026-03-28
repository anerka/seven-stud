import type { BettingSound } from '../game/studEngine'

const url = (file: string) => `${import.meta.env.BASE_URL}sounds/${file}`

const cache = new Map<BettingSound, HTMLAudioElement>()

function getAudio(kind: BettingSound): HTMLAudioElement {
  let a = cache.get(kind)
  if (!a) {
    const src = kind === 'chips' ? url('PokerAction.wav') : url('PokerRaise.mp3')
    a = new Audio(src)
    a.preload = 'auto'
    cache.set(kind, a)
  }
  return a
}

/** Plays bet/call (chips) or raise-over (raise) SFX; safe to call from React effects. */
export function playBettingSound(kind: BettingSound): void {
  const a = getAudio(kind)
  try {
    a.currentTime = 0
    void a.play().catch(() => {
      /* autoplay policy / missing file */
    })
  } catch {
    /* ignore */
  }
}
