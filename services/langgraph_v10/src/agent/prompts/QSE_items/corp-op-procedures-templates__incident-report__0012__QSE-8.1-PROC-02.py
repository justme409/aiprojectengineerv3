# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-8.1-PROC-02'
TITLE = 'Incident Reporting & Investigation Procedure'

HTML = '''<section id="incident-report" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-red-100 text-gray-900 p-6 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => toggleDoc('incident-report')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Incident Reporting & Investigation Procedure</h2>
                  <p className="text-gray-700">A systematic process for reporting, classifying, and investigating incidents to prevent recurrence.</p>
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['incident-report'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['incident-report'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-02</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To ensure all QSE incidents are reported, investigated, and analysed in a timely and systematic manner to identify root causes, implement effective corrective actions, and share lessons learned across the organisation.</p>
                
                <h3 className="mt-8 mb-4">2.0 Reporting Requirements</h3>
                <ul>
                    <li>All incidents, including injuries, illnesses, property damage, environmental spills, and near misses, must be reported to the immediate supervisor as soon as practicable.</li>
                    <li>The supervisor must enter the initial report into the company's safety management system ('SafetyConnect') within 24 hours.</li>
                    <li>Notifiable incidents must be immediately reported to the regulator by the Project Manager or QSE Manager.</li>
              </ul>

                <h3 className="mt-8 mb-4">3.0 Investigation</h3>
                <p>The level of investigation shall be proportionate to the severity or potential severity of the incident. Significant incidents (with a high or extreme risk rating) must be investigated using the Incident Cause Analysis Method (ICAM) led by a trained investigator.</p>
            </div>
            )}
          </div>
        </section>
'''
