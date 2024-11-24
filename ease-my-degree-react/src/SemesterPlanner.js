import React, { useState } from "react";
import "./SemesterPlanner.css";
import axios from "axios";

function SemesterPlanner() {

  console.log(process.env); // Logs all environment variables

  const [messages, setMessages] = useState([]);
  const [studentInput, setStudentInput] = useState("");
  const [loading, setLoading] = useState(false);

  // OpenAI API Key from .env
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;

  // Ensure the API key is available
  if (!openaiApiKey) {
    console.error("API Key is missing! Please ensure it's in your .env file.");
  }

  const handleSend = async () => {
    if (!studentInput.trim()) return;

    // Add student message to the chat
    const newMessages = [...messages, { sender: "student", text: studentInput }];
    setMessages(newMessages);
    setStudentInput("");
    setLoading(true);

    try {
      // Make API call with timeout
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",  // Ensure you're using the correct model name
          messages: [{ role: "user", content: studentInput }],
          max_tokens: 150,  // Set the response length limit
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,  // Pass API key in Authorization header
            "Content-Type": "application/json",  // Content-Type for JSON request
          },
          timeout: 10000,  // Optional: Set timeout to 10 seconds
        }
      );

      const chatGptResponse = {
        sender: "planner",
        text: response.data.choices[0].message.content.trim(),
      };

      setMessages((prevMessages) => [...prevMessages, chatGptResponse]);
    } catch (error) {
      console.error("Error communicating with OpenAI API:", error);

      // Handle specific error cases
      let errorMessage = "Sorry, I couldn't process your request. Please try again later.";
      if (error.code === "ECONNABORTED") {
        errorMessage = "The server is taking too long to respond. Please try again later.";
      } else if (error.response && error.response.status === 401) {
        errorMessage = "Authentication error: Please check your API key.";
      }

      const errorResponse = {
        sender: "planner",
        text: errorMessage,
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="semester-planner">
      <div className="planner-history">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`planner-message ${msg.sender === "planner" ? "planner" : "student"}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="planner-message planner">Loading...</div>}
      </div>
      <div className="planner-input-container">
        <input
          type="text"
          value={studentInput}
          onChange={(e) => setStudentInput(e.target.value)}
          placeholder="Type your input..."
          className="planner-input"
          disabled={loading}
        />
        <button onClick={handleSend} className="send-button" disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default SemesterPlanner;
