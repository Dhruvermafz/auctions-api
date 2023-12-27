const database = {
  bugReports: [],
  feedback: [],
};

module.exports = {
  bug: (req, res) => {
    try {
      logRequestBody(req.body);

      // Example: Save bug report to a database
      database.bugReports.push(req.body);

      res.status(200).json({ message: "Bug report received successfully!" });
    } catch (error) {
      console.error("Error handling bug report:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  feedback: (req, res) => {
    try {
      logRequestBody(req.body);

      // Example: Save feedback to a database
      database.feedback.push(req.body);

      res.status(200).json({ message: "Feedback received successfully!" });
    } catch (error) {
      console.error("Error handling feedback:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

function logRequestBody(body) {
  console.log("Received Request Body:", body);
}
