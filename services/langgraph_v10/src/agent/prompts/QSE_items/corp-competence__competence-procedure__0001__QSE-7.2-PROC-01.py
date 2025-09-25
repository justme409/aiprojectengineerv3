# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-7.2-PROC-01'
TITLE = 'Procedure for Training, Competence & Awareness'

HTML = '''<section id="competence-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('competence-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Training, Competence & Awareness</h2>
                  <p className="text-gray-700 leading-relaxed">Defines the systematic approach for identifying training needs, ensuring personnel competence, and promoting QSE awareness.</p>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['competence-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['competence-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-7.2-PROC-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Author:</span> [HR Manager], HR Manager</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Purpose</h3>
              <p>This procedure establishes the comprehensive and systematic framework for ensuring [Company Name] provides adequate resources, develops and maintains personnel competence, and promotes full awareness of all Quality, Safety, and Environmental (QSE) policies, procedures, and objectives. The goal is to ensure that all individuals working for or on behalf of the company have the necessary skills, knowledge, and understanding to perform their work safely, efficiently, and in a manner that meets our high QSE standards, thereby ensuring compliance with ISO 9001:2015 (7.1.2, 7.2, 7.3), ISO 14001:2015 (7.1, 7.2, 7.3), and ISO 45001:2018 (7.1, 7.2, 7.3).</p>

              <h3 className="mt-8 mb-4">2.0 Scope</h3>
              <p>This procedure applies to all personnel, including full-time and part-time employees, contractors, and subcontractors, whose work can affect QSE performance. It covers the entire lifecycle of competence management, from recruitment and induction through to ongoing training, assessment, and development.</p>

              <h3 className="mt-8 mb-4">3.0 Responsibilities</h3>
              <ul>
                <li><strong>Top Management (CEO, ELT):</strong> Accountable for allocating the necessary resources (financial, human, technological) to support competence and awareness programs and for fostering a culture that values continuous learning.</li>
                <li><strong>HR Manager:</strong> Responsible for the overall administration of this procedure, maintaining the corporate Training and Competency Matrix, managing the training budget, and ensuring records of training and competence are maintained.</li>
                <li><strong>QSE Manager:</strong> Responsible for identifying QSE-specific training needs (e.g., changes in legislation, incident trends), developing QSE awareness materials, and verifying the effectiveness of QSE training.</li>
                <li><strong>Department and Project Managers:</strong> Responsible for identifying role-specific training needs within their teams, conducting annual competency assessments, approving individual training plans, and verifying the competence of new hires and subcontractors for their assigned roles.</li>
                <li><strong>All Personnel:</strong> Responsible for actively participating in all assigned training, applying learned skills and knowledge to their work, maintaining currency of their licenses and qualifications, and seeking further development opportunities.</li>
              </ul>

              <h3 className="mt-8 mb-4">4.0 Procedure Details</h3>
              
              <h4 className="font-bold">4.1 Determining Competence Requirements</h4>
              <p>Competence requirements for each role are defined in the 'Training and Competency Matrix' (QSE-7.2-REG-01) and are stored within the system's competence management module and are derived from:</p>
              <ul>
                <li>Position descriptions and job task analyses.</li>
                <li>Applicable legal and regulatory requirements (e.g., High-Risk Work Licenses).</li>
                <li>Client-specific contractual requirements.</li>
                <li>Requirements of ISO 9001, 14001, and 45001.</li>
              </ul>

              <h4 className="font-bold">4.2 Training Needs Analysis (TNA)</h4>
              <p>The HR Manager coordinates an annual company-wide TNA. This process involves:</p>
                <ol>
                    <li>Managers assessing their team members against the competency requirements for their roles to identify gaps.</li>
                    <li>Consolidating identified gaps to determine group training needs.</li>
                    <li>Analyzing incident reports, audit findings, and performance reviews for trends that indicate a need for training.</li>
                    <li>The output is a corporate Annual Training Plan, which is approved by the CEO and budgeted for accordingly.</li>
                </ol>

              <h4 className="font-bold">4.3 Training & Development Delivery</h4>
              <p>Training is delivered via a blended approach:</p>
              <ul>
                <li><strong>Induction:</strong> All new personnel undergo a corporate and site-specific induction before commencing work, covering essential QSE policies and procedures as per C-HR-TEMP-001.</li>
                <li><strong>Internal Training:</strong> Delivered by qualified internal staff (e.g., QSE Manager, Supervisors) on company-specific procedures, systems, and lessons learned.</li>
                <li><strong>External Training:</strong> Personnel are enrolled in courses with approved Registered Training Organisations (RTOs) for formal qualifications, licenses, and specialized skills.</li>
                <li><strong>On-the-Job Training (OJT):</strong> Structured OJT, including mentorship and supervision, is used to develop practical skills. Competence is signed off by a qualified supervisor.</li>
              </ul>

              <h4 className="font-bold">4.4 Evaluating Competence & Training Effectiveness</h4>
              <p>The effectiveness of training and the ongoing competence of personnel are evaluated through:</p>
              <ul>
                <li>Post-training assessments (written or practical).</li>
                <li>Verification of tickets, licenses, and qualifications (VOC).</li>
                <li>Workplace observations conducted by supervisors to ensure procedures are being followed correctly.</li>
                <li>Review of individual and team performance against QSE KPIs.</li>
              </ul>

              <h3 className="mt-8 mb-4">5.0 Promoting Awareness</h3>
              <p>Awareness of QSE matters is actively promoted through a continuous communication cycle:</p>
              <ul>
                <li>The QSE Policy is displayed in all offices and sites and is a core part of all inductions.</li>
                <li>Performance against QSE objectives and targets is communicated via notice boards, toolbox talks, and company newsletters.</li>
                <li>Safety Alerts and Lessons Learned from incidents are distributed company-wide to raise awareness of specific risks and control failures.</li>
                <li>Positive contributions to QSE are recognized through employee reward programs.</li>
              </ul>

              <h3 className="mt-8 mb-4">6.0 Digital Records Management & System Integration</h3>
              <p>The following records are maintained within the QSE Management System's competence module with automatic tracking and alerts for expiring qualifications:</p>
              <ul>
                <li>Training and Competency Matrix (QSE-7.2-REG-01) with real-time competency status dashboard</li>
                <li>Individual training records (including certificates, licenses, VOCs) with automated expiry tracking</li>
                <li>Completed induction checklists linked to project assignments</li>
                <li>Records of attendance at internal training sessions and toolbox talks with automatic roster generation</li>
                <li>Annual Training Plans integrated with budget tracking and ROI analysis</li>
                <li>Competency gaps automatically flagged and linked to the Continual Improvement Register (QSE-10.3-REG-01)</li>
                <li>Training effectiveness metrics displayed on the monitoring dashboard (<code>/dashboard</code>)</li>
              </ul>
            </div>
            )}
          </div>
        </section>
'''
