const { uploadPdfBuffer, extractPdfText } = require('../services/pdf');

async function uploadPdf(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { filePath } = await uploadPdfBuffer(req.user.uid, req.file.buffer, req.file.originalname || 'upload.pdf');
    const text = await extractPdfText(req.file.buffer);
    return res.status(201).json({ filePath, text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  uploadPdf
};




