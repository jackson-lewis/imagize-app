/**
 * Format bytes to a human readable filesize.
 * 
 * @example formatBytes(102400) // returns 100 KB
 * @param bytes The total bytes of a file
 * @returns Human readable filesize, to the nearest unit (KB, MB, etc...)
 */
export function formatBytes(bytes: number) {
  if (bytes === 0) {
    return '0 Bytes'
  }

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}