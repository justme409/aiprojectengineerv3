# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-8.1-PROC-01'
TITLE = 'Project Management Procedure'

HTML = '''<section id="proj-mgmt" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('proj-mgmt')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Management Procedure</h2>
                  <p className="text-gray-700">The overarching framework for managing projects from tender to final completion, ensuring consistency with Austroads guidelines.</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['proj-mgmt'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['proj-mgmt'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>This procedure defines the mandatory project delivery framework for all projects undertaken by [Company Name]. It establishes the planning, control, and governance mechanisms required to ensure consistent project delivery that meets client, regulatory, and internal QSE standards, aligning with the principles outlined in the Austroads Guide to Project Delivery.</p>
              
              <h3 className="mt-8 mb-4">2.0 Project Lifecycle Phases</h3>
              <p>All projects shall be managed through four distinct lifecycle phases, each with specific gate reviews and required deliverables.</p>
              
              <h4>2.1 Phase 1: Tender / Initiation</h4>
              <ul>
                <li><strong>Key Activities:</strong> Opportunity assessment, bid/no-bid decision, client requirements analysis, preliminary risk assessment, and development of the tender submission including a preliminary Project Delivery Plan.</li>
                <li><strong>Key Deliverables:</strong> Tender Submission, Preliminary Risk Register, high-level program.</li>
              </ul>

              <h4>2.2 Phase 2: Project Start-up & Planning</h4>
              <ul>
                <li><strong>Key Activities:</strong> Contract award, project team mobilisation, generation and refinement of the Project Management Plan (PMP) using the system's AI assistant followed by formal review and approval, establishment of project controls (cost, schedule, quality), detailed risk and opportunity workshops, procurement planning, and community engagement planning.</li>
                <li><strong>Key Deliverables:</strong> Approved PMP, Detailed Project Schedule (Baseline), Cost Plan, Project Risk & Opportunity Register, Safety in Design Report, Community Engagement Plan.</li>
              </ul>

              <h4>2.3 Phase 3: Project Execution & Monitoring</h4>
              <ul>
                <li><strong>Key Activities:</strong> Implementation of the PMP, management of construction activities, subcontractor management, performance monitoring via the real-time project dashboard tracking progress of Lots, NCRs, and ITPs, ongoing risk management, change control, stakeholder communication, and regular project reporting.</li>
                <li><strong>Key Deliverables:</strong> Monthly Progress Reports, Variation Register, updated Risk Register, NCRs, audit reports.</li>
              </ul>

              <h4>2.4 Phase 4: Project Close-out & Handover</h4>
              <ul>
                <li><strong>Key Activities:</strong> Achieving practical completion, managing the defects liability period, finalising all commercial arrangements, compiling the final handover package by exporting the required records directly from the project's Document, Lot, and ITP registers, conducting a post-project review and lessons learned workshop.</li>
                <li><strong>Key Deliverables:</strong> Handover Report, As-Built Drawings, Quality Records Dossier, Final Financial Report, Lessons Learned Report.</li>
              </ul>

              <div className="mt-8 p-4 border rounded bg-white">
                <h3 className="font-semibold mb-2">Asset-backed Editor (QSE-8.1-PROC-01)</h3>
                <QseDocEditor docId="QSE-8.1-PROC-01" />
              </div>

              <h3 className="mt-8 mb-4">3.0 Key Management Processes</h3>
              
              <h4>3.1 Governance & Reporting</h4>
              <p>A clear governance structure will be established for each project, defining roles, responsibilities, and authorities. Monthly project review meetings will be held to assess performance against KPIs for schedule, cost, safety, quality, and environment. A formal Monthly Project Report shall be submitted to senior management.</p>
              
              <h4>3.2 Risk & Opportunity Management</h4>
              <p>Project risks and opportunities shall be managed in accordance with 'Procedure for Risk & Opportunity Management' (C-QSE-PROC-002). This includes maintaining a live project risk register, conducting regular risk reviews, and implementing mitigation strategies.</p>

              <h4>3.3 Change Control</h4>
              <p>Any deviation from the approved project scope, schedule, or budget must be managed through a formal Change Control process. All variations must be documented, assessed for their impact, and approved by the appropriate authority level before implementation.</p>

              <h4>3.4 Community Engagement</h4>
              <p>Community and stakeholder engagement will be managed proactively in line with the project-specific Community Engagement Plan, ensuring minimal disruption and maintaining the company's social license to operate.</p>

            </div>
            )}
          </div>
        </section>
'''
