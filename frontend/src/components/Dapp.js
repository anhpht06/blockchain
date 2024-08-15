import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MintRC20 from "../contracts/MintRC20.json";
import MintERC721 from "../contracts/MintERC721.json";
import Deposited from "../contracts/Deposited.json";
import contractAddresses from "../contracts/contract-address.json";
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

export const Dapp = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);
  const [txBeingSent, setTxBeingSent] = useState(null);
  const [erc20Balance, setErc20Balance] = useState(0);
  const [depositedTokens, setDepositedTokens] = useState(0);
  const [erc721Balance, setErc721Balance] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const ERC20TokenAddress = contractAddresses.mintRC20;
  const DepositContractAddress = contractAddresses.deposited;
  const ERC721TokenAddress = contractAddresses.mintERC721;

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        setError(
          "MetaMask is not installed. Please install it to use this app."
        );
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      try {
        // Request account access if needed
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const network = await provider.getNetwork();
        setNetwork(network);

        const signer = provider.getSigner();
        setSigner(signer);
        setUserAddress(await signer.getAddress());
      } catch (error) {
        setError(error.message);
      }
    };

    init();
  }, []);

  const getERC20Balance = async () => {
    const erc20Contract = new ethers.Contract(
      ERC20TokenAddress,
      MintRC20.abi,
      provider
    );
    const balance = await erc20Contract.balanceOf(userAddress);
    setErc20Balance(ethers.utils.formatUnits(balance, 18));
  };

  const getDepositedBalance = async () => {
    const depositContract = new ethers.Contract(
      DepositContractAddress,
      Deposited.abi,
      provider
    );
    const balance = await depositContract.deposits(userAddress);
    setDepositedTokens(ethers.utils.formatUnits(balance, 18));
  };

  const getERC721Balance = async () => {
    const erc721Contract = new ethers.Contract(
      ERC721TokenAddress,
      MintERC721.abi,
      provider
    );
    const balance = await erc721Contract.balanceOf(userAddress);
    setErc721Balance(Number.parseInt(balance.toString(), 10));
  };
  const mintERC20Tokens = async () => {
    try {
      const erc20Contract = new ethers.Contract(
        ERC20TokenAddress,
        MintRC20.abi,
        signer
      );
      const tx = await erc20Contract.mint(
        userAddress,
        ethers.utils.parseUnits("1000", 18),
        { gasLimit: 3000000 }
      ); // Mint 100 tokens
      setTxBeingSent(tx.hash);
      await tx.wait();
      await getERC20Balance();
    } catch (error) {
      setError(error.message);
    } finally {
      setTxBeingSent(null);
    }
  };
  const depositERC20Tokens = async (amount) => {
    try {
      const erc20Contract = new ethers.Contract(
        ERC20TokenAddress,
        MintRC20.abi,
        signer
      );
      const depositContract = new ethers.Contract(
        DepositContractAddress,
        Deposited.abi,
        signer
      );

      // Check ERC20 token balance before proceeding
      const balance = await erc20Contract.balanceOf(userAddress);
      if (balance.lt(ethers.utils.parseUnits(amount, 18))) {
        setErrorMessage("Insufficient ERC20 token balance");
        return;
      }

      // Approve tokens for the deposit contract
      const approvalTx = await erc20Contract.approve(
        DepositContractAddress,
        ethers.utils.parseUnits(amount, 18)
      );
      await approvalTx.wait();

      // Deposit tokens
      const depositTx = await depositContract.deposit(
        ethers.utils.parseUnits(amount, 18),
        { gasLimit: ethers.utils.hexlify(700000) }
      ); // Increased gas limit
      setTxBeingSent(depositTx.hash);
      await depositTx.wait();

      await getERC20Balance();
      await getDepositedBalance();
      await getERC721Balance();
    } catch (error) {
      console.error("Error during deposit:", error);
      setError(error.message);
    } finally {
      setTxBeingSent(null);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (userAddress) {
      getERC20Balance();
      getDepositedBalance();
      getERC721Balance();
    }
  }, [userAddress]);

  if (!provider) return <NoWalletDetected />;
  if (error) return <p>{error}</p>;
  if (!userAddress) return <ConnectWallet />;

  return (
    <div className="m-5">
      <h1 style={{ color: "red" }}>Welcome {userAddress}</h1>
      <hr />
      <h2 className="row ml-1">
        MintRC20 ----------------- you have{" "}
        <p className="ml-3" style={{ color: "red" }}>
          {erc20Balance}
        </p>
      </h2>
      <h2 className="row ml-1">
        Deposited Tokens -------- you have{" "}
        <p className="ml-3" style={{ color: "red" }}>
          {depositedTokens}
        </p>{" "}
      </h2>
      <h2 className="row ml-1">
        ERC721 Balance ---------- you have{" "}
        <p className="ml-3" style={{ color: "red" }}>
          {erc721Balance}
        </p>
      </h2>

      {txBeingSent && <WaitingForTransactionMessage txHash={txBeingSent} />}
      {error && <TransactionErrorMessage message={error} />}
      {errorMessage && <TransactionErrorMessage message={errorMessage} />}

      <hr />
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        style={{
          color: "black",
          backgroundColor: "greenyellow",
          borderRadius: "10px",
          marginRight: "30px",
        }}
        onClick={mintERC20Tokens}
      >
        Mint 1000 ERC20 Tokens
      </button>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        style={{
          color: "black",
          backgroundColor: "#F46D6D",
          borderRadius: "10px",
        }}
        onClick={() => depositERC20Tokens("500")}
      >
        Deposit 500 ERC20 Tokens
      </button>
    </div>
  );
};
