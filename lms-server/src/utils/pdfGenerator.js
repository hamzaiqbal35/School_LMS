const { getBrowser } = require('./browserClient');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

const generateChallanPDF = async (challanData, studentData, browserInstance = null) => {
    let browser = browserInstance;
    let ownBrowser = false;

    try {
        if (!browser) {
            browser = await getBrowser();
            ownBrowser = true;
        }

        const page = await browser.newPage();

        // Load Logo as Base64 for embedding
        const logoPath = path.join(__dirname, '../../public/Logo2.png');
        let logoBase64 = '';
        if (fs.existsSync(logoPath)) {
            const logoData = fs.readFileSync(logoPath);
            logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
        }

        // Helper
        const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const challanTemplate = (title, copyColor) => `
            <div class="challan-card">
                <!-- Official Header with Logo -->
                <div class="header">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="School Logo" class="logo"/>` : '<div class="logo-fallback">OGC</div>'}
                    <div class="school-info">
                        <h1>Oxford Grammar & Cambridge EdTech School</h1>
                        <p class="tagline">Excellence in Education</p>
                        <p class="address">Arzanipur, Tehsil chunnian, District Kasur</p>
                        <p class="contact">Tel: 0303 0017905 | Email: oxfordsgrammerschool@gmail.com</p>
                    </div>
                </div>

                <!-- Copy Type Badge -->
                <div class="copy-type-bar" style="background: ${copyColor};">
                    <span>FEE CHALLAN - ${title} COPY</span>
                </div>

                <!-- Two Column Layout -->
                <div class="main-content">
                    <!-- Left: Student & Challan Info -->
                    <div class="left-section">
                        <div class="section-title">STUDENT DETAILS</div>
                        <table class="info-table">
                            <tr>
                                <td class="lbl">Reg. No.</td>
                                <td class="val">${studentData.registrationNumber}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Student Name</td>
                                <td class="val name">${studentData.fullName}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Father's Name</td>
                                <td class="val">${studentData.fatherName}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Class / Section</td>
                                <td class="val">${studentData.classId?.name || 'N/A'}${studentData.sectionId?.name ? ' - ' + studentData.sectionId.name : ''}</td>
                            </tr>
                        </table>

                        <div class="section-title" style="margin-top: 12px;">CHALLAN INFORMATION</div>
                        <table class="info-table">
                            <tr>
                                <td class="lbl">Challan No.</td>
                                <td class="val challan-num">${challanData.challanNumber}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Fee Month</td>
                                <td class="val">${challanData.month}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Issue Date</td>
                                <td class="val">${formatDate(challanData.issueDate || Date.now())}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Due Date</td>
                                <td class="val due">${formatDate(challanData.dueDate)}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Right: Fee Breakdown -->
                    <div class="right-section">
                        <div class="section-title">FEE PARTICULARS</div>
                        <table class="fee-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th class="amt">Amount (PKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${challanData.admissionFee > 0 ? `
                                <tr>
                                    <td>Admission Fee</td>
                                    <td class="amt">${challanData.admissionFee.toLocaleString()}</td>
                                </tr>` : ''}
                                <tr>
                                    <td>Monthly Tuition Fee</td>
                                    <td class="amt">${challanData.tuitionFee.toLocaleString()}</td>
                                </tr>
                                ${challanData.examFee > 0 ? `
                                <tr>
                                    <td>Examination Fee</td>
                                    <td class="amt">${challanData.examFee.toLocaleString()}</td>
                                </tr>` : ''}
                                ${challanData.miscCharges > 0 ? `
                                <tr>
                                    <td>Miscellaneous Charges</td>
                                    <td class="amt">${challanData.miscCharges.toLocaleString()}</td>
                                </tr>` : ''}
                                ${challanData.otherCharges > 0 ? `
                                <tr>
                                    <td>Other Charges</td>
                                    <td class="amt">${challanData.otherCharges.toLocaleString()}</td>
                                </tr>` : ''}
                                ${challanData.lateFee > 0 ? `
                                <tr class="late">
                                    <td>Late Fee Surcharge</td>
                                    <td class="amt">${challanData.lateFee.toLocaleString()}</td>
                                </tr>` : ''}
                                ${challanData.discount > 0 ? `
                                <tr class="discount">
                                    <td>Discount / Scholarship</td>
                                    <td class="amt">-${challanData.discount.toLocaleString()}</td>
                                </tr>` : ''}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td>TOTAL PAYABLE</td>
                                    <td class="amt total">${challanData.totalAmount.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <!-- Amount in Words (for larger amounts) -->
                        <div class="amount-words">
                            <strong>Amount:</strong> PKR ${challanData.totalAmount.toLocaleString()}/-
                        </div>
                    </div>
                </div>

                <!-- Status Badge -->
                <div class="status-row">
                    <div class="status-badge ${challanData.status.toLowerCase()}">
                        ${challanData.status.toUpperCase()}
                    </div>
                </div>

                <!-- Signature Section -->
                <div class="signature-row">
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <span>Cashier / Bank Officer</span>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <span>School Stamp</span>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <span>Parent/Guardian</span>
                    </div>
                </div>

                <!-- Bank Details -->
                <div class="bank-details">
                    <strong>🏦 Bank Details for Fee Payment:</strong>
                    <table class="bank-table">
                        <tr>
                            <td class="lbl">Bank Name</td>
                            <td class="val">Al Baraka Bank (Pakistan) Limited</td>
                        </tr>
                        <tr>
                            <td class="lbl">Branch</td>
                            <td class="val">Arzanipur Branch, Allahabad, Dist Kasur</td>
                        </tr>
                        <tr>
                            <td class="lbl">Account Title</td>
                            <td class="val">Oxford Grammar Academy</td>
                        </tr>
                        <tr>
                            <td class="lbl">Account No. (IBAN)</td>
                            <td class="val acc-num">PK86AIIN0000102636899017</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body {
                    font-family: 'Inter', -apple-system, sans-serif;
                    background: #f0f0f0;
                    padding: 15px;
                    font-size: 10px;
                    color: #1a1a1a;
                }

                .container {
                    display: flex;
                    gap: 20px;
                    max-width: 1100px;
                    margin: 0 auto;
                    position: relative;
                }

                /* Cut line between copies */
                .container::before {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 0;
                    bottom: 0;
                    border-left: 2px dashed #aaa;
                    transform: translateX(-50%);
                }

                .challan-card {
                    flex: 1;
                    background: #fff;
                    border: 2px solid #1e3a5f;
                    padding: 15px;
                }

                /* Header */
                .header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #1e3a5f;
                    margin-bottom: 0;
                }

                .logo {
                    width: 55px;
                    height: 55px;
                    object-fit: contain;
                }

                .logo-fallback {
                    width: 55px;
                    height: 55px;
                    background: #1e3a5f;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                    border-radius: 4px;
                }

                .school-info {
                    flex: 1;
                }

                .school-info h1 {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e3a5f;
                    margin-bottom: 2px;
                }

                .school-info .tagline {
                    font-size: 8px;
                    color: #666;
                    font-style: italic;
                    margin-bottom: 3px;
                }

                .school-info .address,
                .school-info .contact {
                    font-size: 8px;
                    color: #444;
                }

                /* Copy Type Bar */
                .copy-type-bar {
                    text-align: center;
                    padding: 6px;
                    color: white;
                    font-weight: 700;
                    font-size: 10px;
                    letter-spacing: 1.5px;
                    margin-bottom: 12px;
                }

                /* Main Content Grid */
                .main-content {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 10px;
                }

                .left-section {
                    flex: 1;
                }

                .right-section {
                    flex: 1.2;
                }

                /* Section Title */
                .section-title {
                    background: #f5f5f5;
                    padding: 5px 8px;
                    font-size: 9px;
                    font-weight: 700;
                    color: #1e3a5f;
                    border-left: 3px solid #1e3a5f;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Info Table */
                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .info-table td {
                    padding: 5px 0;
                    border-bottom: 1px dotted #ddd;
                    font-size: 9px;
                }

                .info-table .lbl {
                    color: #666;
                    width: 40%;
                }

                .info-table .val {
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .info-table .val.name {
                    color: #1e3a5f;
                    font-size: 10px;
                }

                .info-table .val.challan-num {
                    font-family: 'Courier New', monospace;
                    font-size: 9px;
                    color: #b45309;
                }

                .info-table .val.due {
                    color: #dc2626;
                    font-weight: 700;
                }

                /* Fee Table */
                .fee-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 8px;
                }

                .fee-table th {
                    background: #1e3a5f;
                    color: white;
                    padding: 6px 8px;
                    font-size: 8px;
                    font-weight: 600;
                    text-align: left;
                    text-transform: uppercase;
                }

                .fee-table th.amt {
                    text-align: right;
                }

                .fee-table td {
                    padding: 6px 8px;
                    border-bottom: 1px solid #eee;
                    font-size: 9px;
                }

                .fee-table td.amt {
                    text-align: right;
                    font-weight: 500;
                    font-family: 'Courier New', monospace;
                }

                .fee-table tr.late td {
                    color: #dc2626;
                }

                .fee-table tr.discount td {
                    color: #16a34a;
                }

                .fee-table tfoot td {
                    background: #1e3a5f;
                    color: white;
                    font-weight: 700;
                    font-size: 10px;
                    padding: 8px;
                }

                .fee-table tfoot td.total {
                    font-size: 12px;
                }

                /* Amount in Words */
                .amount-words {
                    background: #fffbeb;
                    border: 1px solid #fbbf24;
                    padding: 6px 10px;
                    font-size: 9px;
                    border-radius: 4px;
                }

                /* Status Badge */
                .status-row {
                    text-align: center;
                    margin: 10px 0;
                }

                .status-badge {
                    display: inline-block;
                    padding: 5px 20px;
                    font-size: 10px;
                    font-weight: 700;
                    border-radius: 3px;
                    letter-spacing: 1px;
                }

                .status-badge.pending {
                    background: #fef3c7;
                    color: #92400e;
                    border: 1px solid #f59e0b;
                }

                .status-badge.paid {
                    background: #d1fae5;
                    color: #065f46;
                    border: 1px solid #10b981;
                }

                .status-badge.overdue {
                    background: #fee2e2;
                    color: #991b1b;
                    border: 1px solid #ef4444;
                }

                /* Signature Section */
                .signature-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 15px 0 10px;
                    padding-top: 10px;
                    border-top: 1px solid #ddd;
                }

                .sig-box {
                    width: 28%;
                    text-align: center;
                }

                .sig-line {
                    border-bottom: 1px solid #333;
                    height: 25px;
                    margin-bottom: 4px;
                }

                .sig-box span {
                    font-size: 7px;
                    color: #666;
                    text-transform: uppercase;
                }

                /* Bank Details */
                .bank-details {
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    padding: 10px;
                    font-size: 8px;
                    border: 1px solid #0ea5e9;
                    border-radius: 4px;
                }

                .bank-details strong {
                    display: block;
                    margin-bottom: 6px;
                    color: #0369a1;
                    font-size: 9px;
                }

                .bank-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .bank-table td {
                    padding: 3px 0;
                    font-size: 8px;
                }

                .bank-table .lbl {
                    color: #666;
                    width: 35%;
                }

                .bank-table .val {
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .bank-table .val.acc-num {
                    font-family: 'Courier New', monospace;
                    color: #0369a1;
                    font-size: 9px;
                    letter-spacing: 0.5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                ${challanTemplate('SCHOOL', '#1e3a5f')}
                ${challanTemplate('STUDENT', '#166534')}
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF Buffer directly in memory
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
        });

        await page.close();

        if (ownBrowser) {
            await browser.close();
        }

        // Upload directly to Cloudinary - NO local filesystem
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    public_id: `challan-${challanData.challanNumber}`,
                    folder: 'school_challans',
                    type: 'upload',
                    overwrite: true,
                    format: 'pdf'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Failed:', error.message);
                        reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    } else {
                        console.log(`[PDF] Uploaded to Cloudinary: ${result.secure_url}`);
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id,
                            version: result.version
                        });
                    }
                }
            );
            uploadStream.end(pdfBuffer);
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};

module.exports = { generateChallanPDF };
