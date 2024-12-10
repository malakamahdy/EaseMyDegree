import React, { useState } from "react";
import axios from "axios";
import Papa from "papaparse"; // Import PapaParse for CSV parsing
import ReactMarkdown from "react-markdown"; // Import react-markdown
import "./CareerCounselor.css";

function CareerCounselor() {
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const [school, setSchool] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [degreeSuggestions, setDegreeSuggestions] = useState(""); 

  if (!openaiApiKey) {
    console.error("API Key is missing! Please ensure it's in your .env file.");
  }

  const model = "gpt-4o"; 
  const maxTokens = 1500; 

  const handleSchoolChange = (e) => setSchool(e.target.value);
  const handleMessageChange = (e) => setMessage(e.target.value);

  // Function to fetch and parse the CSV file based on the selected school
  const fetchDegreeSuggestions = async (school) => {
    try {
      const filePath = `/data/${school}_DegreeOfferings.csv`;
      const response = await axios.get(filePath);
  
      Papa.parse(response.data, {
        header: true, // Parse CSV with headers
        skipEmptyLines: true, // Skip empty rows
        complete: (results) => {
          if (results.errors.length) {
            console.error("Errors in CSV parsing:", results.errors);
          }
  
          const data = results.data;
          
          if (data.length > 0 && data[0]['Program Name'] && data[0]['Degree Type']) {
            const textContent = data
              .map((row) => `${row['Degree Type']}: ${row['Program Name']}`) // Use correct column names
              .join("\n");
            setDegreeSuggestions(textContent);
          } else {
            console.error("Expected columns 'Program Name' or 'Degree Type' not found.");
            setDegreeSuggestions("No valid data found in the CSV.");
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    } catch (error) {
      console.error("Error fetching CSV:", error);
    }
  };
  

  const handleSubmitMessage = async () => {
    if (!message.trim()) {
      alert("Please type a message before sending.");
      return;
    }
  
    setLoading(true);
  
    if (school && !degreeSuggestions) {
      await fetchDegreeSuggestions(school);
    }
  
    const structuredDegreeList = degreeSuggestions
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => `- ${line}`)
      .join("\n");
  
    const newMessages = [...messages, { sender: "student", text: message }];
    setMessages(newMessages);
    setMessage("");
  
    const modifiedMessage = `
    You are an academic advisor at ${school}. Below is the only valid list of available minors and programs:
  
    ${structuredDegreeList}
  
    When responding to the student's query, only suggest minors or programs found in the above list. If the student mentions a minor or program not listed,
    
    politely explain that it is not available at ${school}. 
  
    Do not assume or suggest anything outside this list. Every response must strictly follow ${school}'s offerings.
    
    NEVER TELL THE STUDENT YOU DONT KNOW WHAT DEGREES THERE ARE, OR ASK FOR A LIST. NEVER GIVE THE IMPRESSION
    
    THAT YOU DO NOT HAVE INFO ON THE MINORS OR PROGRAMS, OR THAT YOU ARE WAITING FOR THE STUDENT TO GIVE YOU ONE.
    
    YOU HAVE THE LIST!!!`;
    
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content: `Here are the official minors and programs at ${school}. Use this as the only source:\n\n${structuredDegreeList}`,
            },
            ...newMessages.map((msg) => ({
              role: msg.sender === "student" ? "user" : "assistant",
              content: msg.text,
            })),
            {
              role: "user",
              content: modifiedMessage,
            },
          ],
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
  
      const chatGptResponse = {
        sender: "planner",
        text: response.data.choices[0].message.content.trim(),
      };
  
      setMessages((prevMessages) => [...prevMessages, chatGptResponse]);
    } catch (error) {
      console.error("Error communicating with OpenAI API:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
    
  
  return (
    <div className="career-counselor">
      <div className="header">
        {!degreeSuggestions && (
          <div className="dropdown-container">
            <label>School:</label>
            <select onChange={handleSchoolChange} value={school}>
              <option value="">Select School</option>
              <option value="TAMU-CC">TAMU-CC</option>
              <option value="TexasState">Texas State</option>
              <option value="UT">UT</option>
            </select>
          </div>
        )}
      </div>

      <div className="chatbox-container">
        <div className="chat-box">
          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "planner" ? "planner-message" : "student-message"}
              >
                {msg.sender === "planner" ? (
                  <ReactMarkdown children={msg.text} />
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Type your message here..."
              value={message}
              onChange={handleMessageChange}
              disabled={loading}
            />
            <button onClick={handleSubmitMessage} disabled={loading || !message.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerCounselor;
