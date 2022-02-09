import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/EternalWords.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  let [message, setMessage] = useState("");
  let displayMessages = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const contractAddress = "0x280cC86579F702765E2246F5A291AD2B8956bC5f";
  const contractABI = abi.abi;

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum){
        console.log("Please ensure that you  have Metamask istalled.");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected to account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const storeMessage = async () => {
    try{

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const eternalWordsContract = new ethers.Contract(contractAddress, contractABI, signer);

        const messageTxn = await eternalWordsContract.storeMessage(message, { gasLimit: 300000 });
        console.log("Mining...", messageTxn.hash);

        await messageTxn.wait();
        console.log("Mined -- ", messageTxn.hash);

      } else {
        console.log("Ethereum Object not found.")
      }
    } catch(error) {
      console.log(error)
    }
  }

  const messageQuery = async () => {
    try{

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const eternalWordsContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await eternalWordsContract.getTotalMessages();
        console.log("The total number of messages that have been sent to this address is ",count.toNumber());
        getAllMessages();
      } else {
        console.log("Ethereum Object not found.")
      }
    } catch(error) {
      console.log(error)
    }
  }

  const getAllMessages = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const eternalWordsContract = new ethers.Contract(contractAddress, contractABI, signer);
      const ems = await eternalWordsContract.getAllMessages();

      const wordsCleaned = ems.map(eternalMessage => {
        return {
          address: eternalMessage.sender,
          timestamp: new Date(eternalMessage.timestamp * 1000),
          message: eternalMessage.message,
        };
      });

      setAllMessages(wordsCleaned);
      displayMessages=True;
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
  };

  useEffect(() => {
  let eternalWordsContract;

  const onNewEternalWord = (from, timestamp, message) => {
    console.log("NewEternalWord", from, timestamp, message);
    setAllMessages(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    eternalWordsContract = new ethers.Contract(contractAddress, contractABI, signer);
    eternalWordsContract.on("NewEternalWord", onNewEternalWord);
  }

  return () => {
    if (eternalWordsContract) {
      eternalWordsContract.off("NewEternalWord", onNewEternalWord);
    }
  };
}, []);
  

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header"><u>
        Welcome to Eternal Words</u>
        </div>

        <div className="bio">
        Eternal Words is a website that allows you to use blockchain to store a message permanently.
        You can write a message for someone who you deeply care for, a important date in your life, or any other words which you want everyone to see. By storing this message on the Ethereum blockchain we can ensure it will be avaliable to see at a specific address for as long as the blockchain keeps running.
        </div>

        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Click here to connect MetaMask
          </button>
        )}

        {currentAccount && (
          <div className="button group">
          <p className="quest">Enter a message to save on the blockchain then press the send button.</p>
          <form className="bio">
          <input required size="30" className="textField" type="text" name="Message" placeholder="Please enter message here" value={message} onChange={(newMessage) => setMessage(newMessage.target.value)}></input>
          <input type="button" className="submitButton"
          onClick={storeMessage}
          value="Send"></input>
          </form>
          <button onClick={messageQuery}>
          Display all messages
          </button>
          </div>
        )}

        {displayMessages && (
          allMessages.map((eternalMessage, index) => {
          return (
            <div key={index} className="eternalWordsDiv">
              <div>Sender: {eternalMessage.address}</div>
              <div>Time: {eternalMessage.timestamp.toString()}</div>
              <div>Message: {eternalMessage.message}</div>
            </div>)
        }))}

        
        </div>
      </div>
  );
}

export default App
