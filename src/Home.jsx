import React, { useState } from 'react';

export default function Home() {
  const [duration, setDuration] = useState('120');

  return (
    <div className='p-4' style={{ maxWidth: 500, backgroundColor: '#DDDDDD' }}>

      <h1 className="mb-4">Parity Games</h1>
      <p>
        Games to build the market making mindset.
      </p>

      <ol>

        <li> <a target="_blank" rel="noopener noreferrer" href='https://arithmetic.zetamac.com/game?key=a7220a92'> Vanilla Zetamac </a> </li>

        <li> <a target="_blank" rel="noopener noreferrer" href='https://arithmetic.zetamac.com/game?key=d5094dbc'> 3-digit Add/Subtract Zetamac </a> </li>

        <li> <a target="_blank" rel="noopener noreferrer" href='https://parity-zetamac.herokuapp.com/'> PCP Zetamac </a> </li>

        <li> <a target="_blank" rel="noopener noreferrer" href='#'> PCP Zetamac 2.0 </a> </li>

        <li> <a target="_blank" rel="noopener noreferrer" href='#'> Arbitrage Zetamac </a> </li>

        <li> <a target="_blank" rel="noopener noreferrer" href='#'> Kenstonks </a> </li>

        <li> <a target="_blank" rel="noopener noreferrer" href='#'> Options Board Arbitrage Sim </a> </li>

        <li> <a target="_blank" rel="noopener noreferrer" href='#'> Mock Trading </a> </li>

      </ol>

    </div>
  );
}
