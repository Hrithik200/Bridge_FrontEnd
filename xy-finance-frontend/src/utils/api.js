import axios from 'axios';
import { GET_TOKENS_URL, POST_QUOTES_URL, POST_PARAMS_URL,GET_CHAIN} from '../constants/urls';
import Swal from 'sweetalert2';

export const fetchchain = async () => {
    console.log("Hello")
    const response = await axios.get(GET_CHAIN);
    console.log("---------------------------------------");
    console.log("Reponse",response)
    return response.data;
};

export const fetchTokens = async (data) => {
    const response = await axios.get(`${GET_TOKENS_URL}?chainId=${data}`);
    //http://localhost:5000/api/tokens?chainId=1
    return response.data;
};

export const fetchQuote = async (tokenData) => {
    console.log("In the fetchQuote",tokenData)
    const response = await axios.get(
        `${POST_QUOTES_URL}?srcChainId=${tokenData.selectedFromChain}&srcQuoteTokenAddress=${tokenData.selectedFromToken}&srcQuoteTokenAmount=${tokenData.fromAmount}&dstChainId=${tokenData.selectedToChain}&dstQuoteTokenAddress=${tokenData.selectedToToken}&slippage=5`
    );
    console.log(response,"Response")
    return response.data;
};

export const fetchTransactionParams = async (quoteData) => {
     console.log("IN the FETCH TRANS API")

    const response = await axios.get(`${POST_PARAMS_URL}?srcChainId=${quoteData.srcChainId}&srcQuoteTokenAddress=${quoteData.srcQuoteTokenAddress}&srcQuoteTokenAmount=${quoteData.srcQuoteTokenAmount}&dstChainId=${quoteData.dstChainId}&dstQuoteTokenAddress=${quoteData.dstQuoteTokenAddress}&slippage=${quoteData.slippage}&receiver=${quoteData.receiver}&bridgeProvider=${quoteData.bridgeProvider}&srcBridgeTokenAddress=${quoteData.srcBridgeTokenAddress}&dstBridgeTokenAddress=${quoteData.dstBridgeTokenAddress}&srcSwapProvider=${quoteData.srcSwapProvider}&dstSwapProvider=${quoteData.dstSwapProvider}`);

    return response.data;
};
