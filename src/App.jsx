import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './Home'
import PCPZetamac2 from './PCPZetamac2'
import ArbitrageZetamac from './ArbitrageZetamac'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/pcp_zetamac_2' element={<PCPZetamac2 />} />
        <Route path='/arbitrage_zetamac' element={<ArbitrageZetamac />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
