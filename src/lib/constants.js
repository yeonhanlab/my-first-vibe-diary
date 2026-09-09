import { uid } from './storage.js'

// 활동에 붙일 수 있는 카테고리. 자유롭게 여러 개 선택할 수 있다.
export const CATEGORIES = [
  '움직이기',
  '만들기',
  '쉬기',
  '혼자',
  '사람과 함께',
  '밖으로 나가기',
  '집에서',
]

// 활동 등록 화면에서 고를 수 있는 귀여운 아이콘 모음.
export const ICON_CHOICES = [
  '🎧', '📖', '🎨', '🏊', '🏃', '☕', '⛰️', '💬', '🍰', '🎬',
  '📝', '🪟', '🌿', '🐱', '🐶', '😮‍💨', '🧘', '☁️', '🌸', '🍵',
  '🎵', '🎹', '🎸', '📷', '🧵', '🧶', '✏️', '🖌️', '🌊', '🚶',
  '🌳', '🏞️', '🌅', '🌙', '⭐', '🫧', '🛁', '🥐', '🍓', '🌼',
  '🪴', '🎮', '📺', '🧩', '🎲', '💌', '📓', '🕯️', '🌈', '🦋',
]

// 처음 실행할 때 채워지는 기본 활동들. 사용자는 지우거나 새로 추가할 수 있다.
export function defaultActivities() {
  const seed = [
    ['🎧', '음악 들으며 산책하기', ['움직이기', '밖으로 나가기', '혼자']],
    ['📖', '책 읽기', ['쉬기', '혼자', '집에서']],
    ['🎨', '그림 그리기', ['만들기', '혼자', '집에서']],
    ['🏊', '수영하기', ['움직이기', '밖으로 나가기']],
    ['🏃', '달리기', ['움직이기', '밖으로 나가기', '혼자']],
    ['☕', '예쁜 카페에서 책 읽기', ['쉬기', '밖으로 나가기']],
    ['⛰️', '등산하기', ['움직이기', '밖으로 나가기']],
    ['💬', '친구와 수다 떨기', ['사람과 함께']],
    ['🍰', '맛있는 음식 먹기', ['쉬기', '사람과 함께']],
    ['🎬', '영화 보기', ['쉬기', '집에서']],
    ['📝', '다이어리 꾸미기', ['만들기', '혼자', '집에서']],
    ['🪟', '창문 보면서 멍때리기', ['쉬기', '혼자', '집에서']],
    ['🌿', '5분만이라도 자연 걷다오기', ['움직이기', '밖으로 나가기']],
    ['🐱', '고양이랑 놀기', ['쉬기', '집에서']],
    ['😮‍💨', '심호흡하기', ['쉬기', '혼자']],
  ]
  return seed.map(([icon, name, categories]) => ({
    id: uid(),
    icon,
    name,
    categories,
    createdAt: Date.now(),
  }))
}

export const DURATIONS = [
  { minutes: 10, label: '10분' },
  { minutes: 20, label: '20분' },
  { minutes: 30, label: '30분' },
  { minutes: 60, label: '1시간' },
]

export const MOODS_BEFORE = [
  { key: 'calm', emoji: '😌', label: '편안해요' },
  { key: 'meh', emoji: '😐', label: '그냥 그래요' },
  { key: 'tired', emoji: '😵', label: '조금 지쳤어요' },
  { key: 'comfort', emoji: '🥺', label: '위로가 필요해요' },
  { key: 'spark', emoji: '✨', label: '뭔가 하고 싶어요' },
]

export const MOODS_AFTER = [
  { key: 'better', emoji: '😊', label: '좋아졌어요' },
  { key: 'stillcalm', emoji: '😌', label: '그대로 편안해요' },
  { key: 'same', emoji: '😐', label: '그냥 그랬어요' },
  { key: 'again', emoji: '💗', label: '다음에도 하고 싶어요' },
]

// 타이머가 끝났을 때 보여줄 따뜻한 말들 중 하나를 고른다.
export const DONE_MESSAGES = [
  '잘 쉬었어요.',
  '잠깐이라도 나를 위해 시간을 썼어요.',
  '오늘의 나에게, 수고했어요.',
  '이 시간은 온전히 나의 것이었어요.',
  '천천히 숨을 고른 시간이었어요.',
]

export function moodEmoji(list, key) {
  const found = list.find((m) => m.key === key)
  return found ? found.emoji : ''
}
