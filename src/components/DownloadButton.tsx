'use client';

import * as html2pdf from 'html2pdf.js';

export default function DownloadButton({
  elementId,
  filename,
}: {
  elementId: string;
  filename: string;
}) {
  const handleDownload = () => {
    const el = document.getElementById(elementId);
    if (!el) {
      alert('Printable area not found');
      return;
    }

    html2pdf()
      .from(el)
      .set({
        margin: 0.5,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      })
      .save()
      .catch((err) => {
        console.error('PDF generation failed', err);
        alert('Failed to download ticket.');
      });
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        padding: '8px 16px',
        backgroundColor: '#7f1dff',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Download Ticket (PDF)
    </button>
  );
}