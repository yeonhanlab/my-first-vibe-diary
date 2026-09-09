// 프로필 사진을 localStorage 에 담아야 하므로, 저장 전에 작게 줄이고 정사각형으로 자른다.

const MAX_SIZE = 320

export function fileToProfileImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('이미지 파일이 아니에요.'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('사진을 읽지 못했어요.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('사진을 열지 못했어요.'))
      img.onload = () => {
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2

        const canvas = document.createElement('canvas')
        canvas.width = MAX_SIZE
        canvas.height = MAX_SIZE
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, sx, sy, side, side, 0, 0, MAX_SIZE, MAX_SIZE)

        try {
          resolve(canvas.toDataURL('image/jpeg', 0.82))
        } catch (e) {
          reject(e)
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
