import { render, screen, fireEvent } from '@testing-library/react'
import ImageUploader from './ImageUploader'

function createFile(name: string, type: string, size: number) {
  const blob = new Blob([new Uint8Array(size)], { type })
  ;(blob as any).name = name
  return new File([blob], name, { type })
}

test('拒绝不支持的图片类型', async () => {
  const onCompleted = vi.fn()
  render(<ImageUploader onCompleted={onCompleted} />)
  const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement | null
  const fileInput = screen.getByLabelText(/file/i) || document.querySelector('input[type="file"]') as HTMLInputElement
  const badFile = createFile('a.txt', 'text/plain', 100)
  const dt = new DataTransfer()
  dt.items.add(badFile)
  fileInput.files = dt.files
  fireEvent.change(fileInput)
  expect(document.querySelectorAll('.image-preview-item').length).toBe(0)
})

test('接受合规图片并显示进度条', async () => {
  const onCompleted = vi.fn()
  render(<ImageUploader onCompleted={onCompleted} />)
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  const img = createFile('a.jpg', 'image/jpeg', 1024)
  const dt = new DataTransfer()
  dt.items.add(img)
  fileInput.files = dt.files
  fireEvent.change(fileInput)
  expect(document.querySelectorAll('.image-preview-item').length).toBe(1)
})

