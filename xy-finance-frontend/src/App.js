import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TokenSelector from './components/TokenSelector';

const tokens = [
  { value: 'ETH', label: 'ETH - Ethereum' },
  { value: 'BNB', label: 'BNB - Binance Coin' },
  // Add more token options as needed
];

const App = () => (
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
    <TokenSelector tokens={tokens} initialBalance={0} />
  </div>
);

export default App;
