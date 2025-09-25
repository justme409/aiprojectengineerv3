# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-8.1-PROC-03'
TITLE = 'WHS Management Procedure'

HTML = '''<section id="whs-mgmt" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-red-100 text-gray-900 p-6 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => toggleDoc('whs-mgmt')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">WHS Management Procedure</h2>
                  <p className="text-gray-700">The framework for managing Work Health & Safety risks and ensuring a safe workplace for everyone.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['whs-mgmt'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['whs-mgmt'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-03</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To outline the mandatory processes for managing Work Health and Safety (WHS) risks, ensuring compliance with legislation, and systematically working towards the elimination of work-related injury and illness.</p>
                
                <h3 className="mt-8 mb-4">2.0 WHS Risk Management</h3>
                <p>WHS risks shall be managed by following the hierarchy of controls. Project-specific WHS risks are to be identified and assessed in the Project Risk Register, with detailed controls documented in SWMS for high-risk activities.</p>

                <h3 className="mt-8 mb-4">3.0 Consultation & Participation</h3>
                <p>We are committed to consulting with our workers on WHS matters. This is achieved through Health and Safety Committees, daily pre-start meetings, and the development of SWMS in consultation with the work crews.</p>

                <h3 className="mt-8 mb-4">4.0 Incident Management</h3>
                <p>All WHS incidents, including near misses, must be reported immediately. Serious incidents will be investigated using the ICAM methodology to identify root causes and implement effective corrective actions.</p>
            </div>
            )}
          </div>
        </section>
'''
