# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-4.1-PROC-01'
TITLE = 'Procedure for Determining Context and Interested Parties'

HTML = '''<section id="context-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-purple-100 text-gray-900 p-6 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => toggleDoc('context-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Determining Context and Interested Parties</h2>
                  <p className="text-gray-700">The process framework for identifying, monitoring, and reviewing internal/external issues and stakeholder expectations.</p>
                </div>
                <div className="flex items-center gap-3">
                  {expandedDocs['context-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['context-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-4.1-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Author:</span> [QSE Manager], QSE Manager</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p className="mb-4">This procedure establishes the systematic and ongoing process for identifying, analyzing, monitoring, and reviewing the external and internal issues that constitute the context of [Company Name]. It also defines the method for identifying interested parties and their relevant needs and expectations. This process is fundamental to our strategic planning, risk management, and the overall effectiveness of our Integrated Management System (IMS), ensuring compliance with clauses 4.1 and 4.2 of ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018.</p>

              <h3 className="mt-8 mb-4">2.0 Scope</h3>
              <p className="mb-4">This procedure applies to all corporate, functional, and project levels of [Company Name]. The outputs of this procedure are mandatory inputs for the management review process, the setting of QSE objectives, and the risk and opportunity management process.</p>

              <h3 className="mt-8 mb-4">3.0 Responsibilities</h3>
              <ul>
                <li><strong>Chief Executive Officer (CEO):</strong> Holds ultimate responsibility for understanding and approving the organization's context and ensuring it aligns with the strategic direction. The CEO ratifies the key issues identified.</li>
                <li><strong>Executive Leadership Team (ELT):</strong> Actively participates in the context analysis, identifies strategic-level issues, and allocates resources to manage associated risks and opportunities.</li>
                <li><strong>QSE Manager:</strong> Is the custodian of this procedure, responsible for facilitating the context analysis process, maintaining the associated registers, and ensuring the outputs are communicated and integrated into the IMS.</li>
                <li><strong>Department and Project Managers:</strong> Are responsible for identifying project-specific issues and interested parties during the project start-up phase. These are to be recorded in the project's workspace and escalated to the QSE Manager if they have corporate-level significance.</li>
              </ul>

              <h3 className="mt-8 mb-4">4.0 Procedure</h3>
              
              <h4 className="mt-8 mb-4">Context Analysis Flowchart</h4>
              <div className="my-8 p-6 border-2 border-gray-300 bg-gray-50">
                <div className="text-center">
                  <p className="font-bold text-gray-800 mb-4">Context Analysis Process Flow</p>
                  <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                    <div className="bg-blue-100 p-3 rounded border border-blue-300">
                      <p className="font-semibold">1. Data Gathering</p>
                      <p className="text-sm">PESTLE, SWOT, Performance Data</p>
                    </div>
                    <div className="text-center text-2xl">↓</div>
                    <div className="bg-green-100 p-3 rounded border border-green-300">
                      <p className="font-semibold">2. Analysis Workshop</p>
                      <p className="text-sm">ELT Review & Issue Identification</p>
                    </div>
                    <div className="text-center text-2xl">↓</div>
                    <div className="bg-orange-100 p-3 rounded border border-orange-300">
                      <p className="font-semibold">3. Documentation</p>
                      <p className="text-sm">Register Updates & Owner Assignment</p>
                    </div>
                    <div className="text-center text-2xl">↓</div>
                    <div className="bg-purple-100 p-3 rounded border border-purple-300">
                      <p className="font-semibold">4. Integration</p>
                      <p className="text-sm">Risk Management & WBS Agent</p>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="mt-8 mb-4">4.1 Determining Organizational Context</h4>
              <p>The context of the organization is formally determined through a structured workshop held annually as part of the strategic planning cycle, led by the CEO and facilitated by the QSE Manager. The context is also reviewed during quarterly management review meetings.</p>
              
              <ol>
                <li><strong>Step 1: Data Gathering.</strong> The QSE Manager collates data from various sources, including PESTLE (Political, Economic, Social, Technological, Legal, Environmental) analysis, SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis, market reports, client feedback, audit results, and performance data.</li>
                <li><strong>Step 2: Analysis Workshop.</strong> The ELT analyzes the collated data to identify significant internal and external issues that could positively or negatively impact the IMS and business objectives.</li>
                <li><strong>Step 3: Issue Documentation.</strong> Each identified issue is documented in the 'Register of Internal & External Issues' (QSE-4.1-REG-01), detailing its description, potential impact, and assigning an owner.</li>
                <li><strong>Step 4: Integration with Risk Management.</strong> The identified issues are used as a primary input into the corporate risk and opportunity assessment process (ref: QSE-6.1-PROC-01). Issues also feed into the AI risk assessment in the WBS Agent for automated risk identification during project planning.</li>
              </ol>

              <h4 className="mb-4">4.2 Identifying Interested Parties</h4>
              <p>The identification of interested parties and their requirements is conducted in parallel with the context analysis.</p>
              <ol>
                <li><strong>Step 1: Stakeholder Mapping.</strong> During the annual workshop, the ELT conducts a stakeholder mapping exercise, identifying all relevant parties in predefined categories (e.g., Customers, Employees, Regulators, Suppliers, Community).</li>
                <li><strong>Step 2: Determining Needs and Expectations.</strong> For each identified party, their relevant needs, expectations, and legal or other requirements are determined. This is gathered through formal (e.g., contracts, legislation) and informal (e.g., meetings, surveys) channels.</li>
                <li><strong>Step 3: Requirement Documentation.</strong> All interested parties and their associated requirements are documented in the 'Register of Interested Parties & Their Requirements' (QSE-4.2-REG-01). The register includes the method and frequency of engagement for each party.</li>
                <li><strong>Step 4: Compliance Obligation Link.</strong> Requirements that constitute a legal or compliance obligation are transferred to the 'Compliance Obligations Register' (ref: QSE-6.1-REG-01).</li>
              </ol>

              <h3 className="mt-8 mb-4">5.0 Monitoring, Review, and Update</h3>
              <p>The context of the organization is dynamic and requires continuous monitoring. The registers associated with this procedure are considered live documents.</p>
              <ul>
                <li><strong>Formal Review:</strong> The CEO and ELT formally review the complete context analysis and associated registers during the annual strategic planning meeting and quarterly management reviews.</li>
                <li><strong>Ongoing Monitoring:</strong> Department and Project Managers are responsible for monitoring their areas for any changes that could affect the context (e.g., new legislation, new client, major incident) and immediately reporting them to the QSE Manager.</li>
                <li><strong>Triggered Updates:</strong> The registers must be updated immediately upon the identification of a new significant issue or interested party.</li>
              </ul>

              <h3 className="mt-8 mb-4">5.1 Monitoring Triggers</h3>
              <p className="mb-4">The following events and indicators trigger immediate review and potential update of the organizational context:</p>
              <ul className="mb-4">
                <li>[Enter trigger criteria]</li>
                <li>[Enter monitoring indicators]</li>
                <li>[Enter escalation thresholds]</li>
                <li>[Enter review frequencies]</li>
                <li>[Enter notification requirements]</li>
              </ul>

              <h3 className="mt-8 mb-4">6.0 Records</h3>
              <p className="mb-4">The following live records are maintained within the <code>/qse/corp-context</code> module:</p>
              <ul className="mb-4">
                <li><strong>QSE-4.1-REG-01:</strong> Register of Internal and External Issues</li>
                <li><strong>QSE-4.2-REG-01:</strong> Register of Interested Parties and Their Requirements</li>
                <li>Minutes of Management Meetings where context and interested parties are discussed.</li>
                <li>Records from SWOT/PESTLE analysis workshops.</li>
              </ul>
            </div>
            )}
          </div>
        </section>
'''
