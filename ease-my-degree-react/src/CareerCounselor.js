// CareerCounselor.js
// Acts as an AI career counselor for academic guidance and support.

// Import required modules and components
import React, { useState } from "react"; // React and useState for state management
import axios from "axios"; // Axios for HTTP requests
import Papa from "papaparse"; // PapaParse for parsing CSV files
import ReactMarkdown from "react-markdown"; // ReactMarkdown for rendering Markdown
import "./CareerCounselor.css"; // CSS for styling the component

// Define the CareerCounselor component
function CareerCounselor() {
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY; // API key for OpenAI from environment variables
  const [school, setSchool] = useState(""); // State to track selected school
  const [message, setMessage] = useState(""); // State for user input message
  const [messages, setMessages] = useState([]); // State to store conversation messages
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [degreeSuggestions, setDegreeSuggestions] = useState(""); // State to hold fetched degree suggestions

  // Log an error if the API key is missing
  if (!openaiApiKey) {
    console.error("API Key is missing! Please ensure it's in your .env file.");
  }

  const model = "gpt-4o"; // OpenAI model to use
  const maxTokens = 1500; // Limit for maximum tokens in API responses

  // Event handler for school selection
  const handleSchoolChange = async (e) => {
    const selectedSchool = e.target.value; // Get selected school value
    setSchool(selectedSchool); // Update the school state

    if (selectedSchool) {
      await fetchDegreeSuggestions(selectedSchool); // Fetch degree suggestions if a school is selected
    }
  };

  // Event handler for updating message input state
  const handleMessageChange = (e) => setMessage(e.target.value);

  // Function to fetch degree suggestions from a CSV file
  const fetchDegreeSuggestions = async (school) => {
    try {
      const filePath = `/data/${school}_DegreeOfferings.csv`; // Path to the CSV file
      const response = await axios.get(filePath); // Fetch the file using Axios

      Papa.parse(response.data, {
        header: true, // Parse CSV with headers
        skipEmptyLines: true, // Skip empty lines
        complete: (results) => {
          if (results.errors.length) {
            console.error("Errors in CSV parsing:", results.errors); // Log parsing errors
          }

          const data = results.data; // Parsed data

          if (data.length > 0 && data[0]['Program Name'] && data[0]['Degree Type']) {
            // Build a string of degree suggestions
            const textContent = data
              .map((row) => `${row['Degree Type']}: ${row['Program Name']}`)
              .join("\n");
            setDegreeSuggestions(textContent); // Update state with degree suggestions
          } else {
            console.error("Expected columns 'Program Name' or 'Degree Type' not found.");
            setDegreeSuggestions("No valid data found in the CSV."); // Handle missing data
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error); // Log parsing errors
        },
      });
    } catch (error) {
      console.error("Error fetching CSV:", error); // Handle file fetching errors
    }
  };

  // Function to handle message submission
  const handleSubmitMessage = async () => {
    if (!message.trim()) {
      alert("Please type a message before sending."); // Alert if the message is empty
      return;
    }

    setLoading(true); // Show loading indicator

    if (school && !degreeSuggestions) {
      await fetchDegreeSuggestions(school); // Fetch degree suggestions if missing
    }

    // Format degree suggestions for the message
    const structuredDegreeList = degreeSuggestions
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => `- ${line}`)
      .join("\n");

    // Add the user message to the conversation
    const newMessages = [...messages, { sender: "student", text: message }];
    setMessages(newMessages);
    setMessage(""); // Clear the input field

    // Give restrictions by creating a modified prompt for the AI
    const modifiedMessage = `
    You are an academic advisor at ${school}. Below is the only valid list of available minors and programs:
  
    ${structuredDegreeList}
  
    When responding to the student's query about a program, only suggest minors or programs found in the above list. If the student mentions 
    
    a minor or program not listed, politely explain that it is not available at ${school}. 
  
    1.  Do not assume or suggest anything outside this list. Every response must strictly follow ${school}'s offerings.
  
    2. NEVER TELL THE STUDENT YOU DONT KNOW WHAT DEGREES THERE ARE, OR ASK FOR A LIST. NEVER GIVE THE IMPRESSION
  
    THAT YOU DO NOT HAVE INFO ON THE MINORS OR PROGRAMS, OR THAT YOU ARE WAITING FOR THE STUDENT TO GIVE YOU ONE.
  
    YOU HAVE THE LIST!!!
    
    3. Always HYPERLINK ANY LINKS!
    
    4. DO NOT SUGGEST A MINOR OR DOUBLE MAJOR THE SAME AS THEIR MAJOR.
    
    5. ALWAYS BE KIND AN SUPPORTIVE, AND HAVE SCHOOL SPIRIT.
    
    6. YOU ARE ALSO A COUNSELOR. LET THEM RANT TO YOU IF NEEDED.`; 

    try {
      // Send the conversation to the OpenAI API
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
          timeout: 30000, // API timeout
        }
      );

      // Add AI response to the conversation
      const chatGptResponse = {
        sender: "planner",
        text: response.data.choices[0].message.content.trim(),
      };

      setMessages((prevMessages) => [...prevMessages, chatGptResponse]);
    } catch (error) {
      console.error("Error communicating with OpenAI API:", error); // Handle API errors
      alert("There was an error processing your request. Please try again.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Render the CareerCounselor component
  return (
    <div className="career-counselor">
      {/* Dropdown for school selection */}
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

      {/* Chatbox interface */}
      <div className="chatbox-container">
        <div className="chat-box">
          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "planner" ? "planner-message" : "student-message"}
              >
                {msg.sender === "planner" ? (
                  <ReactMarkdown children={msg.text} /> // Render Markdown for AI messages
                ) : (
                  <p>{msg.text}</p> // Render plain text for user messages
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
              disabled={loading} // Disable input when loading
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

// Export the component for use in the app
export default CareerCounselor;
