# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-8.1-TEMP-PQP'
TITLE = 'Project Quality Plan (PQP) Template'

HTML = '''<section id="pqp-template" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-purple-100 text-gray-900 p-6 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => toggleDoc('pqp-template')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Quality Plan (PQP) Template</h2>
                  <p className="text-gray-700">A comprehensive template for project-specific quality planning and management, used in AI-driven PMP generation workflow.</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['pqp-template'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['pqp-template'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-TEMP-PQP</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> [Enter Date]</div>
              </div>
              
              <h3 className="mt-8 mb-4">1.0 Project Information</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr><td className="border p-2 font-semibold w-1/4">Project Name:</td><td className="border p-2">[Enter Project Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Client:</td><td className="border p-2">[Enter Client Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">Contract Value:</td><td className="border p-2">[Enter Value]</td></tr>
                    <tr><td className="border p-2 font-semibold">Project Manager:</td><td className="border p-2">[Enter PM Name]</td></tr>
                    <tr><td className="border p-2 font-semibold">QA/QC Manager:</td><td className="border p-2">[Enter QA Manager]</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">2.0 Quality Policy & Objectives</h3>
              <p><strong>Quality Policy Statement:</strong> [Reference corporate QSE Policy QSE-5.2-POL-01]</p>
              <p><strong>Project-Specific Quality Objectives:</strong></p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Quality Objective</th>
                      <th className="border p-2 text-left">Target</th>
                      <th className="border p-2 text-left">Measurement Method</th>
                      <th className="border p-2 text-left">Responsible</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter objective]</td>
                      <td className="border p-2">[Enter target]</td>
                      <td className="border p-2">[Enter measurement]</td>
                      <td className="border p-2">[Enter responsible party]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">3.0 Lot Management</h3>
              <p>This project utilizes the integrated Lot Management System for quality control. Lots are managed within the <code>/projects/[projectId]/lots</code> module with the following structure:</p>
              <ul>
                <li><strong>Lot Register:</strong> All work packages tracked with unique identifiers</li>
                <li><strong>ITP Assignment:</strong> Each lot linked to appropriate Inspection & Test Plans</li>
                <li><strong>Progress Tracking:</strong> Real-time status updates and completion records</li>
                <li><strong>NCR Integration:</strong> Non-conformances linked to specific lots for traceability</li>
              </ul>

              <h3 className="mt-8 mb-4">4.0 Inspection & Test Plans (ITPs)</h3>
              <p>ITPs are generated through the AI-driven ITP Generation Agent and managed within the system:</p>
              <ul>
                <li><strong>ITP Templates:</strong> Based on project specifications and industry standards</li>
                <li><strong>Digital Execution:</strong> ITPs executed using tablets with real-time data entry</li>
                <li><strong>Hold Points:</strong> Automatic notifications to relevant parties for sign-off</li>
                <li><strong>Records Management:</strong> All ITP records stored in <code>/projects/[projectId]/itp-templates</code></li>
              </ul>

              <h3 className="mt-8 mb-4">5.0 Quality Risks & Mitigation</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Quality Risk</th>
                      <th className="border p-2 text-left">Impact</th>
                      <th className="border p-2 text-left">Likelihood</th>
                      <th className="border p-2 text-left">Mitigation Measures</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter risk description]</td>
                      <td className="border p-2">[High/Medium/Low]</td>
                      <td className="border p-2">[High/Medium/Low]</td>
                      <td className="border p-2">[Enter mitigation measures]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">6.0 Handover Records</h3>
              <p>The following records will be compiled for project handover using the system's export functionality:</p>
              <ul>
                <li>Completed ITP Register with all test results and certifications</li>
                <li>As-Built Documentation from Document Register</li>
                <li>NCR Register with closure evidence</li>
                <li>Material Certificates and Compliance Documentation</li>
                <li>Final Quality Audit Report</li>
              </ul>

              <h3 className="mt-8 mb-4">7.0 Quality KPIs</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">KPI</th>
                      <th className="border p-2 text-left">Target</th>
                      <th className="border p-2 text-left">Current Performance</th>
                      <th className="border p-2 text-left">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">ITP First-Pass Rate</td>
                      <td className="border p-2">[Enter target %]</td>
                      <td className="border p-2">[Auto-populated from system]</td>
                      <td className="border p-2">[System trend analysis]</td>
                    </tr>
                    <tr>
                      <td className="border p-2">NCR Closure Rate</td>
                      <td className="border p-2">[Enter target days]</td>
                      <td className="border p-2">[Auto-populated from system]</td>
                      <td className="border p-2">[System trend analysis]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </section>
'''
