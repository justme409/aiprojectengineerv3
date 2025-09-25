# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-8.1-PROC-05'
TITLE = 'Construction & Operational Control Procedure'

HTML = '''<section id="construction-control" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-orange-100 text-gray-900 p-6 cursor-pointer hover:bg-orange-200 transition-colors"
              onClick={() => toggleDoc('construction-control')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Construction & Operational Control Procedure</h2>
                  <p className="text-gray-700">Defining the core processes for planning and executing work on site to control QSE risks.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Hammer className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['construction-control'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['construction-control'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-05</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To ensure that all construction and operational activities are planned and executed in a controlled manner that prevents harm to people, protects the environment, and meets quality specifications.</p>
                
                <h3 className="mt-8 mb-4">2.0 Risk-Based Work Planning</h3>
                <p>All on-site work must be planned and executed using a hierarchy of risk control documentation.</p>
                <h4>2.1 Safe Work Method Statements (SWMS)</h4>
                <ul>
                    <li>A SWMS is required for all High Risk Construction Work (HRCW) as defined by WHS Regulations.</li>
                    <li>The SWMS must be developed in consultation with the workers undertaking the task.</li>
                    <li>It must identify the steps of the task, the potential hazards, and the control measures to be implemented.</li>
                    <li>No HRCW shall commence until the SWMS has been reviewed and approved by the site supervisor and all workers involved have signed on to it.</li>
              </ul>

                <h4>2.2 Inspection and Test Plans (ITPs)</h4>
                <p>ITPs shall be developed for all key construction processes to ensure quality requirements are met. The ITP will detail the sequence of inspections, tests, hold points, and records required to verify conformity.</p>
            </div>
            )}
          </div>
        </section>
'''
