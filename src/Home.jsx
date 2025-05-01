import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {

  return (
    <div className="d-flex justify-content-center align-items-start">
      <div className='p-4' style={{ maxWidth: 500, backgroundColor: '#DDDDDD' }}>

        <h1 className="mb-4">Parity Games</h1>
        <p>
          Mr. Miyagi-ing a market maker.
        </p>

        <ol>

          <li> <a target="_blank" rel="noopener noreferrer" href='https://arithmetic.zetamac.com/game?key=a7220a92'> Vanilla Zetamac </a> </li>

          <li> <a target="_blank" rel="noopener noreferrer" href='https://arithmetic.zetamac.com/game?key=d5094dbc'> 3-digit Add/Subtract Zetamac </a> </li>

          <li> <a target="_blank" rel="noopener noreferrer" href='https://parity-zetamac.herokuapp.com/'> PCP Zetamac </a> </li>

          <li> <Link to='/pcp_zetamac_2'> PCP Zetamac 2.0 </Link> </li>

          <li> <Link to='/arbitrage_zetamac'> Arbitrage Zetamac </Link> </li>

          <li> <a target="_blank" rel="noopener noreferrer" href='https://kenstonk.herokuapp.com/'> Kenstonks </a> </li>

          <li> <Link to='#'> Options Board Arbitrage Sim </Link> </li>

          <li> <Link to='#'> Mock Trading </Link> </li>

        </ol>

      </div>
    </div>
  );
}
