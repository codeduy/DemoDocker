import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {  HomePage } from './pages/Home'
import { UserPage } from './pages/UserPage'
import { Routes, Route } from 'react-router-dom';

function App() {
 

  return (
    <div>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UserPage />} />
    </Routes>
  </div>
  )
}

export default App
