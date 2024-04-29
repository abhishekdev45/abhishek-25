import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { url } from "../api";
import Confetti from "react-confetti"; 
import Modal from "react-bootstrap/Modal"; // Import Bootstrap modal component
import Button from "react-bootstrap/Button";

function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [memeCoins, setMemeCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votingStartTime, setVotingStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  useEffect(() => {
    fetchMemeCoins();
  }, []); // Fetch meme coins when component mounts

  const token = localStorage.getItem("token");
  let userRole = "";

  if (token) {
    const decodedToken = jwtDecode(token);
    userRole = decodedToken.role;
  }

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${url}/api/meme-coins/generate`, {
        prompt,
      });
      if (response.status === 200) {
        setPrompt("");
        fetchMemeCoins();
      }
    } catch (error) {
      console.error("Error generating meme coins:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemeCoins = async () => {
    try {
      const response = await axios.get(`${url}/api/meme-coins/coins`);
      setMemeCoins(response.data);
      const startTime = response.data[0]?.votingStartTime;
      setVotingStartTime(startTime);
      startTimer(response.data.length > 0, startTime); // Start timer if meme coins exist
    } catch (error) {
      console.error("Error fetching meme coins:", error);
    }
  };

  const startTimer = (start, startTime) => {
    if (start && startTime) {
      const oneHourInMillis = 3600000; // 1 hour in milliseconds
      var date = new Date(startTime);
      const endTime = date.getTime() + oneHourInMillis;

      const intervalId = setInterval(() => {
        const now = Date.now();

        const timeRemaining = Math.max(0, endTime - now);

        setTimeLeft(timeRemaining);

        if (timeRemaining === 0) {
          clearInterval(intervalId);
          handleVotingEnded();
        }
      }, 1000);
    }
  };

  const formatTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleVote = async (coinId) => {
    try {
      const response = await axios.post(
        `${url}/api/meme-coins/vote/${coinId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        fetchMemeCoins(); // Fetch meme coins again to update UI
      }
    } catch (error) {
      if (error.response.status === 403) {
        setErrorMessage(error.response.data.message); // Set the error message
        setTimeout(() => {
          setErrorMessage(""); // Clear the error message after 3 seconds
        }, 3000);
      } else {
        console.error("Error voting for meme coin:", error);
      }
    }
  };

  const handleVotingEnded = async () => {
    try {
      const response = await axios.get(`${url}/api/meme-coins/winner`);
      if (response.status === 200) {
        setWinner(response.data); // Set the winner
        setShowWinnerModal(true);
      }
    } catch (error) {
      console.error("Error fetching winner:", error);
    }
  };

  const handleCloseWinnerModal = () => {
    setShowWinnerModal(false); 
  };

  return (
    <div className="container mt-5">
      <header className="text-center mb-5">
        <h1 className="display-4">collective.fun</h1>
      </header>
      {userRole === "prompter" && (
        <form onSubmit={handlePromptSubmit} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="form-control"
              placeholder="Enter prompt"
            />
            <button type="submit" className="btn btn-primary">
              Generate Meme Coins
            </button>
          </div>
        </form>
      )}
      {userRole !== "prompter" && (
        <div>
          <h2 className="text-center mb-3">Vote Now!!</h2>
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}
        </div>
      )}
      <div className="text-center mb-3">
        {loading && <div className="spinner-border" role="status"></div>}
        {!loading && memeCoins.length === 0 && (
          <div>No meme coins generated yet.</div>
        )}

        {timeLeft > 0 && <div>Time left: {formatTime(timeLeft)}</div>}
        {timeLeft === 0 && memeCoins.length > 0 && <div>Voting has ended.</div>}
      </div>
      <div className="row">
        {memeCoins.map((coin, index) => (
          <div
            key={index}
            className="col-md-4 mb-4"
            onClick={() => handleVote(coin._id)} // Add click event handler to vote for meme coin
            style={{ cursor: "pointer", border: "2px solid transparent" }}
          >
            <div className="card">
              <img
                src={coin.imageUrl}
                className="card-img-top"
                alt={`Meme Coin ${index}`}
              />
              <div className="card-body">
                <h5 className="card-title">Meme Coin {index + 1}</h5>
                <p className="card-text">Votes: {coin.votes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal show={showWinnerModal} onHide={handleCloseWinnerModal}>
      <Confetti />
        <Modal.Header closeButton>
          <Modal.Title>Winner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {winner && (
            <>
                
                <img src={winner.imageUrl} alt="Winner" className="img-fluid" />
                
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseWinnerModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
