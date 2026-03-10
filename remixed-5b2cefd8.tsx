import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check, ImagePlus, X } from 'lucide-react';

export default function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(20);
  const qrContainerRef = useRef(null);
  const logoInputRef = useRef(null);

  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '', lastName: '', phone: '', email: '', organization: '', url: ''
  });

  const loadQRious = () => new Promise((resolve) => {
    if (window.QRious) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });

  const drawLogoOnCanvas = (canvas, logoSrc, sizePct) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      const logoW = canvas.width * (sizePct / 100);
      const logoH = (img.height / img.width) * logoW;
      const x = (canvas.width - logoW) / 2;
      const y = (canvas.height - logoH) / 2;
      const pad = canvas.width * 0.025;
      const r = pad * 1.5;
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(x - pad + r, y - pad);
      ctx.lineTo(x - pad + logoW + pad * 2 - r, y - pad);
      ctx.quadraticCurveTo(x - pad + logoW + pad * 2, y - pad, x - pad + logoW + pad * 2, y - pad + r);
      ctx.lineTo(x - pad + logoW + pad * 2, y - pad + logoH + pad * 2 - r);
      ctx.quadraticCurveTo(x - pad + logoW + pad * 2, y - pad + logoH + pad * 2, x - pad + logoW + pad * 2 - r, y - pad + logoH + pad * 2);
      ctx.lineTo(x - pad + r, y - pad + logoH + pad * 2);
      ctx.quadraticCurveTo(x - pad, y - pad + logoH + pad * 2, x - pad, y - pad + logoH + pad * 2 - r);
      ctx.lineTo(x - pad, y - pad + r);
      ctx.quadraticCurveTo(x - pad, y - pad, x - pad + r, y - pad);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.drawImage(img, x, y, logoW, logoH);
      resolve();
    };
    img.src = logoSrc;
  });

  const generateQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) qrContainerRef.current.innerHTML = '';
      return;
    }
    await loadQRious();
    if (!qrContainerRef.current) return;
    qrContainerRef.current.innerHTML = '';
    const canvas = document.createElement('canvas');
    qrContainerRef.current.appendChild(canvas);
    new window.QRious({ element: canvas, value: text, size: 1024, background: 'white', foreground: '#1e1b4b', level: logo ? 'H' : 'M' });
    canvas.style.cssText = 'width:100%;max-width:280px;height:auto;border-radius:16px;image-rendering:crisp-edges;display:block;margin:0 auto;';
    if (logo) await drawLogoOnCanvas(canvas, logo, logoSize);
  };

  const formatUrl = (url) => {
    if (!url.trim()) return '';
    return (!url.startsWith('http://') && !url.startsWith('https://')) ? 'https://' + url : url;
  };

  const generateVCard = (c) => `BEGIN:VCARD\nVERSION:3.0\nFN:${c.firstName} ${c.lastName}\nN:${c.lastName};${c.firstName};;;\nORG:${c.organization}\nTEL:${c.phone}\nEMAIL:${c.email}\nURL:${c.url}\nEND:VCARD`;

  useEffect(() => {
    let data = '';
    if (activeTab === 'url') data = formatUrl(urlInput);
    else if (activeTab === 'text') data = textInput;
    else if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email)
      data = generateVCard(contactInfo);
    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo, logo, logoSize]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const downloadQRCode = () => {
    const canvas = qrContainerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-code.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = async () => {
    if (!qrData) return;
    try { await navigator.clipboard.writeText(qrData); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const resetForm = () => {
    setUrlInput(''); setTextInput('');
    setContactInfo({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });
    setQrData('');
    setLogo(null);
    if (qrContainerRef.current) qrContainerRef.current.innerHTML = '';
  };

  const tabs = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Text', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: User }
  ];

  const contactFields = [
    { field: 'phone', label: 'Phone Number', type: 'tel', ph: '+1 (555) 123-4567' },
    { field: 'email', label: 'Email Address', type: 'email', ph: 'john@example.com' },
    { field: 'organization', label: 'Organization', type: 'text', ph: 'Company Name' },
    { field: 'url', label: 'Website', type: 'url', ph: 'https://example.com' }
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #dbeafe 100%)', minHeight: '100vh', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: 20, marginBottom: 16, boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
            <QrCode color="white" size={30} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 8px' }}>QR Code Generator</h1>
          <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>Generate HD QR codes with your logo — free & instant</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 20px 60px rgba(124,58,237,0.12)', border: '1.5px solid #ede9fe', overflow: 'hidden' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid #ede9fe', background: '#faf9ff' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
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

          <div style={{ padding: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

              {/* Left */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>
                  {activeTab === 'url' ? 'Enter URL' : activeTab === 'text' ? 'Enter Text' : 'Contact Info'}
                </h2>

                {activeTab === 'url' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>Website URL</label>
                    <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="example.com or https://example.com"
                      style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e0d9ff', borderRadius: 12, fontSize: 14, color: '#1e1b4b', outline: 'none', boxSizing: 'border-box', background: '#faf9ff' }} />
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>https:// will be added automatically if omitted.</p>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>Text Content</label>
                    <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Enter any text to encode..." rows={5}
                      style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e0d9ff', borderRadius: 12, fontSize: 14, color: '#1e1b4b', outline: 'none', resize: 'none', boxSizing: 'border-box', background: '#faf9ff', fontFamily: 'inherit' }} />
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {['firstName','lastName'].map(f => (
                        <div key={f}>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>{f === 'firstName' ? 'First Name' : 'Last Name'}</label>
                          <input value={contactInfo[f]} onChange={e => setContactInfo({...contactInfo, [f]: e.target.value})} placeholder={f === 'firstName' ? 'John' : 'Doe'}
                            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0d9ff', borderRadius: 10, fontSize: 14, color: '#1e1b4b', outline: 'none', boxSizing: 'border-box', background: '#faf9ff' }} />
                        </div>
                      ))}
                    </div>
                    {contactFields.map(({ field, label, type, ph }) => (
                      <div key={field}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>{label}</label>
                        <input type={type} value={contactInfo[field]} onChange={e => setContactInfo({...contactInfo, [field]: e.target.value})} placeholder={ph}
                          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0d9ff', borderRadius: 10, fontSize: 14, color: '#1e1b4b', outline: 'none', boxSizing: 'border-box', background: '#faf9ff' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Logo Upload */}
                <div style={{ borderTop: '1.5px solid #f3f0ff', paddingTop: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImagePlus size={15} color="#7c3aed" /> Logo <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
                  </p>

                  {!logo ? (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 100, border: '2px dashed #c4b5fd', borderRadius: 14, cursor: 'pointer', background: '#faf9ff', transition: 'all .2s', gap: 4 }}>
                      <ImagePlus size={24} color="#a78bfa" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>Upload logo</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>PNG, JPG, SVG — square works best</span>
                      <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                    </label>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: 12, padding: '10px 14px', border: '1.5px solid #ddd6fe' }}>
                        <img src={logo} alt="logo" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, background: 'white', border: '1px solid #e5e7eb', padding: 4 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#4c1d95' }}>Logo uploaded ✓</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#7c3aed' }}>Centered on QR code</p>
                        </div>
                        <button onClick={() => { setLogo(null); if (logoInputRef.current) logoInputRef.current.value = ''; }}
                          style={{ background: 'white', border: '1px solid #ddd6fe', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <X size={14} color="#ef4444" />
                        </button>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>
                          <span>Logo size</span><span style={{ color: '#7c3aed', fontWeight: 700 }}>{logoSize}%</span>
                        </div>
                        <input type="range" min="10" max="35" value={logoSize} onChange={e => setLogoSize(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#7c3aed' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          <span>Small</span><span>Large</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={resetForm} style={{ padding: '12px', background: 'white', border: '1.5px solid #e0d9ff', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>
                  Clear All Fields
                </button>
              </div>

              {/* Right: QR Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Preview</h2>

                <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe, #dbeafe)', borderRadius: 24, padding: 28, width: '100%', boxSizing: 'border-box', border: '1.5px solid #ddd6fe', boxShadow: 'inset 0 2px 8px rgba(124,58,237,0.06)', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {qrData ? (
                    <>
                      <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 8px 32px rgba(124,58,237,0.15)', border: '1.5px solid #ede9fe' }}>
                        <div ref={qrContainerRef} />
                      </div>
                      <p style={{ fontSize: 12, color: '#7c3aed', marginTop: 14, fontWeight: 500 }}>📷 Scan with your device camera</p>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <QrCode size={60} color="#c4b5fd" style={{ marginBottom: 12 }} />
                      <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Fill in the form to generate your QR code</p>
                    </div>
                  )}
                </div>

                {qrData && (
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <button onClick={downloadQRCode} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
                      <Download size={16} /> Download HD
                    </button>
                    <button onClick={copyToClipboard} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: 'white', color: copied ? '#16a34a' : '#6b7280', border: '1.5px solid #e0d9ff', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      {copied ? <><Check size={16} color="#16a34a" /> Copied!</> : <><Copy size={16} /> Copy Data</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#a78bfa', fontSize: 13 }}>Generate QR codes instantly • No data stored • Free to use</p>
      </div>
    </div>
  );
}
