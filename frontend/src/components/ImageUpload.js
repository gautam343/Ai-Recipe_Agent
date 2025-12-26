import React, { useState } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ onIngredientsFound }) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]); // Array for multiple previews

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    if (files.length === 0) return;

    setUploading(true);

    // 1. Generate Previews immediately
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    // 2. Process each image sequentially
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch('http://localhost:5000/api/analyze-image', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        
        if (data.ingredients) {
          console.log(`✅ Detected in ${file.name}:`, data.ingredients);
          // Send to SmartChef immediately after detection
          onIngredientsFound(data.ingredients);
        }
      } catch (error) {
        console.error(`❌ Failed to analyze ${file.name}`, error);
      }
    }

    setUploading(false);
    
    // Clear file input so you can upload the same file again if needed
    e.target.value = ''; 
  };

  return (
    <div className="image-upload-container">
      <label htmlFor="camera-upload" className={`upload-btn ${uploading ? 'disabled' : ''}`}>
        {uploading ? '👀 Analyzing...' : '📸 Snap Ingredients (Multi)'}
      </label>
      
      {/* ADDED: "multiple" attribute */}
      <input 
        id="camera-upload" 
        type="file" 
        accept="image/*" 
        multiple 
        onChange={handleFileChange} 
        disabled={uploading}
        style={{ display: 'none' }} 
      />

      {/* Render list of previews */}
      <div className="preview-list">
        {previews.map((src, index) => (
          <img key={index} src={src} alt="Ingredient" className="mini-preview fade-in" />
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;