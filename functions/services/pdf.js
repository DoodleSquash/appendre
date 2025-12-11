const { storage } = require('../config');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const { Readable } = require('stream');

async function uploadPdfBuffer(uid, buffer, originalName) {
  const bucket = storage.bucket();
  const fileId = uuidv4();
  const filePath = `pdf_uploads/${uid}/${fileId}_${originalName}`;
  const file = bucket.file(filePath);

  const stream = Readable.from(buffer);
  await new Promise((resolve, reject) => {
    stream
      .pipe(file.createWriteStream({ metadata: { contentType: 'application/pdf' } }))
      .on('finish', resolve)
      .on('error', reject);
  });

  return { filePath };
}

async function extractPdfText(buffer) {
  const data = await pdfParse(buffer);
  return data.text || '';
}

module.exports = {
  uploadPdfBuffer,
  extractPdfText
};




