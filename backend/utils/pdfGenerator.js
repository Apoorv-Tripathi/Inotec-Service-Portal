const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generateCertificatePDF(certificate) {
  try {
    const pdfDir = path.join(__dirname, '../pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const fileName = `${certificate.certificateNo.replace(/\//g, '_')}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Generate QR Code
    const qrData = `Inotec-${certificate.certificateNo.replace(/\//g, '-')}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Format dates
    const calDate = new Date(certificate.dateOfCalibration).toLocaleDateString('en-GB');
    const validDate = new Date(certificate.calibrationValidTill).toLocaleDateString('en-GB');

    // Logo paths
    const logoDir = path.join(__dirname, '../logos');
    let inotecLogo = '';
    let isoLogo = '';
    let footerLogos = '';

    try {
      if (fs.existsSync(path.join(logoDir, 'inotec-logo.png'))) {
        const logoBuffer = fs.readFileSync(path.join(logoDir, 'inotec-logo.png'));
        inotecLogo = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
      if (fs.existsSync(path.join(logoDir, 'iso-logo.png'))) {
        const logoBuffer = fs.readFileSync(path.join(logoDir, 'iso-logo.png'));
        isoLogo = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
      if (fs.existsSync(path.join(logoDir, 'footer-logos.png'))) {
        const logoBuffer = fs.readFileSync(path.join(logoDir, 'footer-logos.png'));
        footerLogos = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (err) {
      console.log('Logo files not found, using placeholders');
    }

    // Determine PASS / FAIL styling flag (data-driven, no backend logic changed)
    const resultText = (certificate.calibrationResult || 'Pass').toString();
    const isPass = resultText.trim().toUpperCase() === 'PASS';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>

        /* ==========================================================
           PAGE SETUP
           ========================================================== */
        @page {
          size: A4;
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 210mm;
          height: 297mm;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 9.5pt;
          line-height: 1.35;
          color: #111827;
          background: #FFFFFF;
          -webkit-font-smoothing: antialiased;
        }

        /* ==========================================================
           OUTER / INNER DOUBLE BORDER FRAME
           ========================================================== */
        .cert-frame {
          width: 100%;
          height: 100%;
          padding: 5mm;
        }
        .cert-frame-inner {
          width: 100%;
          height: 100%;
          border: 1.4pt solid #0F3D91;
          padding: 3mm;
        }
        .cert-frame-inner-2 {
          width: 100%;
          height: 100%;
          padding: 9mm 10mm;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* ==========================================================
           WATERMARK
           ========================================================== */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(0deg);
          opacity: 0.11;
          z-index: 0;
          pointer-events: none;
        }
        .watermark img {
          width: 620px;
          height: auto;
        }

        .content-wrapper {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4mm;
        }

        /* ==========================================================
           HEADER
           ========================================================== */
        .header {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          align-items: center;
          gap: 6mm;
          padding-bottom: 3mm;
          border-bottom: 1.4pt solid #0F3D91;
        }
        .header-logo {
          display: flex;
          align-items: center;
        }
        .header-logo img {
          width: 120px;
          height: auto;
        }
        .header-logo .logo-fallback-mark {
          font-size: 16pt;
          font-weight: 700;
          color: #0F3D91;
          letter-spacing: 0.5px;
        }
        .header-logo .logo-fallback-sub {
          font-size: 7pt;
          color: #6B7280;
          letter-spacing: 1.5px;
          margin-top: 1px;
        }
        .header-title {
          text-align: center;
        }
        .header-title .cert-name {
          font-size: 20pt;
          font-weight: 700;
          color: #0F3D91;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }
        .header-title .cert-subtitle {
          margin-top: 2px;
          font-size: 8pt;
          font-weight: 600;
          color: #6B7280;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* Certificate info card, top right */
        .cert-info-card {
          border: 0.8pt solid #CBD5E1;
          border-radius: 3px;
          background: #F8FAFC;
          padding: 4px 8px;
        }
        .cert-info-card .info-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          padding: 2px 0;
          border-bottom: 0.5pt solid #CBD5E1;
          font-size: 7.6pt;
        }
        .cert-info-card .info-row:last-child {
          border-bottom: none;
        }
        .cert-info-card .info-label {
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .cert-info-card .info-value {
          color: #111827;
          font-weight: 700;
          text-align: right;
        }

        /* ==========================================================
           SECTION CARDS (Customer / Machine)
           ========================================================== */
        .card-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5mm;
        }
        .info-card {
          border: 0.8pt solid #CBD5E1;
          border-radius: 4px;
          overflow: hidden;
        }
        .info-card-header {
          background: #0F3D91;
          color: #FFFFFF;
          font-size: 8.5pt;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 4px 10px;
        }
        .info-card-body {
          padding: 6px 10px 7px 10px;
          background: #FFFFFF;
        }
        .kv-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 2.5px 0;
          border-bottom: 0.5pt dashed #CBD5E1;
        }
        .kv-row:last-child {
          border-bottom: none;
        }
        .kv-label {
          font-size: 7.8pt;
          color: #6B7280;
          font-weight: 600;
          white-space: nowrap;
        }
        .kv-value {
          font-size: 8.6pt;
          color: #111827;
          font-weight: 700;
          text-align: right;
        }

        /* ==========================================================
           SECTION HEADING (generic)
           ========================================================== */
        .section-heading {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1mm;
        }
        .section-heading .bar {
          width: 3px;
          height: 11px;
          background: #2563EB;
          border-radius: 2px;
        }
        .section-heading .label {
          font-size: 9.5pt;
          font-weight: 700;
          color: #0F3D91;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        /* ==========================================================
           CONDITION CHECK + QR ROW
           ========================================================== */
        .condition-qr-row {
          display: grid;
          grid-template-columns: 1.55fr 1fr;
          gap: 5mm;
          align-items: stretch;
        }
        .condition-table {
          width: 100%;
          border-collapse: collapse;
          border: 0.8pt solid #CBD5E1;
          border-radius: 4px;
          overflow: hidden;
        }
        .condition-table td {
          padding: 4px 9px;
          font-size: 8.3pt;
          border-bottom: 0.5pt solid #CBD5E1;
        }
        .condition-table tr:last-child td {
          border-bottom: none;
        }
        .condition-table td:first-child {
          color: #374151;
          font-weight: 600;
          width: 62%;
        }
        .condition-table td:last-child {
          text-align: center;
        }
        .status-pill {
          display: inline-block;
          min-width: 58px;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 7.6pt;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          background: #DCFCE7;
          color: #16A34A;
          border: 0.6pt solid #16A34A;
        }

        .qr-card {
          border: 0.8pt solid #CBD5E1;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          text-align: center;
          background: #F8FAFC;
        }
        .qr-card img {
          width: 82px;
          height: 82px;
          padding: 4px;
          background: #FFFFFF;
        }
        .qr-card .qr-caption {
          margin-top: 4px;
          font-size: 7.6pt;
          font-weight: 700;
          color: #0F3D91;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .qr-card .qr-id {
          margin-top: 1px;
          font-size: 7pt;
          color: #6B7280;
        }

        /* ==========================================================
           CALIBRATION DATA TABLE
           ========================================================== */
        .calibration-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 4px;
          overflow: hidden;
        }
        .calibration-table th {
          background: #0F3D91;
          color: #FFFFFF;
          font-size: 8pt;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          padding: 5px 6px;
          border: 0.6pt solid #0F3D91;
        }
        .calibration-table td {
          font-size: 8.4pt;
          text-align: center;
          padding: 4px 6px;
          border: 0.6pt solid #CBD5E1;
          color: #111827;
        }
        .calibration-table tbody tr:nth-child(even) {
          background: #F8FAFC;
        }

        .traceability-note {
          font-size: 7.4pt;
          font-style: italic;
          color: #6B7280;
        }

        /* ==========================================================
           PAYMENT STATUS
           ========================================================== */
        .payment-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .payment-row .payment-label {
          font-size: 7.8pt;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .status-box {
          padding: 3px 14px;
          border-radius: 3px;
          font-size: 8.5pt;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: 1pt solid #CBD5E1;
          color: #9CA3AF;
          background: #F8FAFC;
        }
        .status-box.active {
          border-color: #2563EB;
          color: #2563EB;
          background: #EFF6FF;
        }

        /* ==========================================================
           RESULT SECTION
           ========================================================== */
        .result-section {
          display: grid;
          grid-template-columns: auto 1fr 1fr;
          gap: 8mm;
          align-items: center;
          border-radius: 4px;
          padding: 6px 12px;
          background: #F8FAFC;
        }
        .result-badge {
          padding: 7px 20px;
          border-radius: 4px;
          font-size: 14pt;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-align: center;
          color: #FFFFFF;
          background: #16A34A;
        }
        .result-badge.fail {
          background: #DC2626;
        }
        .result-meta .r-label {
          font-size: 7.6pt;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .result-meta .r-value {
          font-size: 9.5pt;
          font-weight: 700;
          color: #111827;
          margin-top: 1px;
        }
        .signature-block {
          text-align: right;
        }
        .signature-note {
          font-size: 6.8pt;
          font-style: italic;
          color: #9CA3AF;
          line-height: 1.4;
        }

        /* ==========================================================
           FOOTER
           ========================================================== */
        .footer {
          margin-top: auto;
          padding-top: 3mm;
          border-top: 0.8pt solid #CBD5E1;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .footer-company-info {
          font-size: 7.2pt;
          color: #6B7280;
          line-height: 1.5;
        }
        .footer-company-name {
          font-size: 9pt;
          font-weight: 700;
          color: #0F3D91;
          letter-spacing: 0.3px;
          margin-bottom: 1px;
        }
        .footer-company-info strong {
          color: #111827;
        }
        .footer-logos {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .footer-logos img {
          height: 54px;
          width: auto;
        }
        .footer-single-logo {
          height: 54px;
          width: auto;
        }
      </style>
    </head>
    <body>
      <div class="cert-frame">
        <div class="cert-frame-inner">
          <div class="cert-frame-inner-2">

            <!-- Watermark -->
            ${inotecLogo ? `<div class="watermark"><img src="${inotecLogo}" alt="Watermark"></div>` : ''}

            <div class="content-wrapper">

              <!-- ================= HEADER ================= -->
              <div class="header">
                <div class="header-logo">
                  ${inotecLogo
                    ? `<img src="${inotecLogo}" alt="Company Logo">`
                    : `<div><div class="logo-fallback-mark">INOTEC</div><div class="logo-fallback-sub">INNOVATIVE TECHNOLOGIES</div></div>`}
                </div>
                <div class="header-title">
                  <div class="cert-name">Calibration Certificate</div>
                  <div class="cert-subtitle">ISO 9001:2015 Certified Company</div>
                </div>
                <div class="cert-info-card">
                  <div class="info-row">
                    <span class="info-label">Certificate No.</span>
                    <span class="info-value">${certificate.certificateNo}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Calibration Date</span>
                    <span class="info-value">${calDate}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Valid Until</span>
                    <span class="info-value">${validDate}</span>
                  </div>
                </div>
              </div>

              <!-- ================= CUSTOMER + MACHINE DETAILS ================= -->
              <div class="card-row">
                <div class="info-card">
                  <div class="info-card-header">Customer Details</div>
                  <div class="info-card-body">
                    <div class="kv-row">
                      <span class="kv-label">Retail Outlet</span>
                      <span class="kv-value">${certificate.petrolPumpName}</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Address</span>
                      <span class="kv-value">${certificate.petrolPumpAddress}</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Contact Person</span>
                      <span class="kv-value">${certificate.contactPerson}</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Contact No.</span>
                      <span class="kv-value">${certificate.contactNo}</span>
                    </div>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-card-header">Machine Details</div>
                  <div class="info-card-body">
                    <div class="kv-row">
                      <span class="kv-label">Make / Model</span>
                      <span class="kv-value">${certificate.machineDetails.makeModel}</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Serial No.</span>
                      <span class="kv-value">${certificate.machineDetails.serialNo}</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Range</span>
                      <span class="kv-value">${certificate.machineDetails.range} Psi</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Least Count</span>
                      <span class="kv-value">01 Psi</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Temperature</span>
                      <span class="kv-value">${certificate.machineDetails.temperature}&deg;C</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ================= CONDITION CHECK + QR ================= -->
              <div>
                <div class="section-heading">
                  <span class="bar"></span>
                  <span class="label">Condition Check</span>
                </div>
                <div class="condition-qr-row">
                  <table class="condition-table">
                    <tbody>
                      <tr>
                        <td>Inflator Condition</td>
                        <td><span class="status-pill">${certificate.conditionCheck.inflatorCondition}</span></td>
                      </tr>
                      <tr>
                        <td>Air Compressor Condition</td>
                        <td><span class="status-pill">${certificate.conditionCheck.airCompressorCondition}</span></td>
                      </tr>
                      <tr>
                        <td>Moisture Filter Condition</td>
                        <td><span class="status-pill">${certificate.conditionCheck.moistureFilterCondition}</span></td>
                      </tr>
                      <tr>
                        <td>Air Nozzle Condition</td>
                        <td><span class="status-pill">${certificate.conditionCheck.airNozzleCondition}</span></td>
                      </tr>
                      <tr>
                        <td>Air Hose Condition</td>
                        <td><span class="status-pill">${certificate.conditionCheck.airHoseCondition}</span></td>
                      </tr>
                      <tr>
                        <td>Input Power Supply</td>
                        <td><span class="status-pill">${certificate.conditionCheck.inputPowerSupply}</span></td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="qr-card">
                    <img src="${qrCodeDataURL}" alt="QR Code">
                    <div class="qr-caption">Scan to Verify</div>
                    <div class="qr-id">${certificate.certificateNo}</div>
                  </div>
                </div>
              </div>

              <!-- ================= CALIBRATION CHART ================= -->
              <div>
                <div class="section-heading">
                  <span class="bar"></span>
                  <span class="label">Calibration Chart</span>
                </div>
                <table class="calibration-table">
                  <thead>
                    <tr>
                      <th style="width: 15%;">S. No.</th>
                      <th style="width: 35%;">Standard Pressure (PSI)</th>
                      <th style="width: 35%;">Measured Pressure (PSI)</th>
                      <th style="width: 15%;">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${certificate.calibrationData.map((data, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${data.standardPressure.toFixed(1)}</td>
                        <td>${data.measuredPressure.toFixed(1)}</td>
                        <td>${data.error.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div class="traceability-note" style="margin-top: 2mm;">
                  Traceability: No National Standards (the observed readings were found to be within specified accuracy limits)
                </div>
              </div>

              <!-- ================= PAYMENT STATUS ================= -->
              <div class="payment-row">
                <span class="payment-label">Payment Status</span>
                <span class="status-box ${certificate.paymentStatus === 'AMC' ? 'active' : ''}">AMC</span>
                <span class="status-box ${certificate.paymentStatus === 'PAID' ? 'active' : ''}">PAID</span>
              </div>

              <!-- ================= RESULT SECTION ================= -->
              <div class="result-section">
                <div class="result-badge ${isPass ? '' : 'fail'}">${resultText.toUpperCase()}</div>
                <div class="result-meta">
                  <div class="r-label">Calibrated By</div>
                  <div class="r-value">${certificate.calibratedBy}</div>
                </div>
                <div class="signature-block">
                  <div class="signature-note">This is a computer generated certificate<br>and does not require a physical signature.</div>
                </div>
              </div>

              <!-- ================= FOOTER ================= -->
              <div class="footer">
                <div class="footer-content">
                  <div class="footer-company-info">
                    <div class="footer-company-name">Inovative Technologies Int. Private Limited</div>
                    <div><strong>${process.env.COMPANY_ADDRESS}</strong></div>
                    <div>Web: ${process.env.COMPANY_WEBSITE} &nbsp;|&nbsp; Email: ${process.env.COMPANY_EMAIL} &nbsp;|&nbsp; Tel: ${process.env.COMPANY_PHONE}</div>
                  </div>
                  <div class="footer-logos">
                    ${isoLogo ? `<img src="${isoLogo}" alt="ISO">` : ''}
                    ${footerLogos ? `<img src="${footerLogos}" alt="Certifications" class="footer-single-logo">` : ''}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    const browser = await puppeteer.launch({
        executablePath: await chromium.executablePath(),
        args: chromium.args,
        headless: true,
        defaultViewport: chromium.defaultViewport,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 794,
      height: 1123
    });

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: false
    });

    await browser.close();

    return { filePath, fileName, qrData };

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}

module.exports = { generateCertificatePDF };