const { getBrowser } = require('./browserClient');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const generateChallanPDF = async (challanData, studentData, browserInstance = null) => {
    let browser = browserInstance;
    let ownBrowser = false;

    try {
        if (!browser) {
            browser = await getBrowser();
            ownBrowser = true;
        }

        const page = await browser.newPage();

        // Load Logo as Base64
        const logoPath = path.join(__dirname, '../../../lms-client/public/Logo2.png');
        let logoBase64 = '';
        if (fs.existsSync(logoPath)) {
            const logoData = fs.readFileSync(logoPath);
            logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
        }
        // ... (rest of template logic stays same, skipping to save bytes in prompt, I will assume it's preserved if I target specific lines or if I replace mainly the wrapper)
        // Wait, replace_file_content replaces the whole block. I need to be careful not to delete the template.
        // I will use specific line replacement for the launch logic.


        // Helper
        const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        const challanTemplate = (title) => `
            <div class="challan-card">
                <div class="header">
                    <div class="logo-area">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo"/>` : '<div class="logo-placeholder">LOGO</div>'}
                    </div>
                    <div class="school-info">
                        <h2>Oxford Grammar & Cambridge EdTech School</h2>
                        <p>123 Education Street, Knowledge City</p>
                        <p>Phone: (123) 456-7890 | Email: info@oxfordgrammar.edu</p>
                    </div>
                </div>

                <div class="divider">
                    <span class="badge">${title} COPY</span>
                </div>

                <div class="grid-info">
                    <div class="info-group">
                        <label>Challan No</label>
                        <div class="value">${challanData.challanNumber}</div>
                    </div>
                    <div class="info-group">
                        <label>Issue Date</label>
                        <div class="value">${formatDate(challanData.issueDate || Date.now())}</div>
                    </div>
                    <div class="info-group">
                        <label>Month</label>
                        <div class="value">${challanData.month}</div>
                    </div>
                    <div class="info-group text-right">
                        <label>Due Date</label>
                        <div class="value overdue">${formatDate(challanData.dueDate)}</div>
                    </div>
                </div>

                <div class="student-section">
                    <div class="row">
                        <span class="label">Registration No:</span>
                        <span class="val">${studentData.registrationNumber}</span>
                    </div>
                    <div class="row">
                        <span class="label">Student Name:</span>
                        <span class="val highlight">${studentData.fullName}</span>
                    </div>
                    <div class="row">
                        <span class="label">Father Name:</span>
                        <span class="val">${studentData.fatherName}</span>
                    </div>
                    <div class="row">
                        <span class="label">Class:</span>
                        <span class="val">${studentData.classId?.name || 'N/A'}</span>
                    </div>
                </div>

                <table class="fee-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="text-right">Amount (PKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${challanData.admissionFee > 0 ? `
                        <tr>
                            <td>Admission Fee</td>
                            <td class="text-right">${challanData.admissionFee.toLocaleString()}</td>
                        </tr>` : ''}
                        <tr>
                            <td>Tuition Fee</td>
                            <td class="text-right">${challanData.tuitionFee.toLocaleString()}</td>
                        </tr>
                        ${challanData.examFee > 0 ? `
                        <tr>
                            <td>Exam Fee</td>
                            <td class="text-right">${challanData.examFee.toLocaleString()}</td>
                        </tr>` : ''}
                         ${challanData.miscCharges > 0 ? `
                        <tr>
                            <td>Misc Charges</td>
                            <td class="text-right">${challanData.miscCharges.toLocaleString()}</td>
                        </tr>` : ''}
                        ${challanData.otherCharges > 0 ? `
                        <tr>
                            <td>Other Charges</td>
                            <td class="text-right">${challanData.otherCharges.toLocaleString()}</td>
                        </tr>` : ''}
                        ${challanData.lateFee > 0 ? `
                        <tr>
                            <td>Late Fee</td>
                            <td class="text-right">${challanData.lateFee.toLocaleString()}</td>
                        </tr>` : ''}
                        ${challanData.discount > 0 ? `
                        <tr class="discount-row">
                            <td>Discount</td>
                            <td class="text-right">-${challanData.discount.toLocaleString()}</td>
                        </tr>` : ''}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Total Payable</td>
                            <td class="text-right">${challanData.totalAmount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="footer">
                    <div class="status-badge ${challanData.status.toLowerCase()}">
                        ${challanData.status}
                    </div>
                    
                    <div class="signatures">
                        <div>
                            <div class="line"></div>
                            <div class="sub">Bank Officer / Accountant</div>
                        </div>
                        <div>
                            <div class="line"></div>
                            <div class="sub">Depositor Signature</div>
                        </div>
                    </div>

                    <p class="note">
                        * This challan is computer generated and does not implement a signature if paid online.<br/>
                        * Please pay before the due date to avoid late payment surcharges.
                    </p>
                </div>
            </div>
        `;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    background: #fdfdfd;
                    margin: 0;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .container {
                    display: flex;
                    gap: 30px;
                    width: 100%;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .challan-card {
                    flex: 1;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    position: relative;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                /* Cut Line */
                .container::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 20px;
                    bottom: 20px;
                    border-left: 2px dashed #cbd5e1;
                    transform: translateX(-50%);
                }

                .header {
                    text-align: center;
                    margin-bottom: 12px;
                }

                .logo {
                    height: 50px;
                    object-fit: contain;
                    margin-bottom: 8px;
                }

                .logo-placeholder {
                    height: 50px;
                    width: 50px;
                    background: #e2e8f0;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                    font-weight: 700;
                    color: #64748b;
                }

                .school-info h2 {
                    margin: 0;
                    font-size: 14px;
                    color: #1e293b;
                    font-weight: 700;
                }

                .school-info p {
                    margin: 2px 0 0;
                    font-size: 8px;
                    color: #64748b;
                }

                .divider {
                    text-align: center;
                    border-bottom: 1px solid #e2e8f0;
                    line-height: 0.1em;
                    margin: 8px 0 16px;
                }

                .badge {
                    background: #f1f5f9;
                    padding: 4px 10px;
                    font-size: 9px;
                    font-weight: 600;
                   color: #475569;
                    border-radius: 12px;
                    letter-spacing: 1px;
                }

                .grid-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    background: #f8fafc;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }

                .info-group label {
                    display: block;
                    font-size: 8px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                }

                .info-group .value {
                    font-size: 10px;
                    font-weight: 600;
                    color: #334155;
                }
                
                .text-right { text-align: right; }
                .overdue { color: #dc2626; }

                .student-section {
                    margin-bottom: 16px;
                    border: 1px solid #f1f5f9;
                    border-radius: 8px;
                    padding: 10px;
                }

                .student-section .row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    font-size: 11px;
                    border-bottom: 1px dashed #f1f5f9;
                    padding-bottom: 4px;
                }
                .student-section .row:last-child {
                    margin-bottom: 0;
                    border-bottom: none;
                }

                .label { color: #64748b; }
                .val { font-weight: 500; color: #1e293b; }
                .val.highlight { font-weight: 700; color: #4f46e5; }

                .fee-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 16px;
                }

                .fee-table th {
                    text-align: left;
                    font-size: 10px;
                    color: #64748b;
                    font-weight: 600;
                    padding: 8px 4px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .fee-table td {
                    padding: 8px 4px;
                    font-size: 11px;
                    color: #334155;
                    border-bottom: 1px solid #f1f5f9;
                }

                .fee-table tfoot td {
                    border-top: 2px solid #e2e8f0;
                    border-bottom: none;
                    font-weight: 700;
                    font-size: 12px;
                    color: #1e293b;
                    padding-top: 12px;
                }

                .discount-row td { color: #16a34a; }

                .footer {
                    text-align: center;
                }

                .status-badge {
                    display: inline-block;
                    padding: 4px 16px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                }

                .status-badge.pending { background: #fee2e2; color: #991b1b; }
                .status-badge.paid { background: #dcfce7; color: #166534; }

                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    padding: 0 10px;
                }

                .signatures > div { width: 40%; }
                
                .line {
                    border-top: 1px solid #cbd5e1;
                    margin-bottom: 4px;
                }
                
                .sub {
                    font-size: 8px;
                    color: #94a3b8;
                    text-transform: uppercase;
                }

                .note {
                    font-size: 8px;
                    color: #cbd5e1;
                    margin: 0;
                    line-height: 1.4;
                }
            </style>
        </head>
        <body>
            <div class="container">
                ${challanTemplate('SCHOOL')}
                ${challanTemplate('STUDENT')}
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent);

        // Generate PDF Buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        if (ownBrowser) {
            await browser.close();
        }

        // Generate PDF Buffer
        // Save locally first to ensure we have a fallback file and stream source
        const fileName = `challan-${challanData.challanNumber}.pdf`;
        const pdfDir = path.join(__dirname, '../../public/challans');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }
        const filePath = path.join(pdfDir, fileName);

        // We already have pdfBuffer from above, let's write it to disk for fallback/stream
        fs.writeFileSync(filePath, pdfBuffer);

        // Attempt Cloudinary Upload (Fallback to Local)
        try {
            return new Promise((resolve) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image', // Treat as image for better PDF delivery support
                        public_id: `challan-${challanData.challanNumber}`, // No extension for image type
                        folder: 'school_challans',
                        format: 'pdf',
                        type: 'upload', // Public type for permanent access without signature expiration
                        overwrite: true
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Failed:', error.message);
                            // Fallback to local
                            resolve({ url: `/challans/${fileName}`, public_id: null });
                        } else {
                            resolve({ url: result.secure_url, public_id: result.public_id, version: result.version });
                        }
                    }
                );
                uploadStream.end(pdfBuffer);
            });
        } catch (err) {
            console.error('Upload Logic Error:', err);
            // Absolute fallback
            return { url: `/challans/${fileName}`, public_id: null };
        }

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};

module.exports = { generateChallanPDF };
