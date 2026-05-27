import React, { useState, useRef } from 'react';
import { Upload, Scan, AlertTriangle, CheckCircle, Leaf, Loader, Droplets, XCircle, Sparkles } from 'lucide-react';

export default function DiseaseDetector() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const imgRef = useRef(null);


  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imgUrl = URL.createObjectURL(file);
      setImage(imgUrl);
      setResult(null);
      setErrorMsg(null);
    }
  };

  // Run AI when the image finishes loading in the DOM
  const handleImageLoad = async () => {
    if (!imgRef.current) return;
    
    setIsScanning(true);
    
    try {
      // Direct call to Gemini Vision API on Backend (Bypassing heavy local MobileNet)
      try {
        // Extract base64 synchronously from the loaded image to avoid React state race conditions
        const canvas = document.createElement("canvas");
        canvas.width = imgRef.current.naturalWidth;
        canvas.height = imgRef.current.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgRef.current, 0, 0);
        const base64Data = canvas.toDataURL("image/jpeg");

        const response = await fetch('https://kisan-connect-lzul.onrender.com/api/analyze-disease', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageBase64: base64Data })
        });
        
        if (!response.ok) {
          throw new Error('API Request Failed');
        }
        
        const data = await response.json();
        
        setIsScanning(false);
        setResult(data);
        
      } catch (apiError) {
        console.error("Backend AI Error:", apiError);
        setIsScanning(false);
        setErrorMsg("Failed to reach the AI servers. Make sure backend is running.");
      }
      
    } catch (err) {
      console.error(err);
      setIsScanning(false);
      setErrorMsg("Failed to analyze image. Please try again.");
    }
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-in' },
    header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', color: 'var(--text)' },
    uploadCard: { background: 'var(--surface)', border: '2px dashed rgba(6, 182, 212, 0.4)', borderRadius: '24px', padding: '3rem', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
    uploadedImage: { width: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: '16px', zIndex: 1 },
    scannerLine: { position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, transparent, #06b6d4, #0ea5e9, transparent)', boxShadow: '0 0 25px 10px rgba(6, 182, 212, 0.6)', animation: 'scan 2.5s infinite ease-in-out', zIndex: 10 },
    resultCard: { background: 'linear-gradient(145deg, var(--surface), rgba(251, 191, 36, 0.05))', borderRadius: '24px', padding: '2.5rem', marginTop: '2.5rem', border: '1px solid rgba(251, 191, 36, 0.2)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)', position: 'relative', overflow: 'hidden' },
    errorCard: { background: 'linear-gradient(145deg, #fef2f2, #fff)', borderRadius: '24px', padding: '2.5rem', marginTop: '2.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', boxShadow: '0 20px 40px rgba(239, 68, 68, 0.1)', color: '#991b1b' },
    pill: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2))', color: '#d97706', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)' },
    button: { marginTop: '1.5rem', background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 16px rgba(6, 182, 212, 0.3)', transition: 'transform 0.2s, boxShadow 0.2s' }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .grid-overlay {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background-image: linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px);
            background-size: 25px 25px; zIndex: 5; opacity: 0.6;
            animation: fadeIn 0.5s;
          }
          @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        `}
      </style>

      <div style={styles.header} className="mobile-col mobile-text-center">
        <div style={{ padding: '14px', background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)', borderRadius: '18px', color: 'white', boxShadow: '0 8px 20px rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Scan size={36} />
          <Leaf size={16} color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.8 }} />
          <Sparkles size={18} color="#fff" style={{ position: 'absolute', top: -5, right: -5, animation: 'pulse 1.5s infinite', filter: 'drop-shadow(0 0 5px white)' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(90deg, #164e63, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} className="mobile-stack">
            AI Crop Health Scanner
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Upload a photo of your crop to instantly detect diseases using Artificial Intelligence.
          </p>
        </div>
      </div>

      <label style={{ ...styles.uploadCard, display: 'block' }}>
        <input 
          type="file" 
          accept="image/*,capture=camera" 
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          disabled={isScanning}
        />
        
        {!image ? (
          <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.15))', padding: '28px', borderRadius: '50%', marginBottom: '1.5rem',
                border: '2px solid rgba(6, 182, 212, 0.5)', boxShadow: '0 0 25px rgba(6, 182, 212, 0.3)',
                animation: 'pulse 2s infinite'
              }}>
                <Upload size={52} color="#06b6d4" />
              </div>
            <h3 style={{ fontSize: '1.6rem', color: '#164e63', margin: '0 0 8px 0', textShadow: '0 1px 2px rgba(6,182,212,0.1)' }}>Tap to Upload Crop Photo</h3>
            <p style={{ color: 'var(--text-muted)', fontWeight: '600', background: 'rgba(14, 165, 233, 0.15)', padding: '6px 16px', borderRadius: '20px', display: 'inline-block', border: '1px solid rgba(14,165,233,0.2)' }}>
              Real-Time Cloud Vision Engine Active
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <img 
              ref={imgRef}
              src={image} 
              alt="Crop" 
              style={styles.uploadedImage} 
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            {isScanning && (
              <>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(22, 78, 99, 0.6)', borderRadius: '16px', zIndex: 2, backdropFilter: 'blur(3px)' }}></div>
                <div className="grid-overlay"></div>
                <div style={styles.scannerLine}></div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#06b6d4', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '20px', borderRadius: '50%', backdropFilter: 'blur(8px)', border: '2px solid rgba(6, 182, 212, 0.6)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }}>
                    <Loader size={54} className="animate-spin" color="#22d3ee" />
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '1px', textShadow: '0 4px 8px rgba(0,0,0,0.8)', color: 'white' }}>Scanning crop health...</span>
                </div>
              </>
            )}
          </div>
        )}
      </label>

      {errorMsg && !isScanning && (
        <div style={styles.errorCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <XCircle size={24} />
            <h3 style={{ margin: 0 }}>Invalid Image Detected</h3>
          </div>
          <p style={{ marginTop: '10px' }}>{errorMsg}</p>
          <button style={{...styles.button, background: '#991b1b'}} onClick={() => { setImage(null); setErrorMsg(null); }}>
            <Upload size={18} /> Upload A Real Crop
          </button>
        </div>
      )}

      {result && !isScanning && (
        <div style={styles.resultCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }} className="mobile-col">
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.8rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '12px' }} className="mobile-stack">
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '8px', borderRadius: '12px' }}>
                  <AlertTriangle size={28} color="#d97706" />
                </div>
                {result.disease}
              </h3>
              <p style={{ margin: 0, color: 'var(--text)', fontSize: '1.1rem', lineHeight: '1.6' }}>{result.description}</p>
            </div>
            <div style={styles.pill}>
              <CheckCircle size={18} /> Confidence: {result.confidence}
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
            <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '1.2rem' }}>
              <Droplets size={22} /> Recommended Action
            </h4>
            <p style={{ margin: 0, fontWeight: '500', fontSize: '1.1rem', color: '#065f46', lineHeight: '1.5' }}>{result.action}</p>
          </div>
          
          <button style={styles.button} onClick={() => { setImage(null); setResult(null); }}>
            <Upload size={20} /> Scan Another Photo
          </button>
        </div>
      )}
    </div>
  );
}
