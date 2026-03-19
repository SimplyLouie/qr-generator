import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check, ImagePlus, X, Frame, Grid3X3, RefreshCw, Github, Globe } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import './App.css';

export default function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(20);
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // New Styling State
  const [dotType, setDotType] = useState('square');
  const [cornerType, setCornerType] = useState('square');
  const [eyeColor, setEyeColor] = useState('#000000');
  const [dotColor, setDotColor] = useState('#000000');
  const [frameType, setFrameType] = useState('none');

  const qrContainerRef = useRef(null);
  const qrCodeInstance = useRef(null);
  const logoInputRef = useRef(null);

  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '', lastName: '', phone: '', email: '', organization: '', url: ''
  });

  const generateVCard = (c) => `BEGIN:VCARD\nVERSION:3.0\nFN:${c.firstName} ${c.lastName}\nN:${c.lastName};${c.firstName};;;\nORG:${c.organization}\nTEL:${c.phone}\nEMAIL:${c.email}\nURL:${c.url}\nEND:VCARD`;

  const formatUrl = (url) => {
    if (!url.trim()) return '';
    return (!url.startsWith('http://') && !url.startsWith('https://')) ? 'https://' + url : url;
  };

  useEffect(() => {
    qrCodeInstance.current = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'canvas',
      data: qrData || ' ',
      image: logo,
      dotsOptions: { color: dotColor, type: dotType },
      backgroundOptions: { color: "#ffffff" },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        imageSize: logoSize / 100
      },
      cornersSquareOptions: { type: cornerType, color: eyeColor },
      cornersDotOptions: { type: cornerType === 'square' ? 'square' : 'dot', color: eyeColor }
    });

    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrContainerRef.current);
      const canvas = qrContainerRef.current.querySelector('canvas');
      if (canvas) {
        canvas.style.cssText = 'width:100%; height:auto; border-radius:12px; display:block;';
      }
    }
  }, []);

  useEffect(() => {
    let data = '';
    if (activeTab === 'url') data = formatUrl(urlInput);
    else if (activeTab === 'text') data = textInput;
    else if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email)
      data = generateVCard(contactInfo);

    setQrData(data);

    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({
        data: data || ' ',
        image: logo || undefined,
        dotsOptions: { type: dotType, color: dotColor },
        cornersSquareOptions: { type: cornerType, color: eyeColor },
        cornersDotOptions: { type: cornerType === 'square' ? 'square' : 'dot', color: eyeColor },
        imageOptions: { imageSize: logoSize / 100 }
      });

      // Special handling for Step 4 where the container is newly mounted
      if (currentStep === 4 && qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
        qrCodeInstance.current.append(qrContainerRef.current);
        const canvas = qrContainerRef.current.querySelector('canvas');
        if (canvas) {
          canvas.style.cssText = 'width:100%; height:auto; border-radius:12px; display:block;';
        }
      }
    }
  }, [activeTab, urlInput, textInput, contactInfo, logo, logoSize, dotType, cornerType, dotColor, eyeColor, currentStep]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const downloadQRCode = () => {
    if (!qrCodeInstance.current) return;
    qrCodeInstance.current.update({ width: 1000, height: 1000 });
    qrCodeInstance.current.download({ name: "qr-code", extension: "png" });
    // Restore preview size after a short delay
    setTimeout(() => {
      qrCodeInstance.current.update({ width: 300, height: 300 });
    }, 500);
  };

  const copyToClipboard = async () => {
    if (!qrData) return;
    try { await navigator.clipboard.writeText(qrData); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
  };

  const resetForm = () => {
    setUrlInput(''); setTextInput('');
    setContactInfo({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });
    setQrData('');
    setLogo(null);
    setDotType('square');
    setCornerType('square');
    setFrameType('none');
  };

  const tabs = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Text', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: User }
  ];

  const dotPatterns = [
    { id: 'square', label: 'Square' },
    { id: 'rounded', label: 'Rounded' },
    { id: 'dots', label: 'Dots' },
    { id: 'classy', label: 'Classy' },
    { id: 'classy-rounded', label: 'Classy Rounded' },
    { id: 'extra-rounded', label: 'Extra Rounded' }
  ];

  const cornerStyles = [
    { id: 'square', label: 'Square' },
    { id: 'dot', label: 'Dot' },
    { id: 'extra-rounded', label: 'Extra Rounded' }
  ];

  const frameStyles = [
    { id: 'none', label: 'No Frame', icon: X },
    { id: 'banner', label: 'Banner', icon: Frame },
    { id: 'bubble', label: 'Bubble', icon: MessageSquare },
    { id: 'minimal', label: 'Minimal', icon: QrCode }
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #dbeafe 100%)', minHeight: '100vh', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: 20, marginBottom: 16, boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
            <QrCode color="white" size={30} />
          </div>
          <h1 className="header-title" style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 8px' }}>QR Code Generator</h1>
          <p style={{ color: '#6b7280', fontSize: 16, fontWeight: 500, margin: 0 }}>Step {currentStep} of 4: {currentStep === 1 ? 'Select Content' : currentStep === 2 ? 'Customize Style' : currentStep === 3 ? 'Add Logo' : 'Your QR Code'}</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 32, padding: '0 4px' }}>
          {[1, 2, 3, 4].map(step => (
            <div key={step} style={{
              flex: 1, height: 8, borderRadius: 10,
              background: step < currentStep ? '#7c3aed' : step === currentStep ? 'linear-gradient(90deg, #7c3aed, #4f46e5)' : '#ede9fe',
              opacity: step <= currentStep ? 1 : 0.4,
              boxShadow: step === currentStep ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 20px 60px rgba(124,58,237,0.12)', border: '1.5px solid #ede9fe', overflow: 'hidden' }}>

          <div className="card-padding" style={{ padding: '32px 24px' }}>
            <div style={{ maxWidth: currentStep === 4 ? 800 : 500, margin: '0 auto' }}>

              {/* Step 1: Content Section */}
              {currentStep === 1 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  {/* Tabs - Now part of Step 1 choice */}
                  <div className="tabs-container" style={{ display: 'flex', gap: 8, background: '#faf9ff', borderRadius: 20, padding: 6, marginBottom: 28, border: '1.5px solid #ede9fe' }}>
                    {tabs.map(({ id, label, icon: Icon }) => (
                      <button key={id} onClick={() => setActiveTab(id)} className="tab-button" style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '12px 16px', border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                        background: activeTab === id ? 'white' : 'transparent',
                        color: activeTab === id ? '#7c3aed' : '#94a3af',
                        boxShadow: activeTab === id ? '0 4px 12px rgba(124,58,237,0.15)' : 'none',
                      }}>
                        <Icon size={18} />{label}
                      </button>
                    ))}
                  </div>

                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {activeTab === 'url' && <Link size={22} color="#7c3aed" />}
                    {activeTab === 'text' && <MessageSquare size={22} color="#7c3aed" />}
                    {activeTab === 'contact' && <User size={22} color="#7c3aed" />}
                    1. Enter {activeTab === 'url' ? 'URL' : activeTab === 'text' ? 'Text' : 'Contact'} Details
                  </h2>
                  <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, fontWeight: 400 }}>
                    {activeTab === 'url' && 'Link to a website, social profile, or any online resource.'}
                    {activeTab === 'text' && 'Encode a message, plain text, or notes into your QR code.'}
                    {activeTab === 'contact' && "Save your name and phone number directly to a phone's address book."}
                  </p>

                  {activeTab === 'url' && (
                    <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="example.com or https://example.com"
                      style={{ width: '100%', padding: '18px 22px', border: '1.5px solid #e0d9ff', borderRadius: 16, fontSize: 16, color: '#1e1b4b', outline: 'none', boxSizing: 'border-box', background: '#faf9ff', transition: 'all 0.2s' }} />
                  )}
                  {activeTab === 'text' && (
                    <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Enter any text to encode..." rows={5}
                      style={{ width: '100%', padding: '18px 22px', border: '1.5px solid #e0d9ff', borderRadius: 16, fontSize: 16, color: '#1e1b4b', outline: 'none', resize: 'none', boxSizing: 'border-box', background: '#faf9ff', fontFamily: 'inherit', transition: 'all 0.2s' }} />
                  )}
                  {activeTab === 'contact' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="contact-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <input placeholder="First Name" value={contactInfo.firstName} onChange={e => setContactInfo({ ...contactInfo, firstName: e.target.value })} style={{ padding: '16px', border: '1.5px solid #e0d9ff', borderRadius: 16, fontSize: 15, background: '#faf9ff' }} />
                        <input placeholder="Last Name" value={contactInfo.lastName} onChange={e => setContactInfo({ ...contactInfo, lastName: e.target.value })} style={{ padding: '16px', border: '1.5px solid #e0d9ff', borderRadius: 16, fontSize: 15, background: '#faf9ff' }} />
                      </div>
                      <input placeholder="Phone Number" value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} style={{ padding: '16px', border: '1.5px solid #e0d9ff', borderRadius: 16, fontSize: 15, background: '#faf9ff' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Styling Section */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28, animation: 'fadeIn 0.3s ease' }}>
                  <div>
                    <div className="selection-title">
                      <h3><Frame size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 2. QR Frame</h3>
                    </div>
                    <div className="selection-carousel">
                      {frameStyles.map(f => (
                        <div key={f.id} onClick={() => setFrameType(f.id)} className={`selection-item ${frameType === f.id ? 'active' : ''}`}>
                          <f.icon size={24} color={frameType === f.id ? '#7c3aed' : '#1e1b4b'} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="selection-title">
                      <h3><Grid3X3 size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 3. Pattern Type</h3>
                    </div>
                    <div className="selection-carousel">
                      {dotPatterns.map(p => (
                        <div key={p.id} onClick={() => setDotType(p.id)} className={`selection-item ${dotType === p.id ? 'active' : ''}`}>
                          <svg viewBox="0 0 100 100">
                            {p.id === 'square' && <><rect x="20" y="20" width="20" height="20" fill="currentColor" /><rect x="60" y="20" width="20" height="20" fill="currentColor" /><rect x="20" y="60" width="20" height="20" fill="currentColor" /></>}
                            {p.id === 'dots' && <><circle cx="30" cy="30" r="12" fill="currentColor" /><circle cx="70" cy="30" r="12" fill="currentColor" /><circle cx="30" cy="70" r="12" fill="currentColor" /></>}
                            {p.id === 'rounded' && <><rect x="20" y="20" width="20" height="20" rx="6" fill="currentColor" /><rect x="60" y="20" width="20" height="20" rx="6" fill="currentColor" /><rect x="20" y="60" width="20" height="20" rx="6" fill="currentColor" /></>}
                            {p.id.includes('classy') && <><circle cx="30" cy="30" r="10" fill="currentColor" /><rect x="60" y="22" width="16" height="16" rx="4" fill="currentColor" /></>}
                            {p.id === 'extra-rounded' && <rect x="15" y="15" width="25" height="25" rx="12" fill="currentColor" />}
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="selection-title">
                      <h3><QrCode size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 4. Corners Style</h3>
                    </div>
                    <div className="selection-carousel">
                      {cornerStyles.map(s => (
                        <div key={s.id} onClick={() => setCornerType(s.id)} className={`selection-item ${cornerType === s.id ? 'active' : ''}`}>
                          <svg viewBox="0 0 100 100">
                            <rect x="20" y="20" width="60" height="60" rx={s.id === 'square' ? 0 : s.id === 'dot' ? 30 : 20} stroke="currentColor" strokeWidth="12" fill="none" />
                            <rect x="40" y="40" width="20" height="20" rx={s.id === 'square' ? 0 : 10} fill="currentColor" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Logo Section */}
              {currentStep === 3 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImagePlus size={15} color="#7c3aed" /> 5. Add Brand Logo <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
                  </p>
                  {!logo ? (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, border: '2.5px dashed #c4b5fd', borderRadius: 20, cursor: 'pointer', background: '#faf9ff', gap: 8, transition: 'all 0.2s' }}>
                      <ImagePlus size={32} color="#a78bfa" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed' }}>Choose files or drag here</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Supports PNG, JPG, SVG</span>
                      <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                    </label>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: 20, padding: 24, border: '1.5px solid #ddd6fe' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <img src={logo} alt="logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 12, background: 'white', padding: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#4c1d95' }}>Logo added successfully</p>
                          <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Adjust logo size on the QR code</p>
                        </div>
                        <button onClick={() => setLogo(null)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={18} />
                        </button>
                      </div>
                      <div style={{ paddingTop: 8 }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 600, color: '#666' }}>Logo Size Adjustment</p>
                        <input type="range" min="10" max="35" value={logoSize} onChange={e => setLogoSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed', height: 6 }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Final Generation */}
              {currentStep === 4 && (
                <div className="preview-section" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h2 className="preview-heading" style={{ fontSize: 24, marginBottom: 8 }}>Your QR Code is Ready!</h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>Download and share your custom designed QR code</p>
                  </div>

                  <div className="preview-card" style={{ maxWidth: 400, margin: '0 auto 32px' }}>
                    <div className="preview-container" id="canvas-container" style={{
                      borderRadius: frameType === 'none' ? 24 : 20,
                      padding: frameType === 'none' ? 24 : '20px 20px 48px',
                    }}>
                      <div ref={qrContainerRef} />

                      {frameType === 'banner' && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#000000', color: 'white', padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 800, letterSpacing: '1px' }}>
                          SCAN ME!
                        </div>
                      )}

                      {frameType === 'bubble' && (
                        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: '#000000', color: 'white', padding: '6px 16px', borderRadius: 24, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                          SCAN ME!
                        </div>
                      )}

                      {frameType === 'minimal' && (
                        <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#000000', opacity: 0.7 }}>
                          SCAN ME
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <button onClick={downloadQRCode} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '18px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', border: 'none', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>
                      <Download size={20} /> Download PNG (High Quality)
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: 'white', color: copied ? '#16a34a' : '#4b5563', border: '1.5px solid #e0d9ff', borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied' : 'Copy Content'}
                      </button>
                      <button onClick={resetForm} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: 'white', color: '#6b7280', border: '1.5px solid #e0d9ff', borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        <RefreshCw size={16} /> Create New
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Navigation Footer */}
            <div style={{ display: 'flex', gap: 12, marginTop: 40, borderTop: '1.5px solid #f3f0ff', paddingTop: 24 }}>
              {currentStep > 1 && (
                <button onClick={prevStep} style={{ flex: 1, padding: '16px', background: 'white', color: '#6b7280', border: '1.5px solid #e0d9ff', borderRadius: 18, fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Back
                </button>
              )}
              <button
                onClick={currentStep === 4 ? resetForm : nextStep}
                disabled={currentStep === 1 && !qrData}
                style={{
                  flex: 2, padding: '16px', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: currentStep === 1 && !qrData ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  background: currentStep === 1 && !qrData ? '#e0d9ff' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  color: currentStep === 1 && !qrData ? '#94a3af' : 'white',
                  border: 'none',
                  boxShadow: currentStep === 1 && !qrData ? 'none' : '0 10px 20px rgba(124,58,237,0.2)',
                }}
              >
                {currentStep === 3 ? 'Generate QR Code' : currentStep === 4 ? 'Create Another' : 'Continue'}
              </button>
            </div>
          </div>
        </div>

        <footer style={{ marginTop: 64, textAlign: 'center', borderTop: '1.5px solid #ede9fe', paddingTop: 32, paddingBottom: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#7c3aed'} onMouseLeave={e => e.target.style.color = '#6b7280'}>Home</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#7c3aed'} onMouseLeave={e => e.target.style.color = '#6b7280'}>Privacy Policy</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#7c3aed'} onMouseLeave={e => e.target.style.color = '#6b7280'}>Terms of Use</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#7c3aed'} onMouseLeave={e => e.target.style.color = '#6b7280'}>Contact</a>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <a href="https://github.com/SimplyLouie/qr-generator" target="_blank" rel="noopener noreferrer" title="View on Github" style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid #ede9fe', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', textDecoration: 'none' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede9fe'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <Github size={20} color="#4b5563" />
              </a>
            </div>

            <div style={{ color: '#a78bfa', fontSize: 14, fontWeight: 500 }}>
              © {new Date().getFullYear()} QR Code Generator • Premium QR Design
            </div>

            <div style={{ color: '#94a3af', fontSize: 12 }}>
              Built with <span style={{ color: '#ef4444' }}>❤</span> for everyone
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
