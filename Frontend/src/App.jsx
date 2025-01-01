import { useState } from 'react'
import Navbar from './Components/Navbar'
import Hero from './Components/Hero'
import { Outlet } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='bg-gray-900 h-screen'>
    <Navbar />
      <main>
        <Outlet/>
      </main>
    </div>
    </>
  )
}

export default App
