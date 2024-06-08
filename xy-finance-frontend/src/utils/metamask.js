import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider || 'http://localhost:5000');

export const connectToMetaMask = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      console.log('Connected account:', account);

      const balanceInWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });
      console.log('Balance in wei:', balanceInWei);

      const balanceInEth = web3.utils.fromWei(balanceInWei, 'ether');
      console.log('Balance in ETH:', balanceInEth);

      return { account, balance: parseFloat(balanceInEth) };
    } catch (error) {
      console.error("Error connecting to MetaMask", error);
      throw error;
    }
  } else {
    console.error("MetaMask is not installed");
    throw new Error("MetaMask is not installed");
  }
};
