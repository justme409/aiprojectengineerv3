# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-5.4-FORM-01'
TITLE = 'Health & Safety Committee Meeting Minutes Template'

HTML = '''<section id="hsc-minutes" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-teal-100 text-gray-900 p-6 cursor-pointer hover:bg-teal-200 transition-colors"
              onClick={() => toggleDoc('hsc-minutes')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Health & Safety Committee Meeting Minutes Template</h2>
                  <p className="text-gray-700">A blank template for recording formal consultation processes.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['hsc-minutes'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['hsc-minutes'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-5.4-FORM-01</div>
                <div className="border p-3"><span className="font-semibold">Meeting Date:</span> [Enter Meeting Date]</div>
                <div className="border p-3"><span className="font-semibold">Location:</span> [Enter Meeting Location]</div>
              </div>
              
              <h3 className="text-center text-xl font-bold mt-8 mb-4">Health & Safety Committee Meeting Minutes Template</h3>
              
              <p><strong>Attendees:</strong> [Enter list of attendees]</p>
              <p><strong>Apologies:</strong> [Enter list of apologies]</p>
              <p><strong>Secretariat:</strong> [Enter secretariat name]</p>

              <h4 className="mt-6 mb-2 font-bold">1.0 Welcome & Opening Remarks</h4>
              <p>[Enter opening remarks and key safety messages]</p>

              <h4 className="mt-6 mb-2 font-bold">2.0 Review of Previous Minutes & Actions</h4>
              <p>[Enter review of previous minutes acceptance]</p>
              <ul>
                <li>[Enter status of previous actions]</li>
              </ul>
              
              <h4 className="mt-6 mb-2 font-bold">3.0 QSE Performance Review</h4>
              <p>[Enter performance dashboard presentation summary]</p>
              <ul>
                <li><strong>Lead Indicators:</strong> [Enter lead indicator data]</li>
                <li><strong>Lag Indicators:</strong> [Enter lag indicator data]</li>
                <li><strong>Environmental:</strong> [Enter environmental performance data]</li>
              </ul>

              <h4 className="mt-6 mb-2 font-bold">4.0 HSR Reports & Key Issues Raised</h4>
              <p>[Enter HSR reports and key issues discussed]</p>

              <h4 className="mt-6 mb-2 font-bold">5.0 New Business</h4>
              <p>[Enter new business items discussed]</p>

              <h4 className="mt-6 mb-2 font-bold">6.0 Actions Arising from Meeting</h4>
              <p><strong>Note:</strong> Actions arising are to be logged in the Continual Improvement Register (QSE-10.3-REG-01) with assigned responsibilities and due dates tracked within the system.</p>
              <table className="min-w-full border border-gray-300 text-sm mb-8">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Action ID</th>
                    <th className="border p-2 text-left">Action Item</th>
                    <th className="border p-2 text-left">Responsible</th>
                    <th className="border p-2 text-left">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">[Enter Action ID]</td>
                    <td className="border p-2">[Enter Action Description]</td>
                    <td className="border p-2">[Enter Responsible Person]</td>
                    <td className="border p-2">[Enter Due Date]</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="mt-6 mb-2 font-bold">7.0 Next Meeting</h4>
              <p>[Enter next meeting details]</p>

            </div>
            )}
          </div>
        </section>
'''
