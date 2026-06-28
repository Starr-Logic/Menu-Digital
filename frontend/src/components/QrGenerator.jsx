import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Plus, 
  Minus, 
  Download, 
  Printer, 
  QrCode, 
  Info, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw,
  Sparkles,
  Layers,
  LayoutGrid
} from 'lucide-react';

export default function QrGenerator({ onSelectTable, onNavigateToMenu }) {
  const [singleTable, setSingleTable] = useState('');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(10);
  const [qrSize, setQrSize] = useState(200);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [tablesList, setTablesList] = useState([
    { id: 'Table-1', name: 'Table 1' },
    { id: 'Table-2', name: 'Table 2' },
    { id: 'Table-3', name: 'Table 3' },
    { id: 'Table-4', name: 'Table 4' },
    { id: 'Table-5', name: 'Table 5' },
    { id: 'Table-6', name: 'Table 6' },
  ]);
  const [copiedId, setCopiedId] = useState(null);

  // Generate range of tables
  const handleGenerateRange = () => {
    if (rangeStart > rangeEnd) return;
    const newList = [];
    for (let i = rangeStart; i <= rangeEnd; i++) {
      newList.push({
        id: `Table-${i}`,
        name: `Table ${i}`
      });
    }
    setTablesList(newList);
  };

  // Add a single custom table
  const handleAddSingle = () => {
    if (!singleTable.trim()) return;
    const cleanedName = singleTable.trim();
    const id = cleanedName.replace(/\s+/g, '-');
    if (tablesList.some(t => t.id === id || t.name.toLowerCase() === cleanedName.toLowerCase())) {
      alert('Table already exists in the generator deck!');
      return;
    }
    setTablesList(prev => [...prev, { id, name: cleanedName }]);
    setSingleTable('');
  };

  // Remove table from deck
  const handleRemoveTable = (id) => {
    setTablesList(prev => prev.filter(t => t.id !== id));
  };

  // Clear list
  const handleClearAll = () => {
    setTablesList([]);
  };

  // Build the QR target url
  const getTableUrl = (tableName) => {
    // encodeURIComponent is safe and clean
    const origin = window.location.origin;
    return `${origin}/?table=${encodeURIComponent(tableName)}`;
  };

  // Download QR Code image
  const handleDownloadQr = (table) => {
    const canvas = document.getElementById(`qr-canvas-${table.id}`);
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `BiteQR-${table.name.replace(/\s+/g, '_')}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy QR table URL path to clipboard
  const handleCopyUrl = (table) => {
    const url = getTableUrl(table.name);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(table.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Print single QR table flyer card
  const handlePrintQr = (table) => {
    const url = getTableUrl(table.name);
    const canvas = document.getElementById(`qr-canvas-${table.id}`);
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print BiteQR - ${table.name}</title>
          <style>
            body {
              font-family: 'Segoe UI', 'Noto Sans Khmer', 'Khmer OS', 'Arial Unicode MS', system-ui, sans-serif;
              text-align: center;
              margin: 0;
              padding: 40px;
              background: #ffffff;
              color: #0f172a;
            }
            .flyer-card {
              border: 3px solid #0f172a;
              border-radius: 24px;
              padding: 40px;
              max-width: 420px;
              margin: 0 auto;
              box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }
            .header-badge {
              display: inline-block;
              background: #f59e0b;
              color: #000000;
              padding: 6px 16px;
              border-radius: 99px;
              font-weight: 800;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 32px;
              font-weight: 900;
              margin: 0 0 10px 0;
              letter-spacing: -1px;
            }
            .subtitle {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 30px;
            }
            .qr-container {
              display: inline-block;
              padding: 16px;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              margin-bottom: 30px;
            }
            .table-label {
              font-size: 24px;
              font-weight: 900;
              color: #f59e0b;
              margin-bottom: 10px;
            }
            .instructions {
              font-size: 13px;
              color: #475569;
              line-height: 1.5;
            }
            .footer-line {
              margin-top: 30px;
              font-size: 10px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body { padding: 0; }
              .flyer-card { box-shadow: none; border-color: #000000; }
            }
          </style>
        </head>
        <body>
          <div class="flyer-card">
            <div class="header-badge">BiteQR ordering</div>
            <h1>SCAN & ORDER</h1>
            <p class="subtitle">Quick menu. Direct table routing.</p>
            <div class="qr-container">
              <img src="${imgData}" width="220" height="220" alt="QR Code" />
            </div>
            <div class="table-label">${table.name.toUpperCase()}</div>
            <p class="instructions">Open your smartphone camera & scan this code to browse our menu and submit your table order instantly!</p>
            <div class="footer-line">Powered by BiteQR Systems</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Mass Print All Cards together in a single continuous print job
  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let contentHtml = '';
    tablesList.forEach(table => {
      const canvas = document.getElementById(`qr-canvas-${table.id}`);
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      contentHtml += `
        <div class="print-page">
          <div class="flyer-card">
            <div class="header-badge">BiteQR ordering</div>
            <h1>SCAN & ORDER</h1>
            <p class="subtitle">Quick menu. Direct table routing.</p>
            <div class="qr-container">
              <img src="${imgData}" width="220" height="220" alt="QR Code" />
            </div>
            <div class="table-label">${table.name.toUpperCase()}</div>
            <p class="instructions">Open your smartphone camera & scan this code to browse our menu and submit your table order instantly!</p>
            <div class="footer-line">Powered by BiteQR Systems</div>
          </div>
        </div>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print All BiteQR Codes</title>
          <style>
            body {
              font-family: 'Segoe UI', 'Noto Sans Khmer', 'Khmer OS', 'Arial Unicode MS', system-ui, sans-serif;
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #0f172a;
            }
            .print-page {
              padding: 40px;
              page-break-after: always;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
            }
            .flyer-card {
              text-align: center;
              border: 3px solid #0f172a;
              border-radius: 24px;
              padding: 40px;
              width: 100%;
              max-width: 420px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }
            .header-badge {
              display: inline-block;
              background: #f59e0b;
              color: #000000;
              padding: 6px 16px;
              border-radius: 99px;
              font-weight: 800;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 32px;
              font-weight: 900;
              margin: 0 0 10px 0;
              letter-spacing: -1px;
            }
            .subtitle {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 30px;
            }
            .qr-container {
              display: inline-block;
              padding: 16px;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              margin-bottom: 30px;
            }
            .table-label {
              font-size: 24px;
              font-weight: 900;
              color: #f59e0b;
              margin-bottom: 10px;
            }
            .instructions {
              font-size: 13px;
              color: #475569;
              line-height: 1.5;
            }
            .footer-line {
              margin-top: 30px;
              font-size: 10px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              .print-page { padding: 20px; min-height: auto; }
              .flyer-card { box-shadow: none; border-color: #000000; }
            }
          </style>
        </head>
        <body>
          \${contentHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-amber-500/10 to-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <QrCode className="w-4 h-4 text-amber-400" />
              Dynamic Table Setup & QR Hub
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-slate-100">
              Printable QR Code Generator
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-light leading-relaxed">
              Design, customize, and output printable table stickers instantly. Diners scanning these custom QR codes will automatically connect directly to the corresponding table ordering session.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {tablesList.length > 0 && (
              <button
                onClick={handlePrintAll}
                className="flex items-center gap-2 px-4.5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/10 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print All Flyer Cards ({tablesList.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Settings & Generators vs Preview Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Controller Forms */}
        <div className="space-y-6">
          
          {/* Form 1: Generate Multiple Tables */}
          <div className="bg-slate-900/60 rounded-3xl border border-slate-850 p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              Generate Range Loop
            </h3>
            <p className="text-[11px] text-slate-500 font-light leading-relaxed">
              Quickly clear and fill the board with a sequential series of dine-in tables.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase">Start Number</label>
                <input 
                  type="number"
                  min="1"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs px-3 py-2.5 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase">End Number</label>
                <input 
                  type="number"
                  min="1"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs px-3 py-2.5 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateRange}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-200 text-xs font-black rounded-xl transition-all"
            >
              Populate Range Loop (Table {rangeStart} to {rangeEnd})
            </button>
          </div>

          {/* Form 2: Add Single Custom Table */}
          <div className="bg-slate-900/60 rounded-3xl border border-slate-850 p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Custom Table
            </h3>
            <p className="text-[11px] text-slate-500 font-light leading-relaxed">
              Add individual unique table names, VIP rooms, bar stools, or specific sections.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase">Identifier Name</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g., VIP Room 2, Lounge B"
                  value={singleTable}
                  onChange={(e) => setSingleTable(e.target.value)}
                  className="flex-1 text-xs px-3 py-2.5 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder:text-slate-600"
                />
                <button
                  onClick={handleAddSingle}
                  className="px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Design Panel: Colors & Sizing */}
          <div className="bg-slate-900/60 rounded-3xl border border-slate-850 p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              QR Design Aesthetics
            </h3>

            <div className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase font-extrabold text-slate-400">
                  <span>QR Code Stamp Size</span>
                  <span>{qrSize}px</span>
                </div>
                <input 
                  type="range"
                  min="128"
                  max="350"
                  step="10"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase">Fill Color</label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <input 
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer overflow-hidden shrink-0"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{fgColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase">Base Color</label>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <input 
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer overflow-hidden shrink-0"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: QR Live Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 rounded-3xl border border-slate-850 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-500" />
                  Active QR Sticker Board ({tablesList.length})
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Click on table identifiers to preview table ordering menu, download individual assets, or print flyer cards.
                </p>
              </div>

              {tablesList.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-950/40 text-slate-400 hover:text-rose-400 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Board
                </button>
              )}
            </div>

            {tablesList.length === 0 ? (
              <div className="text-center py-24 space-y-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
                <div className="mx-auto w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center text-slate-700 border border-slate-800">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-300 text-sm font-bold">QR Sticker Board is empty</p>
                  <p className="text-xs text-slate-500 max-w-70 mx-auto">Use the range loop generator on the left to quickly populate table QR assets!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {tablesList.map(table => {
                  const url = getTableUrl(table.name);
                  return (
                    <div 
                      key={table.id}
                      className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between space-y-5 hover:border-slate-800 transition-colors shadow-md"
                    >
                      {/* Sticker layout */}
                      <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-amber-400 font-extrabold uppercase tracking-widest text-[10px] rounded-full">
                          {table.name}
                        </span>

                        {/* Hidden dynamic canvas used for downloading/printing */}
                        <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-800">
                          <QRCodeCanvas 
                            id={`qr-canvas-${table.id}`}
                            value={url}
                            size={qrSize}
                            fgColor={fgColor}
                            bgColor={bgColor}
                            level="H"
                            includeMargin={true}
                            style={{ display: 'block' }}
                          />
                        </div>

                        <div className="space-y-1 text-center">
                          <p className="text-[10px] text-slate-400 font-mono break-all leading-normal px-2 bg-slate-900/60 py-1.5 rounded-lg border border-slate-800/40">
                            {url}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                        <button
                          onClick={() => handleDownloadQr(table)}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PNG Asset
                        </button>

                        <button
                          onClick={() => handlePrintQr(table)}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Flyer
                        </button>
                      </div>

                      {/* Extra action bar */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                        <button
                          onClick={() => handleCopyUrl(table)}
                          className="flex items-center gap-1 hover:text-slate-300 transition-colors"
                        >
                          {copiedId === table.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-extrabold">Link copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy menu URL</span>
                            </>
                          )}
                        </button>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              onSelectTable(table.name);
                              onNavigateToMenu();
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors hover:underline"
                          >
                            Simulate order
                          </button>
                          <button
                            onClick={() => handleRemoveTable(table.id)}
                            className="text-slate-600 hover:text-rose-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
