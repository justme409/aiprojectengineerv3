# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-7.4-PROC-01'
TITLE = 'Procedure for Internal & External Communication'

HTML = '''<section id="communication-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('communication-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Internal & External Communication</h2>
                  <p className="text-gray-700 leading-relaxed">Defines the processes and protocols for effective communication within the organization and with external stakeholders.</p>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['communication-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['communication-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-7.4-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> C</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Author:</span> [QSE Manager], QSE Manager</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>This procedure establishes the framework and defines the processes for ensuring timely, accurate, and effective internal and external communication regarding the Quality, Safety, and Environmental (QSE) management system at [Company Name]. Its purpose is to ensure that relevant information is conveyed to and received from employees, clients, regulators, and other interested parties in a consistent and controlled manner, thereby meeting the requirements of ISO 9001, ISO 14001, and ISO 45001.</p>

              <h3 className="mt-8 mb-4">2.0 Scope</h3>
              <p>This procedure applies to all planned and unplanned communication activities related to the IMS, including the communication of policies, objectives, performance, risks, incidents, and improvement initiatives. It outlines what will be communicated, when, to whom, and how.</p>

              <h3 className="mt-8 mb-4">3.0 Responsibilities</h3>
              <ul>
                <li><strong>Top Management:</strong> Responsible for ensuring adequate resources are provided for communication and for leading key strategic communications.</li>
                <li><strong>QSE Manager:</strong> Responsible for developing and maintaining this procedure, managing the Communication Matrix, and ensuring the consistency of QSE-related messaging.</li>
                <li><strong>Project Managers:</strong> Responsible for implementing project-specific communication plans, including client and community liaison.</li>
                <li><strong>All Managers/Supervisors:</strong> Responsible for ensuring information is effectively cascaded to their teams and that feedback is relayed back to management.</li>
                <li><strong>All Personnel:</strong> Responsible for being aware of and adhering to communication protocols.</li>
              </ul>

              <h3 className="mt-8 mb-4">4.0 Internal Communication Process</h3>
              <p>Internal communication is designed to ensure all personnel are aware of their roles, responsibilities, and the performance of the IMS. Key channels are defined in the Communication Matrix (QSE-7.4-REG-01) and are integrated with the system's communication module, including automated notifications, real-time dashboard updates, and digital messaging platforms.</p>

              <h3 className="mt-8 mb-4">5.0 External Communication Process</h3>
              <p>All external communication must be professional, accurate, and consistent with company values. Specific protocols apply to different stakeholder groups:</p>
              <ul>
                <li><strong>Clients:</strong> Communication is managed by the Project Manager in accordance with contractual requirements. This includes formal reporting, meeting minutes, and official correspondence.</li>
                <li><strong>Regulators:</strong> All formal communication with regulatory bodies (e.g., SafeWork, EPA) must be coordinated through the QSE Manager to ensure accuracy and consistency.</li>
                <li><strong>Community:</strong> Project-specific community engagement is managed by the Project Manager or a dedicated Community Liaison Officer, following an approved Community Engagement Plan.</li>
                <li><strong>Media:</strong> No employee is authorized to speak to the media. All media inquiries must be directed to the CEO or the designated public relations representative.</li>
              </ul>

              <h3 className="mt-8 mb-4">6.0 Emergency Communication</h3>
              <p>In the event of a crisis or emergency, a structured communication protocol will be initiated:</p>
              <ol>
                <li><strong>Initial Notification:</strong> The senior person on-site is responsible for making initial notifications to emergency services (if required) and to the [Company Name] management chain as per the Emergency Communication section of the Communication Matrix. The system automatically generates emergency notification workflows and tracks response times.</li>
                <li><strong>Crisis Management Team (CMT):</strong> For significant incidents, the CEO will convene the CMT to manage the situation and coordinate all internal and external communication.</li>
                <li><strong>Information Control:</strong> The CMT will control the flow of information to ensure accuracy and prevent speculation. A single point of contact will be established for each key stakeholder group (employees, clients, media).</li>
              </ol>

              <h3 className="mt-8 mb-4">7.0 Digital Communication Platform Integration</h3>
              <p>The QSE Management System provides integrated communication capabilities:</p>
              <ul>
                <li><strong>Automated Notifications:</strong> System generates automatic alerts for critical events, policy changes, and document updates</li>
                <li><strong>Real-Time Dashboard:</strong> Communication status and metrics displayed on monitoring dashboard (<code>/dashboard</code>)</li>
                <li><strong>Digital Messaging:</strong> Integrated messaging platform for secure internal communications</li>
                <li><strong>Document Distribution:</strong> Automatic distribution of updated documents to relevant personnel</li>
                <li><strong>Training Integration:</strong> Communication requirements linked to competency management and training records</li>
                <li><strong>Audit Trail:</strong> Complete communication history maintained for compliance and audit purposes</li>
              </ul>

              <h3 className="mt-8 mb-4">8.0 Evaluating Effectiveness</h3>
              <p>The effectiveness of communication processes is evaluated annually through:</p>
              <ul>
                <li>Review of feedback from employee and client satisfaction surveys.</li>
                <li>Analysis of communication-related issues identified in incident investigations or audits.</li>
                <li>Review of performance against the KPIs set in the Communication Matrix and displayed on the system dashboard.</li>
                <li>Communication effectiveness metrics tracked through the Continual Improvement Register (QSE-10.3-REG-01).</li>
              </ul>
            </div>
            )}
          </div>
        </section>
'''
