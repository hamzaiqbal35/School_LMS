// Imports removed
// Imports removed
// Actually useState is unused. useEffect is unused. useSearchParams unused.
// Let's remove them.

export default function ReceiptPage() {
    // params removed as unused
    // in a real app, fetch payment details by ID
    // for now, we'll just show a generic template

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-10 mt-10 shadow-lg print:shadow-none">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold">SCHOOL NAME</h1>
                <p>123 Education Lane, City</p>
                <h2 className="text-xl mt-4 border-b pb-2">FEE RECEIPT</h2>
            </div>

            <div className="flex justify-between mb-4">
                <div>
                    <p><strong>Receipt No:</strong> INV-2024-001</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
                <div>
                    <p><strong>Student:</strong> John Doe</p>
                    <p><strong>Class:</strong> 10-A</p>
                </div>
            </div>

            <table className="w-full mb-6 print:border rounded">
                <thead className="bg-gray-100 print:bg-gray-200">
                    <tr>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-2 border-b">Tuition Fee - Term 1</td>
                        <td className="p-2 border-b text-right">$500.00</td>
                    </tr>
                    <tr>
                        <td className="p-2 font-bold text-right">Total</td>
                        <td className="p-2 font-bold text-right">$500.00</td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-10 pt-4 border-t flex justify-between">
                <div className="text-center">
                    <p className="mb-8">_________________</p>
                    <p>Admin Signature</p>
                </div>
            </div>

            <div className="mt-8 text-center print:hidden">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
                >
                    Print Receipt
                </button>
            </div>
        </div>
    );
}
