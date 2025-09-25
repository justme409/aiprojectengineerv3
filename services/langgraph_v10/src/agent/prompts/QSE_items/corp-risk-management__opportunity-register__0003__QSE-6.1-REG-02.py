# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-6.1-REG-02'
TITLE = 'Corporate Opportunity Register'

HTML = '''<section id="opportunity-register" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('opportunity-register')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Corporate Opportunity Register</h2>
                  <p className="text-gray-700">A register for tracking potential improvements and strategic QSE opportunities.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['opportunity-register'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['opportunity-register'] && (
            <div className="p-8 prose prose-slate max-w-none">
                <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-6.1-REG-02</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                    <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border p-2 text-left">ID</th>
                          <th className="border p-2 text-left">Opportunity Description</th>
                          <th className="border p-2 text-left">Potential Benefit</th>
                          <th className="border p-2 text-left">Action Plan</th>
                          <th className="border p-2 text-left">Status</th>
                          <th className="border p-2 text-left">Owner</th>
                          <th className="border p-2 text-left">Link to Improvement Register</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2">[Enter Opportunity ID]</td>
                          <td className="border p-2">[Enter Opportunity Description]</td>
                          <td className="border p-2">[Enter Potential Benefit]</td>
                          <td className="border p-2">[Enter Action Plan]</td>
                          <td className="border p-2">[Enter Status]</td>
                          <td className="border p-2">[Enter Opportunity Owner]</td>
                          <td className="border p-2">[Link to QSE-10.3-REG-01]</td>
                        </tr>
                      </tbody>
                    </table>
                 </div>
            </div>
            )}
          </div>
        </section>
'''
