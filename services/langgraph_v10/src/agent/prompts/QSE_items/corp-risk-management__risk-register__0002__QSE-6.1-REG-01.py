# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-6.1-REG-01'
TITLE = 'Corporate Risk Register'

HTML = '''<section id="risk-register" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-orange-100 text-gray-900 p-6 cursor-pointer hover:bg-orange-200 transition-colors"
              onClick={() => toggleDoc('risk-register')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Corporate Risk Register</h2>
                  <p className="text-gray-700">A live register of significant strategic and operational QSE risks.</p>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['risk-register'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['risk-register'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-6.1-REG-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> E</div>
                <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">ID</th>
                      <th className="border p-2 text-left">Risk Description</th>
                      <th className="border p-2 text-left">Consequence</th>
                      <th className="border p-2 text-left">Likelihood</th>
                      <th className="border p-2 text-left">Risk Level</th>
                      <th className="border p-2 text-left">Treatment Plan</th>
                      <th className="border p-2 text-left">Owner</th>
                      <th className="border p-2 text-left">Link to Projects/WBS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Risk ID]</td>
                      <td className="border p-2">[Enter Risk Description]</td>
                      <td className="border p-2">[Enter Consequence Level]</td>
                      <td className="border p-2">[Enter Likelihood]</td>
                      <td className="border p-2">[Enter Risk Level]</td>
                      <td className="border p-2">[Enter Treatment Plan]</td>
                      <td className="border p-2">[Enter Risk Owner]</td>
                      <td className="border p-2">[Link to WBS Agent/Project]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </section>
'''
