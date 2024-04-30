const express = require('express');
const axios = require('axios');

const router = express.Router();

router.put('/generate-website', async (req, res) => {
  try {
    const accessToken = process.env.GITHUB_ACCESS_TOKEN;
    const owner = process.env.OWNER;
    const repo = process.env.REPO;
    const filePath = process.env.FILE_PATH;
    const fileContent = req.body.content;

    // Fetch current file content from GitHub
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = response.data;
    const currentContent = Buffer.from(data.content, 'base64').toString();
    const sha = data.sha;

    // Update file content
    const body = {
      message: 'Update file',
      content: Buffer.from(fileContent).toString('base64'),
      sha: sha,
    };
    const updateResponse = await axios.put(apiUrl, body, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (updateResponse.status === 200) {
      res.status(200).json({ message: 'File updated successfully' });
    } else {
      throw new Error('Failed to update file');
    }
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

module.exports = router;
