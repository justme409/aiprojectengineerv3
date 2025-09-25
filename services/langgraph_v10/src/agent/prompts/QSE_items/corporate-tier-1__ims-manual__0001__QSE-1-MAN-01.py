# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-1-MAN-01'
TITLE = 'Integrated Management System (IMS) Manual'

HTML = '''<section id="ims-manual" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            {/* Document Header */}
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('ims-manual')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="bg-blue-200 text-gray-800 px-3 py-1 text-sm font-semibold">
                      Document 1
                    </span>
                    <span className="bg-blue-200 text-gray-800 px-3 py-1 text-sm font-semibold">
                      Tier 1 - Static
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Integrated Management System (IMS) Manual</h2>
                  <p className="text-gray-700 leading-relaxed">
                    The keystone document defining the scope, context, policies, and process interactions of the integrated Quality, Safety, and Environment (QSE) management system.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {expandedDocs['ims-manual'] ? (
                    <ChevronUp className="h-6 w-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-600" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Document Content */}
            {expandedDocs['ims-manual'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-1-MAN-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> C</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Author:</span> [QSE Manager], QSE Manager</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Introduction and Purpose</h3>
              <p className="mb-4">This Integrated Management System (IMS) Manual is the principal document outlining the framework and core commitments of [Company Name] in relation to Quality, Safety, and Environmental (QSE) management. It serves as a roadmap for our operations, articulating the policies, processes, and procedures that govern our activities in the civil construction sector.</p>
              <p className="mb-4">This manual describes how the company meets QSE requirements through the integrated use of its digital QSE Management System platform.</p>
              <p className="mb-4">The primary purpose of this manual is to:</p>
              <ul>
                <li>Demonstrate top management's unwavering commitment to achieving excellence in QSE performance.</li>
                <li>Define the structure of the IMS and the interaction between its key processes, aligned with the Plan-Do-Check-Act (PDCA) cycle.</li>
                <li>Ensure consistent and controlled operations that meet and exceed the requirements of our clients, as well as all applicable statutory and regulatory obligations.</li>
                <li>Provide a framework for setting QSE objectives and targets, driving continual improvement throughout the organization.</li>
                <li>Serve as a key reference document for employees, clients, auditors, and other interested parties.</li>
              </ul>

              <h3 className="mt-8 mb-4">2.0 Normative References</h3>
              <p>The IMS is established in conformance with the following internationally recognized standards and key Australian legal and other requirements:</p>
              <ul>
                <li><strong>ISO 9001:2015:</strong> Quality management systems — Requirements</li>
                <li><strong>ISO 14001:2015:</strong> Environmental management systems — Requirements with guidance for use</li>
                <li><strong>ISO 45001:2018:</strong> Occupational health and safety management systems — Requirements with guidance for use</li>
                <li><strong>Work Health and Safety Act 2011 (Commonwealth)</strong> and associated State/Territory WHS Acts</li>
                <li><strong>Work Health and Safety Regulations 2011 (Commonwealth)</strong> and associated State/Territory WHS Regulations</li>
                <li><strong>Environmental Protection and Biodiversity Conservation Act 1999 (EPBC Act)</strong></li>
                <li>State and Territory Environmental Protection Acts (e.g., Protection of the Environment Operations Act 1997 (NSW))</li>
                <li><strong>National Construction Code (NCC)</strong> of Australia</li>
                <li><strong>Austroads Guide to Road Design</strong> - Part 2: Design Considerations</li>
                <li><strong>Austroads Guide to Road Construction</strong> - Part 4: Earthworks</li>
                <li><strong>Austroads Guide to Traffic Management</strong> - Part 3: Traffic Control Devices</li>
                <li><strong>Austroads Guide to Pavement Technology</strong> - Part 2: Pavement Structural Design</li>
                <li><strong>AS 1100 Technical Drawing Standards</strong></li>
                <li><strong>AS 2601 The Demolition of Structures</strong></li>
                <li><strong>AS 3798 Guidelines on Earthworks for Commercial and Residential Developments</strong></li>
                <li><strong>AS/NZS 1170 Structural Design Actions</strong></li>
                <li>Relevant Australian Standards (AS/NZS) and Codes of Practice (e.g., AS/NZS 4801, Safe Work Australia Codes of Practice)</li>
              </ul>

              <h3 className="mt-8 mb-4">3.0 Terms and Definitions</h3>
              <p>For the purposes of this document, the terms and definitions given in the referenced ISO standards apply, along with the following critical definitions for our operations:</p>
              <ul>
                <li><strong>IMS:</strong> Integrated Management System. The unified system that manages the Quality, Safety, and Environmental aspects of our operations in a cohesive manner.</li>
                <li><strong>Aspect (Environmental):</strong> An element of our activities, products, or services that can interact with the environment (e.g., fuel consumption, waste generation).</li>
                <li><strong>Hazard (OHS):</strong> A source with a potential to cause injury and ill health (e.g., working at height, operating mobile plant).</li>
                <li><strong>Risk:</strong> The effect of uncertainty. Within the IMS, this is considered for Quality (e.g., project delays), Environment (e.g., pollution event), and Safety (e.g., serious injury).</li>
                <li><strong>Project:</strong> A specific construction undertaking with a defined scope, budget, and timeline, governed by a contract with a client.</li>
                <li><strong>Client:</strong> The entity commissioning the project.</li>
                <li><strong>Competence:</strong> The ability to apply knowledge and skills to achieve intended results.</li>
              </ul>

              <h3 className="mt-8 mb-4">4.0 Context of the Organization</h3>
              <p className="mb-4">[Company Name] has systematically determined the external and internal issues that are relevant to its purpose and strategic direction, and that affect its ability to achieve the intended results of its IMS. This process, which is reviewed at least annually during management review meetings, is detailed in document <a href="/qse/corp-context">QSE-4.1-PROC-01 - Procedure for Determining Context of the Organization</a>. The outputs are maintained in the live registers within the <code>/qse/corp-context</code> module of the QSE system, including a comprehensive Register of Internal & External Issues and a Register of Interested Parties, which form critical inputs into our risk management process, strategic planning, and the overall IMS. The IMS is integrated with the project dashboard (<code>/dashboard</code>) to provide real-time visibility of organizational performance and context-related issues.</p>
              
              <h3 className="mt-8 mb-4">5.0 Leadership and Commitment</h3>
              <p className="mb-4">Top management at [Company Name] demonstrates leadership and commitment by taking full accountability for the effectiveness of the IMS. This is achieved through:</p>
              <ul>
                <li>Establishing, implementing, and maintaining the QSE Policy and Objectives, ensuring they are compatible with the strategic direction of the company.</li>
                <li>Integrating IMS requirements into all business processes.</li>
                <li>Providing necessary resources (human, financial, technological) for the IMS.</li>
                <li>Promoting a culture of risk-based thinking and process-based management.</li>
                <li>Actively participating in and leading management reviews.</li>
                <li>Ensuring that roles, responsibilities, and authorities are clearly defined, communicated, and understood throughout the organization, as detailed in QSE-5.3-REG-01 Roles, Responsibilities & Authorities Matrix.</li>
              </ul>
              <p className="mb-4">The <a href="/qse/corp-policy-roles">QSE Policy (QSE-5.2-POL-01)</a> is our public declaration of these commitments.</p>
              
              <h3 className="mt-8 mb-4">6.0 Planning</h3>
              <p className="mb-4">Planning within our IMS is a proactive process to address risks and opportunities, and to establish objectives for improvement. Our planning process, detailed in <a href="/qse/corp-risk-management">QSE-6.1-PROC-01 - Procedure for Risk & Opportunity Management</a>, ensures that we:</p>
              <ul>
                <li>Identify and assess risks and opportunities related to our context, interested parties, and QSE aspects/hazards.</li>
                <li>Establish measurable QSE objectives at corporate and project levels, which are documented in the <a href="/qse/corp-objectives">Annual QSE Objectives & Targets Plan (QSE-6.2-PLAN-01)</a>.</li>
                <li>Plan actions to achieve these objectives, including defining responsibilities, resources, and timelines.</li>
              </ul>

              <h3 className="mt-8 mb-4">7.0 Support</h3>
              <p className="mb-4">[Company Name] is committed to providing the support necessary for an effective IMS. This includes:</p>
              <ul>
                <li><strong>Resources:</strong> Provision of competent personnel, fit-for-purpose infrastructure, and a work environment conducive to safety and quality.</li>
                <li><strong>Competence:</strong> Ensuring all employees are competent on the basis of appropriate education, training, or experience, as managed through <a href="/qse/corp-competence">Procedure QSE-7.2-PROC-01</a>.</li>
                <li><strong>Awareness:</strong> Making personnel aware of the QSE Policy, their contribution to the IMS, and the implications of not conforming.</li>
                <li><strong>Communication:</strong> Managing internal and external communications as per <a href="/qse/corp-communication">Procedure QSE-7.4-PROC-01</a>.</li>
                <li><strong>Documented Information:</strong> Controlling the creation, update, and retention of all documented information required by the IMS and the ISO standards, in accordance with <a href="/qse/corp-documentation">Procedure QSE-7.5-PROC-01</a>.</li>
              </ul>

              <h3 className="mt-8 mb-4">8.0 Operation</h3>
              <p className="mb-4">All operational activities at [Company Name] are planned and executed under controlled conditions to manage QSE risks and meet client requirements. Operational control is achieved through project-specific workspaces in the application. Our core operational processes include:</p>
              <ul className="mb-4">
                <li>Tendering and Contract Review</li>
                <li>Project Mobilisation and Planning</li>
                <li>Procurement and Subcontractor Management</li>
                <li>Construction Execution (including management of environmental aspects and OHS hazards)</li>
                <li>Inspection, Testing, and Handover</li>
                <li>Control of Nonconforming Outputs</li>
              </ul>
              <p className="mb-4">These processes are governed by a suite of operational procedures and templates, listed in the <a href="/qse/corp-documentation">Master Document Register</a>, which are implemented at the project level through specific Project Management Plans (PMPs) that are generated by the system. Work Breakdown Structures (WBS) are visualized in the <code>/wbs</code> tab, and all records (ITPs, NCRs) are managed within their respective modules.</p>

              <h3 className="mt-8 mb-4">9.0 Performance Evaluation</h3>
              <p className="mb-4">We systematically monitor, measure, analyze, and evaluate our QSE performance to assess the effectiveness of the IMS. Performance metrics and KPIs are tracked on the project dashboard (<code>/projects/[projectId]</code>) and aggregated for management review. Key performance evaluation activities include:</p>
              <ul className="mb-4">
                <li>Monitoring of QSE Objectives and KPIs.</li>
                <li>Client satisfaction surveys and feedback analysis.</li>
                <li>Workplace inspections and environmental monitoring.</li>
                <li>A comprehensive internal audit program, as detailed in <a href="/qse/corp-audit">QSE-9.2-PROC-01 - Internal Audit Procedure</a>.</li>
                <li>Formal Management Reviews to assess overall system performance, detailed in <a href="/qse/corp-review">QSE-9.3-PROC-01 - Management Review Procedure</a>.</li>
              </ul>
              <p className="mb-4">The overall process is defined in <a href="/qse/corp-monitoring">QSE-9.1-PROC-01 - Performance Monitoring and Measurement</a>.</p>

              <h3 className="mt-8 mb-4">10.0 Improvement</h3>
              <p>Continual improvement is an underlying principle of our IMS and organizational culture. We drive improvement through:</p>
              <ul>
                <li>Proactive identification of improvement opportunities from audits, risk assessments, and stakeholder feedback.</li>
                <li>A systematic approach to managing nonconformities and incidents, including thorough root cause analysis and the implementation of effective corrective actions to prevent recurrence.</li>
              </ul>
              <p className="mb-4">These processes are outlined in <a href="/qse/corp-ncr">QSE-10.2-PROC-01 - Procedure for Nonconformity & Corrective Action</a> and <a href="/qse/corp-continual-improvement">QSE-10.3-PROC-01 - Procedure for Continual Improvement</a>.</p>
              
              <h4 className="mt-8 mb-4">Process Interaction Diagram (PDCA Model)</h4>
              <p className="mb-4">The IMS of [Company Name] operates on the Plan-Do-Check-Act (PDCA) cycle, which is a continuous loop of planning, implementing, reviewing, and improving processes and actions. The diagram below illustrates the high-level interaction of our key processes within this framework and their integration with the QSE system modules.</p>
              <div className="my-8 p-6 border-2 border-gray-300 bg-gray-50">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
                    <h5 className="font-bold text-blue-800 mb-2">PLAN (Clauses 4, 5, 6)</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Context Analysis (/qse/corp-context)</li>
                      <li>• Leadership & Policy (/qse/corp-policy-roles)</li>
                      <li>• Risk Management (/qse/corp-risk-management)</li>
                      <li>• Objectives Setting (/qse/corp-objectives)</li>
                    </ul>
                  </div>
                  <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
                    <h5 className="font-bold text-green-800 mb-2">DO (Clauses 7, 8)</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Competence & Training (/qse/corp-competence)</li>
                      <li>• Communication (/qse/corp-communication)</li>
                      <li>• Project Execution (/projects/[projectId])</li>
                      <li>• Operational Procedures (/qse/corp-op-procedures-templates)</li>
                    </ul>
                  </div>
                  <div className="bg-orange-100 p-4 rounded border-l-4 border-orange-500">
                    <h5 className="font-bold text-orange-800 mb-2">CHECK (Clause 9)</h5>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Performance Monitoring (/qse/corp-monitoring)</li>
                      <li>• Internal Audits (/qse/corp-audit)</li>
                      <li>• Management Review (/qse/corp-review)</li>
                      <li>• Dashboard Analytics (/dashboard)</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 p-4 rounded border-l-4 border-purple-500">
                    <h5 className="font-bold text-purple-800 mb-2">ACT (Clause 10)</h5>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• NCR Management (/qse/corp-ncr)</li>
                      <li>• Corrective Actions (/qse/corp-ncr)</li>
                      <li>• Continual Improvement (/qse/corp-continual-improvement)</li>
                      <li>• System Updates & Enhancements</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 italic">This continuous cycle is driven by Customer Requirements and stakeholder needs, aiming for enhanced Customer Satisfaction and organizational excellence.</p>
                </div>
              </div>
            </div>
            )}
          </div>
        </section>
'''
