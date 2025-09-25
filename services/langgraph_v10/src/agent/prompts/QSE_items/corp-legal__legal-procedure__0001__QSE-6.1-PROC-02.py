# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-6.1-PROC-02'
TITLE = 'Procedure for Identifying Compliance Obligations'

HTML = '''<section id="legal-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('legal-procedure')}
        >
          <div className="flex items-center justify-between">
              <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Identifying Compliance Obligations</h2>
                  <p className="text-gray-700">The process for ensuring we are aware of and have access to our legal and other requirements.</p>
              </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['legal-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </div>
              </div>
            </div>
            {expandedDocs['legal-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
                <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-6.1-PROC-02</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                    <div className="border p-3"><span className="font-semibold">Author:</span> [QSE Manager], QSE Manager</div>
                    <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                    <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
            </div>

                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>This procedure defines the systematic process used by [Company Name] to identify, access, evaluate, and maintain the currency of all legal and other compliance obligations applicable to our quality, safety, and environmental aspects and operations.</p>

                <h3 className="mt-8 mb-4">2.0 Scope</h3>
                <p>This procedure applies to all compliance obligations, including:</p>
                <ul>
                    <li>Legislation (Acts and Regulations) at Commonwealth, State, and Local levels.</li>
                    <li>Permits, licenses, and approvals issued by regulatory authorities.</li>
                    <li>Mandatory Australian and International Standards.</li>
                    <li>Industry codes of practice.</li>
                    <li>Contractual requirements from our clients.</li>
                    <li>Voluntary commitments made by the company (e.g., to industry bodies).</li>
            </ul>

                <h3 className="mt-8 mb-4">3.0 Process for Identification and Management</h3>
                <ol>
                    <li><strong>Identification:</strong> The QSE Manager is responsible for identifying obligations. This is achieved through:
                        <ul>
                            <li>Subscription to a legal update service (e.g., [Legal Update Service]).</li>
                            <li>Monitoring of government gazettes and regulatory agency websites.</li>
                            <li>Participation in industry forums (e.g., Civil Contractors Federation).</li>
                            <li>Review of all new project contracts and tender documents.</li>
            </ul>
                    </li>
                    <li><strong>Documentation:</strong> All identified obligations are recorded in the 'Compliance Obligations Register' (QSE-6.1-REG-03). Each entry includes the source, key requirements, and the part of the business it applies to. Project-specific legal requirements are automatically linked to relevant projects within the system.</li>
                    <li><strong>Evaluation of Compliance:</strong> The QSE Manager, in consultation with relevant department heads (e.g., Project Managers, HR), coordinates a quarterly evaluation of our compliance status against each obligation. The results of this evaluation are recorded in the register.</li>
                    <li><strong>Communication & Training:</strong> When a new obligation is identified or an existing one changes, the QSE Manager is responsible for communicating this to all relevant personnel. If the change requires new or modified controls, training will be arranged and delivered.</li>
                    <li><strong>Management Review:</strong> A summary of our compliance status, including any non-compliances and corrective actions, is presented as a mandatory input at every Management Review meeting.</li>
                </ol>

                <h3 className="mt-8 mb-4">4.0 Legal Change Management</h3>
                <p>When legal requirements change, the following process is followed:</p>
                <ol>
                    <li><strong>Impact Assessment:</strong> Determine which business processes, projects, and procedures are affected by the change.</li>
                    <li><strong>Gap Analysis:</strong> Identify any gaps between current practices and new requirements.</li>
                    <li><strong>Implementation Plan:</strong> Develop a plan to address gaps, including timeline, resources, and responsibilities. This plan is tracked through the Continual Improvement Register (QSE-10.3-REG-01).</li>
                    <li><strong>Communication:</strong> Notify all affected personnel through the system's communication module and provide necessary training.</li>
                    <li><strong>Verification:</strong> Conduct follow-up audits to verify implementation effectiveness.</li>
                </ol>
            </div>
            )}
          </div>
      </section>
'''
