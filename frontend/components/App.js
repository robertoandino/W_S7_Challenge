import React from 'react'
import Home from './Home'
import Form from './Form'
import { Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <div id="app">
      <nav>
        {/* NavLinks here */}
        <Link to="/"> Home </Link>&nbsp;
        <Link to="/order"> Order </Link>&nbsp;
      </nav>
      {/* Route and Routes here */}
      <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/order" element={<Form/>}/>
      </Routes>
    </div>
  )
}

export default App
