# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-8.1-PROC-07'
TITLE = 'Procurement & Supplier Management Procedure'

HTML = '''<section id="procurement" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('procurement')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procurement & Supplier Management Procedure</h2>
                  <p className="text-gray-700">Ensuring procured goods and services meet QSE standards through robust supplier selection and management.</p>
                </div>
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['procurement'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['procurement'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-07</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>To establish a systematic process for the procurement of all goods, services, and subcontracts, ensuring they conform to project and QSE requirements. This procedure governs the evaluation, selection, and ongoing management of suppliers and subcontractors to minimise risk and ensure value for money.</p>
              
              <h3 className="mt-8 mb-4">2.0 Supplier & Subcontractor Pre-qualification</h3>
              <ol>
                <li>No supplier or subcontractor shall be engaged without first being pre-qualified and added to the <span style={{backgroundColor: 'yellow'}}>AustBuild Civil</span> Approved Supplier Register.</li>
                <li>The pre-qualification assessment shall be proportionate to the risk and value of the supply, and will as a minimum evaluate the supplier's:
                  <ul>
                    <li>WHS management system, performance history (LTIFR), and certifications (e.g., ISO 45001).</li>
                    <li>Environmental management system, incident history, and certifications (e.g., ISO 14001).</li>
                    <li>Quality management system and certifications (e.g., ISO 9001).</li>
                    <li>Financial capacity and relevant insurances.</li>
                    <li>Technical capability and past performance.</li>
              </ul>
                </li>
                <li>High-risk subcontractors (e.g., demolition, asbestos removal, cranes) are subject to a more intensive assessment.</li>
              </ol>

              <h3 className="mt-8 mb-4">3.0 Tendering & Contract Award</h3>
              <p>The procurement process for major subcontracts will align with the principles of fairness and transparency outlined in Section 12 of the Austroads Guide to Project Delivery.</p>
              <ol>
                <li>Purchase Orders and Subcontracts shall clearly define the scope of work, QSE requirements, specifications, and hold points for inspection.</li>
                <li>Tenders are to be assessed against both price and non-price criteria, with QSE performance being a significant factor.</li>
                <li>The Project Manager is responsible for ensuring contracts are awarded in line with delegations of authority.</li>
              </ol>

              <h3 className="mt-8 mb-4">4.0 Performance Monitoring</h3>
              <p>The performance of key subcontractors and suppliers shall be monitored throughout the project lifecycle.</p>
              <ul>
                <li>Regular performance reviews will be held to discuss progress, QSE compliance, and any issues.</li>
                <li>Site inspections and audits will be conducted to verify compliance with agreed QSE standards.</li>
                <li>A Supplier Performance Report will be completed upon conclusion of the contract, which will inform future tender considerations.</li>
              </ul>

            </div>
            )}
          </div>
        </section>
'''
