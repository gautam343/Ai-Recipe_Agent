import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import './ImageUpload.css';

const ImageUpload = ({ onIngredientsFound }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

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
          onIngredientsFound(data.ingredients);
        }
      } catch (error) {
        console.error(`Failed to analyze ${file.name}`, error);
      }
    }
    
    setUploading(false);
    e.target.value = ''; 
  };

  return (
    <div className="image-upload-wrapper">
      <label htmlFor="camera-upload" className="icon-trigger" title="Snap Ingredients">
        {uploading ? <Loader2 className="spin" size={20}/> : <Camera size={22} />}
      </label>
      <input 
        id="camera-upload" 
        type="file" 
        accept="image/*" 
        multiple 
        onChange={handleFileChange} 
        disabled={uploading}
        style={{ display: 'none' }} 
      />
    </div>
  );
};

export default ImageUpload;