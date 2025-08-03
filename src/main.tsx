import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LeetCode2106Animation from './leetcode-2106-animation.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LeetCode2106Animation />
  </StrictMode>,
)
