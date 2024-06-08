import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { components } from "react-select";
import { connectToMetaMask } from "../utils/metamask";
import {
  fetchchain,
  fetchTokens,
  fetchQuote,
  fetchTransactionParams,
} from "../utils/api";
import "./TokenSelector.css";
import Swal from "sweetalert2";

const TokenSelector = ({ initialBalance }) => {
  const { handleSubmit, control, setValue, watch } = useForm();
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [fromAmount, setFromAmount] = useState();
  const [tokens, setTokens] = useState([]);
  const [selectedFromChain, setSelectedFromChain] = useState(null);
  const [selectedFromToken, setSelectedFromToken] = useState(null);

  const [recommendedTokens, setRecommendedTokens] = useState([]);
  const [recommendedTokens2, setRecommendedTokens2] = useState([]);

  const [selectedToChain, setSelectedToChain] = useState(null);
  const [selectedToToken, setSelectedToToken] = useState(null);

  const [toAmount, setToAmount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isToLoading, setIsToLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [exchangeRateDetail, setExchangeRateDetail] = useState(null);
  const [isFetchRateLoading, setIsFetchRateLoading] = useState(false);

  const watchedFromChain = watch("fromChain");
  const watchedToChain = watch("toChain");

  const fetchChains = async () => {
    try {
      const data = await fetchchain();
      setIsLoading(true);
      if (data.success) {
        setTokens(
          data.supportedChains.map((chain) => ({
            value: chain.chainId,
            label: chain.name,
          }))
        );
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chains", error);
    }
  };

  const fetchTokensForChain = async (chain, setTokensCallback) => {
    if (chain) {
      try {
        const data = await fetchTokens(chain?.value);
        setIsLoading(true);
        if (data.success) {
          console.log("recommendedTokens", data.recommendedTokens);
          setTokensCallback(
            data.recommendedTokens.map((token) => ({
              value: token.address,
              label: token.symbol,
              name: token.name,
              chainId: token.chainId,
              decimals: token.decimals,
              logoURI: token.logoURI,
            }))
          );
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tokens", error);
      }
    }
  };

  useEffect(() => {
    fetchChains();
  }, []);

  useEffect(() => {
    if (
      selectedFromChain &&
      selectedFromChain?.value &&
      selectedFromToken &&
      selectedFromChain?.value &&
      selectedToChain &&
      selectedToChain?.value &&
      selectedToToken &&
      selectedToToken?.value &&
      fromAmount
    ) {
      updateQuote();
    }
  }, [
    selectedFromChain,
    selectedToChain,
    selectedFromToken,
    fromAmount,
    selectedToToken,
  ]);

  const updateQuote = async () => {
    setIsFetchRateLoading(true);
    const newValues = {
      selectedFromChain:
        selectedFromChain && selectedFromChain?.value
          ? selectedFromChain?.value
          : null,
      selectedToChain:
        selectedToChain && selectedToChain?.value
          ? selectedToChain?.value
          : null,
      selectedFromToken:
        selectedFromToken && selectedFromToken.value
          ? selectedFromToken.value
          : null,
      fromAmount,
      toAmount,
      selectedToToken:
        selectedToToken && selectedToToken.value ? selectedToToken.value : null,
    };

    try {
      const quoteData = await fetchQuote(newValues);
      if (
        quoteData &&
        quoteData.success === false &&
        quoteData.errorMsg !== ""
      ) {
        setErrorMessage(quoteData.errorMsg);
      } else {
        console.log(quoteData);
        if (quoteData && quoteData?.routes && quoteData.routes.length > 0) {
          setExchangeRateDetail(quoteData.routes[0]);
          const dstBridgeTokenAmount =
            quoteData.routes[0].dstSwapDescription.dstTokenAmount;
          setToAmount(dstBridgeTokenAmount);
          setIsFetchRateLoading(false);
          setErrorMessage("");
        }
      }
    } catch (error) {
      // alert("Please change the token or chain Something in not supported right now", error);
      console.log({ error });
      setIsFetchRateLoading(false);
      Swal.fire("Error Suggestion Please change Chain /token");
    }
  };

  const handleConnectWallet = async () => {
    try {
      const { account, balance } = await connectToMetaMask();
      setAccount(account);
      setBalance(balance);
    } catch (error) {
      console.error("Failed to connect to MetaMask", error);
    }
  };

  const CustomOption = (props) => (
    <components.Option {...props}>
      <img
        src={props.data.logoURI}
        alt={props.data.label}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
      {props.data.label}
    </components.Option>
  );

  const handleChange = (name, value) => {
    if (name === "from_chain") {
      setValue("fromChain", value);
      setSelectedFromChain(value);
      setValue("fromChainToken", null);
      setSelectedFromToken(null);
      setIsLoading(true);
      setFromAmount(0);
      setValue("fromAmount", 0);
      fetchTokensForChain(value, setRecommendedTokens);
    }

    if (name === "from_chain_token") {
      setValue("fromChainToken", value);
      setSelectedFromToken(value);
    }

    if (name === "from_amount") {
      setFromAmount(value);
      setValue("fromAmount", value);
    }

    if (name === "to_chain") {
      setValue("toChain", value);
      setSelectedToChain(value);
      setValue("toChainToken", null);
      setSelectedToToken(null);
      setIsToLoading(true);
      fetchTokensForChain(value, setRecommendedTokens2);
      setToAmount(0);
      setValue("toAmount", 0);
    }

    if (name === "to_chain_token") {
      setValue("toChainToken", value);
      setSelectedToToken(value);
    }

    if (name === "to_amount") {
      setToAmount(value);
      setValue("toAmount", value);
    }
  };

  useEffect(() => {
    if (recommendedTokens && recommendedTokens.length > 0) {
      setIsLoading(false);
    }

    if (recommendedTokens2 && recommendedTokens2.length > 0) {
      setIsToLoading(false);
    }
  }, [recommendedTokens, recommendedTokens2]);

  const [isBridgeLoading,setIsBridgeLoading]=useState(false);
  const handleBridgeEvent = async () => {
    setIsBridgeLoading(true);
    // srcChainId, srcQuoteTokenAddress, srcQuoteTokenAmount, dstChainId, dstQuoteTokenAddress, slippage, receiver, affiliate, commissionRate, bridgeProvider, srcBridgeTokenAddress, dstBridgeTokenAddress, srcSwapProvider, dstSwapProvider
    let obj = {
      srcChainId: selectedFromChain?.value,
      srcQuoteTokenAddress: selectedFromToken?.value,
      srcQuoteTokenAmount: fromAmount,
      dstChainId: selectedToChain?.value,
      dstQuoteTokenAddress: selectedToToken?.value,
      slippage: 5,
      receiver: account,
      bridgeProvider: exchangeRateDetail.bridgeDescription.provider,
      srcBridgeTokenAddress:
        exchangeRateDetail.bridgeDescription.srcBridgeTokenAddress,
      dstBridgeTokenAddress:
        exchangeRateDetail.bridgeDescription.dstBridgeTokenAddress,
      srcSwapProvider:
        exchangeRateDetail.srcSwapDescription &&
        exchangeRateDetail.srcSwapDescription.provider
          ? exchangeRateDetail.srcSwapDescription.provider
          : null,
      dstSwapProvider:
        exchangeRateDetail.dstSwapDescription &&
        exchangeRateDetail.dstSwapDescription.provider
          ? exchangeRateDetail.dstSwapDescription.provider
          : null,
    };
    try {
      const quoteData = await fetchTransactionParams(obj);
      console.log(
        quoteData.success,
        "quoteData.success------------------------------"
      );
      if (!quoteData.success) {
        Swal.fire(quoteData.errorMsg);
        setIsBridgeLoading(false);

      } else {
        Swal.fire("Transaction Completed");
        console.log("Quote Data", quoteData);

        
          setValue("fromChain", null);
          setSelectedFromChain(null);
          setValue("fromChainToken", null);
          setSelectedFromToken(null);
          setFromAmount(0);
          setValue("fromAmount", 0);

        
          setValue("toChain", null);
          setSelectedToChain(null);
          setValue("toChainToken", null);
          setSelectedToToken(null);
          setToAmount(0);
          setValue("toAmount", 0);
          setIsBridgeLoading(false);
      }
    } catch (error) {
      console.log("in the catch");
      setIsBridgeLoading(false);

    }
  };

  useEffect(() => {
if(recommendedTokens){
  console.log({recommendedTokens});
}
  }, [recommendedTokens])

  return (
    <div className="container">
      <h2 className="header">BRIDGE</h2>
      <div className="balance-container">
        <span>Account {account} </span>
      </div>
      <div className="balance-container">
        <span>Balance in ETH : {parseFloat(balance).toFixed(4)} </span>
      </div>
      <form>
        <div className="token-input-container">
          <Controller
            name="fromChain"
            control={control}
            rules={{
              validate: (value) =>
                value?.value !== watchedToChain?.value ||
                "From Chain and To Chain cannot be the same.",
            }}
            render={({ field, fieldState: { error } }) => (
              <>
                <Select
                  {...field}
                  options={tokens.filter(
                    (item) => item?.value !== selectedToChain?.value
                  )}
                  value={selectedFromChain}
                  onChange={(selectedOption) =>
                    handleChange("from_chain", selectedOption)
                  }
                  classNamePrefix="react-select"
                />
                {error && <p className="error">{error.message}</p>}
                {isLoading && <p className="isLoading">Loading...</p>}
              </>
            )}
          />
          <Controller
            name="fromChainToken"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={recommendedTokens}
                value={selectedFromToken}
                onChange={(selectedOption) => {
                  handleChange("from_chain_token", selectedOption);
                }}
                classNamePrefix="react-select"
                components={{ Option: CustomOption }}
              />
            )}
          />
          <Controller
            name="fromAmount"
            control={control}
            rules={{ required: true, valueAsNumber: true }}
            render={({ field }) => (
              <input
                type="number"
                {...field}
                className="input"
                placeholder="0.0"
                onChange={(e) => {
                  handleChange("from_amount", e.target.value);
                }}
              />
            )}
          />
        </div>
        <div className="swap-icon-container">
          <span className="swap-icon">↓</span>
        </div>
        <div className="token-input-container">
          <Controller
            name="toChain"
            control={control}
            rules={{
              validate: (value) =>
                value?.value !== watchedFromChain?.value ||
                "To Chain and From Chain cannot be the same.",
            }}
            render={({ field, fieldState: { error } }) => (
              <>
                <Select
                  {...field}
                  options={tokens.filter(
                    (item) => item?.value != selectedFromChain?.value
                  )}
                  value={selectedToChain}
                  onChange={(selectedOption) => {
                    handleChange("to_chain", selectedOption);
                  }}
                  classNamePrefix="react-select"
                />
                {error && <p className="error">{error.message}</p>}

                {isToLoading && <p className="isLoading">Loading...</p>}
              </>
            )}
          />
        </div>
        <Controller
          name="toChainToken"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={recommendedTokens2}
              value={selectedToToken}
              onChange={(selectedOption) => {
                handleChange("to_chain_token", selectedOption);
              }}
              classNamePrefix="react-select"
              components={{ Option: CustomOption }}
            />
          )}
        />
        {toAmount && isFetchRateLoading == false ? (
          <>
            <Controller
              name="toAmount"
              control={control}
              render={({ field }) => (
                <input
                  className="input"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                />
              )}
            />
            {errorMessage ? <p>{errorMessage}</p> : <></>}
            <div className="exchange-info">
              {exchangeRateDetail && exchangeRateDetail.estimatedGas && (
                <h5>Estimated Gas fees: {exchangeRateDetail.estimatedGas}</h5>
              )}
              {exchangeRateDetail &&
                exchangeRateDetail.estimatedTransferTime && (
                  <h5>
                    Estimated Transfer Time:{" "}
                    {exchangeRateDetail.estimatedTransferTime} seconds
                  </h5>
                )}
              {exchangeRateDetail && exchangeRateDetail.slippage && (
                <h5>Slippage AUTO: {exchangeRateDetail.slippage}</h5>
              )}
              {exchangeRateDetail &&
                exchangeRateDetail.srcQuoteTokenUsdValue && (
                  <h5>
                    srcQuoteTokenUsdValue:{" "}
                    {exchangeRateDetail.srcQuoteTokenUsdValue}
                  </h5>
                )}
            </div>
          </>
        ) : isFetchRateLoading == true ? 
        <p>Please wait for sometime</p>
        :(
          <></>
        )}

        {account == null ? (
          <button
            type="button"
            onClick={handleConnectWallet}
            className="connect-button"
          >
            {"Connect wallet"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBridgeEvent}
            className="connect-button"
            disabled={isBridgeLoading}
          >
            
            {isBridgeLoading? <p className="isLoading">Loading...</p>:"Bridge"}
          </button>
       
        )}
      </form>
    </div>
  );
};

export default TokenSelector;
