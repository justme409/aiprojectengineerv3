# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-6.2-PROC-01'
TITLE = 'Procedure for Setting QSE Objectives'

HTML = '''<section id="objectives-procedure" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('objectives-procedure')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Procedure for Setting QSE Objectives</h2>
                  <p className="text-gray-700">The process for establishing, communicating, and monitoring our QSE objectives and targets.</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['objectives-procedure'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['objectives-procedure'] && (
            <div className="p-8 prose prose-slate max-w-none">
                <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-6.2-PROC-01</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                    <div className="border p-3"><span className="font-semibold">Author:</span> [QSE Manager], QSE Manager</div>
                    <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                    <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
                </div>

                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>This procedure outlines the process for establishing, planning, and reviewing Quality, Safety, and Environmental (QSE) objectives at corporate and project levels to drive continual improvement.</p>

                <h3 className="mt-8 mb-4">2.0 Process</h3>
                <ol>
                    <li><strong>Establishment:</strong> During the annual management review, top management establishes corporate QSE objectives for the coming year. These are based on the QSE Policy, risk and opportunity analysis, and performance reviews.</li>
                    <li><strong>Cascading:</strong> Corporate objectives are cascaded down to functional departments and projects, which may establish their own supporting objectives and targets.</li>
                    <li><strong>Planning:</strong> For each objective, a plan is developed detailing the actions required, responsibilities, resources, and timeline. This is documented in the Annual QSE Objectives & Targets Plan.</li>
                    <li><strong>Monitoring & Measurement:</strong> Progress towards objectives is monitored through Key Performance Indicators (KPIs) displayed on the real-time monitoring dashboard (<code>/dashboard</code>) and reviewed during quarterly management meetings. Performance data is automatically collected from project modules including Lot Register, NCR Register, and Document Register.</li>
                    <li><strong>Communication:</strong> Objectives and progress are communicated to all employees through the system's communication module and dashboard displays.</li>
                    <li><strong>Continual Improvement:</strong> Objectives that are not met or require adjustment are logged in the Continual Improvement Register (QSE-10.3-REG-01) with associated corrective actions and target dates.</li>
                </ol>
            </div>
            )}
          </div>
        </section>
'''
