# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-4.1-REG-01'
TITLE = 'Register of Internal & External Issues'

HTML = '''<section id="issues-register" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-orange-100 text-gray-900 p-6 cursor-pointer hover:bg-orange-200 transition-colors"
              onClick={() => toggleDoc('issues-register')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Register of Internal & External Issues</h2>
                  <p className="text-gray-700">A live register documenting strategic issues relevant to QSE performance.</p>
                </div>
                <div className="flex items-center gap-3">
                  {expandedDocs['issues-register'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['issues-register'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-4.1-REG-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> D</div>
                <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Maintainer:</span> [QSE Manager], QSE Manager</div>
                <div className="border p-3"><span className="font-semibold">Review Frequency:</span> Quarterly</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 30/09/2024</div>
              </div>

              <h3 className="mt-8 mb-4">Internal Issues Register</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Issue ID</th>
                      <th className="border p-2 text-left">Category</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Impact on QSE</th>
                      <th className="border p-2 text-left">Status</th>
                      <th className="border p-2 text-left">Owner</th>
                      <th className="border p-2 text-left">Link to Risk Register (ID)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Issue ID]</td>
                      <td className="border p-2">[Enter Category]</td>
                      <td className="border p-2">[Enter Description]</td>
                      <td className="border p-2">[Enter Impact on QSE]</td>
                      <td className="border p-2">[Enter Status]</td>
                      <td className="border p-2">[Enter Owner]</td>
                      <td className="border p-2">[Enter Risk Register ID]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">External Issues Register</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Issue ID</th>
                      <th className="border p-2 text-left">Category</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Impact on QSE</th>
                      <th className="border p-2 text-left">Status</th>
                      <th className="border p-2 text-left">Monitor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Issue ID]</td>
                      <td className="border p-2">[Enter Category]</td>
                      <td className="border p-2">[Enter Description]</td>
                      <td className="border p-2">[Enter Impact on QSE]</td>
                      <td className="border p-2">[Enter Status]</td>
                      <td className="border p-2">[Enter Monitor]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Review and Update Process</h3>
              <ul>
                <li><strong>Quarterly Reviews:</strong> Formal assessment of all issues by the ELT during the quarterly management review, with updates to status and actions recorded.</li>
                <li><strong>Event-driven Updates:</strong> The register is updated immediately by the assigned owner when a significant new issue is identified or the nature of an existing issue changes.</li>
                <li><strong>Impact Assessment:</strong> A full review of all issues and their potential impact is conducted as part of the annual strategic planning and risk management cycle.</li>
              </ul>
            </div>
            )}
          </div>
        </section>
'''
