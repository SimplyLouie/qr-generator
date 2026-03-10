import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check, ImagePlus, X, ChevronDown, Frame, Grid3X3 } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import './App.css';

export default function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(20);

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
        image: logo,
        dotsOptions: { type: dotType, color: dotColor },
        cornersSquareOptions: { type: cornerType, color: eyeColor },
        cornersDotOptions: { type: cornerType === 'square' ? 'square' : 'dot', color: eyeColor },
        imageOptions: { imageSize: logoSize / 100 }
      });
    }
  }, [activeTab, urlInput, textInput, contactInfo, logo, logoSize, dotType, cornerType, dotColor, eyeColor]);

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
          <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>Create premium, custom-styled QR codes for free</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 20px 60px rgba(124,58,237,0.12)', border: '1.5px solid #ede9fe', overflow: 'hidden' }}>

          {/* Tabs */}
          <div className="tabs-container" style={{ display: 'flex', borderBottom: '1.5px solid #ede9fe', background: '#faf9ff' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className="tab-button" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '16px 12px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all .2s',
                background: activeTab === id ? 'white' : 'transparent',
                color: activeTab === id ? '#7c3aed' : '#9ca3af',
                borderBottom: activeTab === id ? '2.5px solid #7c3aed' : '2.5px solid transparent',
                marginBottom: -1.5
              }}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>

          <div className="card-padding" style={{ padding: 32 }}>
            <div className="grid-container" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>

              {/* Left: Configuration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Content Section */}
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link size={20} color="#7c3aed" /> 1. Enter Content
                  </h2>
                  {activeTab === 'url' && (
                    <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="example.com or https://example.com"
                      style={{ width: '100%', padding: '14px 18px', border: '1.5px solid #e0d9ff', borderRadius: 14, fontSize: 15, color: '#1e1b4b', outline: 'none', boxSizing: 'border-box', background: '#faf9ff' }} />
                  )}
                  {activeTab === 'text' && (
                    <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Enter any text to encode..." rows={4}
                      style={{ width: '100%', padding: '14px 18px', border: '1.5px solid #e0d9ff', borderRadius: 14, fontSize: 15, color: '#1e1b4b', outline: 'none', resize: 'none', boxSizing: 'border-box', background: '#faf9ff', fontFamily: 'inherit' }} />
                  )}
                  {activeTab === 'contact' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input placeholder="First Name" value={contactInfo.firstName} onChange={e => setContactInfo({ ...contactInfo, firstName: e.target.value })} style={{ padding: '12px', border: '1.5px solid #e0d9ff', borderRadius: 12, fontSize: 14, background: '#faf9ff' }} />
                        <input placeholder="Last Name" value={contactInfo.lastName} onChange={e => setContactInfo({ ...contactInfo, lastName: e.target.value })} style={{ padding: '12px', border: '1.5px solid #e0d9ff', borderRadius: 12, fontSize: 14, background: '#faf9ff' }} />
                      </div>
                      <input placeholder="Phone Number" value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} style={{ padding: '12px', border: '1.5px solid #e0d9ff', borderRadius: 12, fontSize: 14, background: '#faf9ff' }} />
                    </div>
                  )}
                </div>

                {/* Frame Style Section */}
                <div>
                  <div className="selection-title">
                    <h3><Frame size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 2. QR Frame</h3>
                    <ChevronDown size={16} color="#9ca3af" />
                  </div>
                  <div className="selection-carousel">
                    {frameStyles.map(f => (
                      <div key={f.id} onClick={() => setFrameType(f.id)} className={`selection-item ${frameType === f.id ? 'active' : ''}`}>
                        <f.icon size={24} color={frameType === f.id ? '#7c3aed' : '#1e1b4b'} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pattern Style Section */}
                <div>
                  <div className="selection-title">
                    <h3><Grid3X3 size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 2. QR Code Pattern</h3>
                    <ChevronDown size={16} color="#9ca3af" />
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

                {/* Eye Style Section */}
                <div>
                  <div className="selection-title">
                    <h3><QrCode size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 3. Corners Style</h3>
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

                {/* Logo Section */}
                <div style={{ borderTop: '1.5px solid #f3f0ff', paddingTop: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImagePlus size={15} color="#7c3aed" /> 4. Add Logo <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
                  </p>
                  {!logo ? (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 80, border: '2px dashed #c4b5fd', borderRadius: 14, cursor: 'pointer', background: '#faf9ff', gap: 4 }}>
                      <ImagePlus size={20} color="#a78bfa" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>Upload logo</span>
                      <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                    </label>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: 12, padding: '10px 14px', border: '1.5px solid #ddd6fe' }}>
                      <img src={logo} alt="logo" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, background: 'white', padding: 4 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>Logo added</p>
                        <input type="range" min="10" max="35" value={logoSize} onChange={e => setLogoSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed', height: 4 }} />
                      </div>
                      <X size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => setLogo(null)} />
                    </div>
                  )}
                </div>

              </div>

              {/* Right: Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingLeft: 20, borderLeft: '1.5px solid #f3f0ff' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Live Preview</h2>

                <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe, #dbeafe)', borderRadius: 24, padding: 32, width: '100%', boxSizing: 'border-box', border: '1.5px solid #ddd6fe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                  <div id="canvas-container" style={{
                    background: 'white',
                    borderRadius: frameType === 'none' ? 20 : 16,
                    padding: frameType === 'none' ? 20 : '16px 16px 40px',
                    boxShadow: '0 12px 40px rgba(124,58,237,0.15)',
                    border: '1.5px solid #ede9fe',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div ref={qrContainerRef} />

                    {frameType === 'banner' && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#000000', color: 'white', padding: '6px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>
                        SCAN ME!
                      </div>
                    )}

                    {frameType === 'bubble' && (
                      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: '#000000', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap' }}>
                        SCAN ME!
                      </div>
                    )}

                    {frameType === 'minimal' && (
                      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#000000', opacity: 0.6 }}>
                        SCAN ME
                      </div>
                    )}
                  </div>
                  {qrData && <p style={{ fontSize: 13, color: '#7c3aed', marginTop: 20, fontWeight: 600 }}>✨ Custom style applied</p>}
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button onClick={downloadQRCode} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                    <Download size={18} /> Download HD Image
                  </button>
                  <button onClick={copyToClipboard} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: 'white', color: copied ? '#16a34a' : '#6b7280', border: '1.5px solid #e0d9ff', borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied to clipboard' : 'Copy Content'}
                  </button>
                  <button onClick={resetForm} style={{ fontSize: 13, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>Reset All Changes</button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, color: '#a78bfa', fontSize: 14, fontWeight: 500 }}>Premium QR Design Engine • No Sign-up Required</p>
      </div>
    </div>
  );
}
