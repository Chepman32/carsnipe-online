import React, { useState } from 'react';
import { uploadData } from '@aws-amplify/storage';

const MusicUploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);

    const onProgress = (progress) => {
      console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
    };

    try {
      const result = await uploadData({
        path: `public/album/2024/${file.name}`,
        data: file,
        options: {
          contentType: file.type,
          progressCallback: onProgress,
        },
      });

      console.log('Upload result:', result);
      setUploadMessage(`File uploaded successfully: ${result.key}`);
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage(`Error uploading file: ${error.message}`);
    }

    setUploading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Music</h2>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Music'}
      </button>
      {uploadMessage && <p>{uploadMessage}</p>}
    </div>
  );
};

export default MusicUploadPage;