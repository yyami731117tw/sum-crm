import { useState } from 'react'

export function usePermissions() {
  const [permissions] = useState<string[]>([])
  return { permissions }
} 