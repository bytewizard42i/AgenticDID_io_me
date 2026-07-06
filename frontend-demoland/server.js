const express = require('express');
const path = require('path');

const app = express();
const PORT = 3014;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'agenticdid-demoland', port: PORT });
});

app.listen(PORT, () => {
  console.log(`AgenticDID demoLand running on http://localhost:${PORT}`);
});
