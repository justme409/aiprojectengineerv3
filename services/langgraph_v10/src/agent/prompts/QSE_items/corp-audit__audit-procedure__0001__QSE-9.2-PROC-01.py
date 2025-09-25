# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-9.2-PROC-01'
TITLE = 'Internal Audit Procedure'

HTML = '''<section id="audit-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('audit-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Internal Audit Procedure</h2>
                  <p className="text-gray-700 leading-relaxed">Defines the methodology for planning, conducting, and reporting on internal audits to ensure management system effectiveness and continuous improvement.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Search className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['audit-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['audit-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-9.2-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>To define the process for planning, conducting, reporting, and following up on internal audits of the QSE Integrated Management System (IMS). This ensures the system's ongoing conformity to ISO 9001, ISO 14001, and ISO 45001 standards, and its effectiveness in achieving organisational objectives.</p>

              <h3 className="mt-8 mb-4">2.0 Digital Audit Programme & System Integration</h3>
              <p>An annual internal audit programme is developed by the QSE Manager using the system's integrated audit management module, based on the status and importance of the processes to be audited and the results of previous audits. High-risk areas and processes with poor performance indicators (automatically identified through dashboard analytics) are prioritised for more frequent audits. Audit scheduling and tracking are integrated with the monitoring dashboard (<code>/dashboard</code>) for real-time visibility.</p>
              
              <h3 className="mt-8 mb-4">3.0 Audit Process</h3>

              <h4>3.1 Digital Audit Planning</h4>
              <p>For each audit, a Lead Auditor will be assigned through the system's auditor competency management module and will be responsible for preparing a detailed Digital Audit Plan. The plan will specify the audit scope, objectives, criteria, and schedule, and is automatically distributed to all relevant stakeholders with notification tracking.</p>

              <h4>3.2 Digital Audit Execution</h4>
              <p>Audits will commence with a digital opening meeting to confirm the plan. The audit team will then gather objective evidence through interviews, observation of activities, and digital review of documents and records accessed through the document management system. All audit evidence is captured digitally with timestamps and audit trails. All auditors must remain impartial and objective.</p>

              <h4>3.3 Digital Reporting & Analytics</h4>
              <p>Audit findings will be classified as either a Non-conformance (Major/Minor) or an Opportunity for Improvement (OFI) through the integrated audit reporting module. A formal Digital Audit Report will be automatically generated and issued to the relevant managers with dashboard notifications. The report will summarise the findings and conclusions of the audit with trend analysis and performance metrics.</p>

              <h4>3.4 Automated Follow-up & Tracking</h4>
              <p>The manager responsible for the audited area must propose corrective actions for all non-conformances through the system's corrective action module. The effectiveness of these actions will be verified by the Lead Auditor through digital evidence collection before the finding can be automatically closed out. All corrective actions are tracked through the Continual Improvement Register (QSE-10.3-REG-01) with automated reminders and progress monitoring.</p>

              <h3 className="mt-8 mb-4">4.0 Digital Auditor Competency Management</h3>
              <p>All internal auditors must have completed a recognised internal auditor training course, with competency records maintained in the system's training management module (QSE-7.2-REG-01). Lead Auditors will have additional qualifications and experience in lead auditing techniques. Auditor qualifications and competency status are tracked through automatic alerts for renewal requirements and linked to the competency dashboard.</p>
            </div>
            )}
          </div>
        </section>
'''
