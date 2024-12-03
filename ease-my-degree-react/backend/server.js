const express = require("express");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const pdfParse = require("pdf-parse");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = 5001;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON
app.use(express.json());

// Initialize OpenAI API
const openai = new OpenAIApi(
  new Configuration({
    apiKey: "YOUR_OPENAI_API_KEY", // Replace with your OpenAI API key
  })
);

// Helper function to extract text from PDF
const extractPdfText = async (school) => {
  const pdfPath = path.join(__dirname, "public", "data", `${school}_CourseOfferings.pdf`);
  const pdfBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(pdfBuffer);
  return data.text;
};

// Endpoint to handle updating courses
app.post("/api/update-courses", (req, res) => {
  const { school, major, updatedCourses } = req.body;

  // Original file path (to read the original data)
  const originalFilePath = path.join(__dirname, "public", "data", `${school}_${major}.csv`);

  // Target file path for the updated file
  const updatedFilePath = path.join(__dirname, "public", "data", "ClassInfo.csv");

  // Check if the original file exists
  if (!fs.existsSync(originalFilePath)) {
    return res.status(404).json({ message: "Original CSV file not found for the selected school and major." });
  }

  // Read the original file
  fs.readFile(originalFilePath, "utf8", (err, csvData) => {
    if (err) {
      console.error("Error reading the file:", err);
      return res.status(500).json({ message: "Error reading the CSV file." });
    }

    // Parse the CSV data
    const parsedData = Papa.parse(csvData, { header: true });
    const rows = parsedData.data;

    // Update the courses with creditReceived and grade
    updatedCourses.forEach((course) => {
      const row = rows.find((r) => r.courseNumber === course.courseNumber);
      if (row) {
        row.creditReceived = course.creditReceived;
        row.grade = course.grade;
      }
    });

    // Convert updated data back to CSV
    const updatedCSV = Papa.unparse(rows);

    // Write the updated CSV to the new file path
    fs.writeFile(updatedFilePath, updatedCSV, "utf8", (err) => {
      if (err) {
        console.error("Error writing the file:", err);
        return res.status(500).json({ message: "Error saving the updated CSV file." });
      }
      res.json({ message: "Courses updated successfully!", filePath: `/data/ClassInfo.csv` });
    });
  });
});

// Endpoint to handle chat requests for degree suggestions
app.post("/api/chat", async (req, res) => {
  const { school, userMessage } = req.body;

  try {
    // Extract the PDF text for the selected school
    const schoolPdfText = await extractPdfText(school);

    // Create a prompt for GPT-3.5 based on the PDF and user message
    const prompt = `
      Given the following course offerings for ${school}:
      ${schoolPdfText}
      Answer the following question:
      ${userMessage}
    `;

    // Call OpenAI to get a response based on the prompt
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error handling chat request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
