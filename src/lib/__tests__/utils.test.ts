import { cn } from '../utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2 py-1', 'p-4')
    expect(result).toBe('p-4')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('filters out undefined values', () => {
    const result = cn('class1', undefined, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('merges Tailwind classes intelligently', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('preserves non-conflicting classes', () => {
    const result = cn('bg-red-500', 'text-white', 'p-4')
    expect(result).toBe('bg-red-500 text-white p-4')
  })
})