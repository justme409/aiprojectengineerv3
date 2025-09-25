# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-8.1-PROC-04'
TITLE = 'Environmental Management Procedure'

HTML = '''<section id="environmental-mgmt" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-teal-100 text-gray-900 p-6 cursor-pointer hover:bg-teal-200 transition-colors"
              onClick={() => toggleDoc('environmental-mgmt')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Environmental Management Procedure</h2>
                  <p className="text-gray-700">Identifying and controlling environmental aspects and impacts on our projects.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Recycle className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['environmental-mgmt'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['environmental-mgmt'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-04</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To establish a framework for identifying, assessing, and managing environmental aspects and impacts associated with our construction activities, ensuring compliance with legal requirements and promoting environmental protection.</p>
                
                <h3 className="mt-8 mb-4">2.0 Key Management Areas</h3>
                
                <h4>2.1 Erosion & Sediment Control</h4>
                <p>All projects must implement an Erosion and Sediment Control Plan (ESCP) to minimise the impact of soil disturbance on waterways. Controls (e.g., sediment fences, catch drains) must be in place before bulk earthworks commence and be maintained regularly, especially after rainfall.</p>

                <h4>2.2 Waste Management</h4>
                <p>Waste shall be managed according to the waste hierarchy (Avoid, Reduce, Reuse, Recycle, Dispose). All waste streams must be segregated on site, and licensed contractors used for disposal. Waste tracking records must be maintained.</p>

                <h4>2.3 Spill Prevention & Response</h4>
                <p>All hazardous substances must be stored in appropriately bunded areas. Spill kits must be readily available where liquids are stored or transferred. In the event of a spill, it must be contained immediately, and reported in accordance with the Incident Reporting Procedure.</p>

            </div>
            )}
          </div>
        </section>
'''
