import { fetchWithAuth } from './client';

export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);
  return fetchWithAuth('/upload/pdf', { method: 'POST', body: formData });
}

/**
 * Usage:
 * const inputFile = fileInput.files[0];
 * const { filePath, text } = await uploadPDF(inputFile);
 */




