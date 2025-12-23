// Simple XOR-based "encryption" for the lock combo
// Not secure, but enough to prevent casual peeking at source

const KEY = 'martyna2024'

export function encrypt(text: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length)
    result += charCode.toString(16).padStart(2, '0')
  }
  return result
}

export function decrypt(encrypted: string): string {
  let result = ''
  for (let i = 0; i < encrypted.length; i += 2) {
    const charCode = parseInt(encrypted.substr(i, 2), 16) ^ KEY.charCodeAt((i / 2) % KEY.length)
    result += String.fromCharCode(charCode)
  }
  return result
}

// Pre-computed encrypted combo: "23, 7, 28"
// encrypt("23, 7, 28") = "5e00525c055217"
export const ENCRYPTED_COMBO = '5e00525c055217'
