import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LeetCodeAnimation from './leetcode_animation.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LeetCodeAnimation />
  </StrictMode>,
)
