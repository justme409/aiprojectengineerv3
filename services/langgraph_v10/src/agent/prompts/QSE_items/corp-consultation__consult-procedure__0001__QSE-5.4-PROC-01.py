# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-5.4-PROC-01'
TITLE = 'Procedure for Consultation & Participation'

HTML = '''<section id="consult-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-purple-100 text-gray-900 p-6 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => toggleDoc('consult-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Consultation & Participation</h2>
                  <p className="text-gray-700">Defining the mechanisms for effective worker engagement on health, safety, and environmental issues.</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['consult-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['consult-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-5.4-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Author:</span> [Safety Manager], Safety Manager</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>The purpose of this procedure is to establish a systematic, effective, and meaningful framework for the consultation and participation of workers at all levels and functions, including subcontractors, in the development, planning, implementation, performance evaluation, and continual improvement of the Integrated Management System (IMS). This ensures we meet our legal duties and our commitment to a proactive QSE culture.</p>

              <h3 className="mt-8 mb-4">2.0 Scope</h3>
              <p>This procedure applies to all [Company Name] operations, projects, and facilities. It outlines the specific mechanisms for consultation, defines the matters requiring consultation, and clarifies roles and responsibilities to ensure worker participation is integral to our decision-making processes.</p>
              
              <h3 className="mt-8 mb-4">3.0 Responsibilities</h3>
              <ul>
                <li><strong>Management (CEO, Operations Manager):</strong> Accountable for establishing and maintaining consultation arrangements, providing adequate time and resources for participation, ensuring feedback from consultation is genuinely considered in decision-making, and protecting workers from any reprisal for raising QSE concerns.</li>
                <li><strong>Project Managers:</strong> Responsible for implementing project-level consultation arrangements (e.g., weekly meetings, toolbox talks), ensuring HSRs have the resources to perform their functions, and actioning or escalating issues raised on their projects.</li>
                <li><strong>Supervisors/Engineers:</strong> Responsible for facilitating daily consultation forums, ensuring workers understand the hazards and controls for their tasks, and recording and communicating outcomes to project management.</li>
                <li><strong>Health and Safety Representatives (HSRs):</strong> As elected representatives for their work groups, HSRs are responsible for representing worker concerns, escalating unresolved issues through formal channels, participating in inspections and investigations, and actively contributing to Health & Safety Committee meetings.</li>
                <li><strong>All Workers & Subcontractors:</strong> Have a responsibility to actively and constructively participate in consultation, comply with agreed procedures, report hazards and incidents promptly, and contribute to a positive and safe work environment.</li>
              </ul>

              <h3 className="mt-8 mb-4">4.0 Consultation Arrangements</h3>
              <p>[Company Name] utilizes a multi-layered approach to ensure consultation is timely and appropriate to the nature of the issue. The primary mechanisms are detailed below.</p>
              
              <h4 className="font-bold">4.1 Health & Safety Committee (HSC)</h4>
              <p>The HSC is the primary forum for formal consultation on strategic QSE matters.</p>
              <ul>
                  <li><strong>Frequency:</strong> Quarterly.</li>
                  <li><strong>Membership:</strong> Comprises senior management representatives and an equal or greater number of elected HSRs and worker representatives from across the business.</li>
                  <li><strong>Function:</strong> To review company-wide QSE performance, analyze trends, develop and review policies and procedures, and facilitate cooperation between management and workers on QSE matters.</li>
                  <li><strong>Records:</strong> Formal minutes are recorded and distributed to all worksites.</li>
              </ul>

              <h4 className="font-bold">4.2 Project-Level Consultation</h4>
              <ul>
                  <li><strong>Weekly Project Safety Meetings:</strong> Held by the Project Manager with supervisors, HSRs, and subcontractor representatives to review the past week's performance, plan for upcoming high-risk activities, and address any site-wide concerns.</li>
                  <li><strong>Daily Pre-Start / Toolbox Talks:</strong> Facilitated by supervisors for their work crews. These focus on the specific tasks for the day, reviewing relevant SWMS/risk assessments, identifying any changed conditions, and confirming controls are in place. Attendance and topics are recorded.</li>
              </ul>

              <h4 className="font-bold">4.3 Issue-Specific Consultation</h4>
              <ul>
                  <li><strong>Hazard/Incident Reporting:</strong> Workers report hazards and incidents using the system's reporting tools. The reporter is automatically included in the workflow for consultation during the investigation.</li>
                  <li><strong>Risk Assessment Development/Review:</strong> When creating or reviewing a Safe Work Method Statement (SWMS) or other risk assessment, the workers who will be carrying out the task must be consulted to ensure the procedure is practical and effective.</li>
              </ul>
              

              <h3 className="mt-8 mb-4">5.0 Matters Requiring Consultation</h3>
              <p>In accordance with WHS legislation, [Company Name] will consult with its workers on the following matters:</p>
              <ul>
                <li>When identifying hazards and assessing risks arising from the work.</li>
                <li>When making decisions about ways to eliminate or minimize those risks.</li>
                <li>When making decisions about the adequacy of facilities for the welfare of workers.</li>
                <li>When proposing changes that may affect the health or safety of workers (e.g., changes to equipment, procedures, or the work environment).</li>
                <li>When making decisions about procedures for consulting with workers; resolving safety issues; monitoring worker health and workplace conditions; and providing information and training.</li>
                <li>Any other matter prescribed by regulation.</li>
              </ul>

                <h3 className="mt-8 mb-4">6.0 Records</h3>
                <p>The following records shall be maintained as evidence of consultation:</p>
                <ul>
                    <li>Health & Safety Committee Meeting Minutes (stored in the <code>/qse/corp-leadership</code> module).</li>
                    <li>Records of Toolbox Talks (attached to relevant Lots or stored in Project Documents).</li>
                    <li>All Hazard/Incident/NCR reports logged within the system's central registers.</li>
                    <li>Risk assessments and SWMS showing evidence of worker consultation.</li>
                </ul>
            </div>
            )}
          </div>
        </section>
'''
