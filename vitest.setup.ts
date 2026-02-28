import '@testing-library/jest-dom'

if (!URL.createObjectURL) {
  URL.createObjectURL = (() => 'blob:mock-url') as typeof URL.createObjectURL
}

if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = (() => undefined) as typeof URL.revokeObjectURL
}
