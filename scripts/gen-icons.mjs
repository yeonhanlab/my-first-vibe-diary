// 앱 아이콘(홈 화면에 저장되는 아이콘) PNG 생성기.
// public/icons/*.svg 를 라스터화한다.  실행: pnpm gen:icons
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = resolve(root, 'public/icons')
const BG = '#eaf5e5' // 아이콘 배경(불투명). iOS 는 투명 PNG 를 검게 칠하므로 flatten 한다.

const iconSvg = readFileSync(resolve(iconsDir, 'icon.svg'))
const maskSvg = readFileSync(resolve(iconsDir, 'maskable.svg'))

const jobs = [
  { svg: iconSvg, size: 192, out: 'icon-192.png' },
  { svg: iconSvg, size: 512, out: 'icon-512.png' },
  { svg: iconSvg, size: 180, out: 'apple-touch-icon.png' },
  { svg: maskSvg, size: 512, out: 'icon-maskable-512.png' },
]

for (const { svg, size, out } of jobs) {
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .flatten({ background: BG })
    .png()
    .toFile(resolve(iconsDir, out))
  console.log(`✓ ${out} (${size}x${size})`)
}
