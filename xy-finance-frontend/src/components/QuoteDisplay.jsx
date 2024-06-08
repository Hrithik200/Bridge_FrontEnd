// import React, { useState } from 'react';
// import { fetchQuote } from '../utils/api';

// const QuoteDisplay = ({ token }) => {
//     const [quote, setQuote] = useState(null);

//     const getQuote = async () => {
//         const quoteData = await fetchQuote({ token });
//         setQuote(quoteData);
//     };

//     return (
//         <div>
//             <button onClick={getQuote}>Get Quote</button>
//             {quote && (
//                 <div>
//                     <p>Quote: {quote.amount}</p>
//                     <p>Gas Fee: {quote.gasFee}</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default QuoteDisplay;
