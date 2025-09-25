# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-7.5-PROC-01'
TITLE = 'Procedure for Control of Documented Information'

HTML = '''<section id="documentation-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('documentation-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Control of Documented Information</h2>
                  <p className="text-gray-700 leading-relaxed">Defines the systematic approach for creating, reviewing, approving, distributing, and controlling all documented information within the QSE management system.</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileCheck className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['documentation-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['documentation-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-7.5-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Author:</span> [IT Manager], IT Manager</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>This procedure establishes the definitive requirements for the creation, review, approval, distribution, use, storage, and disposal of all documented information required by the QSE management system of [Company Name]. Its purpose is to ensure that information is accurate, available at the point of use, and adequately controlled throughout its lifecycle.</p>

              <h3 className="mt-8 mb-4">2.0 Scope</h3>
              <p>This procedure applies to all documented information created internally or of external origin that is necessary for the planning and operation of the IMS. This includes policies, procedures, work instructions, forms (records), and external documents such as standards and legislation.</p>

              <h3 className="mt-8 mb-4">3.0 Document Lifecycle Management</h3>
              
              <h4 className="font-bold">3.1 Creation and Identification</h4>
              <ol>
                <li>New documents must be created using the official company templates, which contain fields for a unique document ID, title, revision, and approval information.</li>
                <li>The document author, typically a subject matter expert, is responsible for the accuracy of the content.</li>
                <li>The unique Document ID is assigned by the Document Controller from the Master Document Register.</li>
              </ol>

              <h4 className="font-bold">3.2 Review and Approval</h4>
              <ol>
                <li>The author's Department Manager must review the draft for technical accuracy and operational suitability.</li>
                <li>The QSE Manager must review the draft for conformity with the IMS and ISO standards.</li>
                <li>The final document must be approved by the authority level specified in the Master Document Register (e.g., CEO for policies, Operations Manager for procedures). Approval is formally recorded.</li>
              </ol>

              <h4 className="font-bold">3.3 Digital Distribution and Access Control</h4>
              <ol>
                <li>The primary method for accessing controlled documents is via the QSE Management System's integrated document management module with automatic version control and audit trails.</li>
                <li>Access permissions are role-based and integrated with competency management to ensure personnel can only view information relevant to their function and competency level.</li>
                <li>Document access is automatically logged for compliance tracking, and users receive automatic notifications of document updates relevant to their role.</li>
                <li>Where controlled hard copies are required (e.g., for a remote site office), they must be stamped "CONTROLLED COPY" and tracked through the system's distribution register with automatic expiry alerts.</li>
              </ol>

              <h4 className="font-bold">3.4 Digital Amendment and Revision Workflow</h4>
              <ol>
                <li>Any employee can suggest a change to a document through the system's integrated change request module with automatic routing to the document owner.</li>
                <li>If the change is approved, the digital review and approval workflow (3.2) is automatically initiated with progress tracking and automated reminders.</li>
                <li>The system automatically increments revision numbers and maintains a complete version history with change tracking and comparison tools.</li>
                <li>Document updates are automatically communicated to all relevant personnel based on role-based distribution lists and competency requirements.</li>
                <li>Change impact analysis is facilitated through the system's document relationship mapping and dependency tracking.</li>
              </ol>

              <h4 className="font-bold">3.5 Automated Control of Obsolete Documents</h4>
              <ol>
                <li>When a new revision is issued, the system automatically archives the previous version and updates all active links to point to the current revision.</li>
                <li>All holders of controlled hard copies receive automatic notifications to destroy the superseded version with confirmation tracking.</li>
                <li>Obsolete versions are automatically archived in a secure digital repository for a minimum of 7 years with clear "OBSOLETE - FOR REFERENCE ONLY" watermarks and access controls.</li>
                <li>The system maintains a complete audit trail of document lifecycle events for compliance and legal purposes.</li>
              </ol>

              <h3 className="mt-8 mb-4">4.0 Digital Records Management & System Integration</h3>
              <p>Records are a special type of documented information that provides evidence of conformity. The QSE Management System provides comprehensive digital records management with automatic tracking, retention, and disposal.</p>
              <ul>
                <li><strong>Digital Storage:</strong> Records are stored in the secure digital repository with automatic backup, version control, and integrity verification.</li>
                <li><strong>Automated Retention:</strong> The system automatically tracks retention periods and generates alerts for records approaching disposal dates based on the Master Document & Records Register (QSE-7.5-REG-01).</li>
                <li><strong>Secure Disposal:</strong> Records are automatically flagged for secure disposal after retention periods expire, with audit trails maintained for compliance purposes.</li>
                <li><strong>Integration Tracking:</strong> Records are automatically linked to related processes (projects, training, incidents) for comprehensive traceability and audit support.</li>
                <li><strong>Dashboard Analytics:</strong> Document and records metrics are displayed on the monitoring dashboard (<code>/dashboard</code>) for real-time oversight.</li>
                <li><strong>Continuous Improvement:</strong> Document control issues and improvement opportunities are automatically logged in the Continual Improvement Register (QSE-10.3-REG-01).</li>
              </ul>
            </div>
            )}
          </div>
        </section>
'''
