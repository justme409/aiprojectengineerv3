# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-6.1-PROC-01'
TITLE = 'Procedure for Risk & Opportunity Management'

HTML = '''<section id="risk-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-purple-100 text-gray-900 p-6 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => toggleDoc('risk-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Risk & Opportunity Management</h2>
                  <p className="text-gray-700">The process for managing risks and opportunities related to the IMS.</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['risk-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['risk-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-6.1-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                 <div className="border p-3"><span className="font-semibold">Author:</span> [QSE Manager], QSE Manager</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>This procedure defines the systematic process for identifying, analyzing, evaluating, treating, monitoring, and communicating risks and opportunities relevant to the Integrated Management System (IMS) at [Company Name].</p>

              <h3 className="mt-8 mb-4">2.0 Scope</h3>
              <p>This procedure applies to all strategic and operational risks and opportunities associated with the company's context, interested parties, processes, and QSE objectives.</p>

              <h3 className="mt-8 mb-4">3.0 Risk Management Process</h3>
              <ol>
                <li><strong>Identification:</strong> Risks and opportunities are identified from sources including context analysis, compliance reviews, incident investigations, audits, and stakeholder feedback.</li>
                <li><strong>Analysis & Evaluation:</strong> Each risk is analyzed to determine its likelihood and potential consequences using the corporate risk matrix. The resulting risk level (Extreme, High, Medium, Low) is determined.</li>
                <li><strong>Treatment:</strong> For each unacceptable risk, a treatment plan is developed based on the hierarchy of controls (Elimination, Substitution, Engineering, Administration, PPE). Opportunities are assessed for feasibility and action plans are developed to realize them.</li>
                <li><strong>Documentation:</strong> All identified risks and opportunities are recorded in the Corporate Risk Register (QSE-6.1-REG-01) or Corporate Opportunity Register (QSE-6.1-REG-02). Project-specific risks are managed through the WBS Agent for AI-driven risk assessment and integration with project planning.</li>
                <li><strong>Monitoring & Review:</strong> The effectiveness of treatment plans is monitored, and the registers are reviewed at least quarterly by management.</li>
              </ol>

              <h3 className="mt-8 mb-4">4.0 Risk Matrix</h3>
              <p>A 5x5 Likelihood and Consequence matrix is used to determine risk levels. (A visual representation of the matrix would be included here).</p>

            </div>
            )}
          </div>
        </section>
'''
