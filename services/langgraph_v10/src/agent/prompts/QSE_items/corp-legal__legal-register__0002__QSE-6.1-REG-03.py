# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-6.1-REG-03'
TITLE = 'Compliance Obligations Register'

HTML = '''<section id="legal-register" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
        <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
          onClick={() => toggleDoc('legal-register')}
        >
          <div className="flex items-center justify-between">
              <div>
                  <h2 className="text-2xl font-bold mb-2">Compliance Obligations Register</h2>
                  <p className="text-gray-700">A live register of the key legal and other requirements applicable to our operations.</p>
                </div>
                <div className="flex items-center gap-3">
                  <BookCheck className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['legal-register'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
        {expandedDocs['legal-register'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                  <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-6.1-REG-03</div>
                  <div className="border p-3"><span className="font-semibold">Revision:</span> C</div>
                  <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
              </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">ID</th>
                      <th className="border p-2 text-left">Obligation Title</th>
                      <th className="border p-2 text-left">Source / Jurisdiction</th>
                      <th className="border p-2 text-left">Key Requirements Summary</th>
                      <th className="border p-2 text-left">Applicable To</th>
                      <th className="border p-2 text-left">Compliance Check Method</th>
                      <th className="border p-2 text-left">Status</th>
                      <th className="border p-2 text-left">Next Review Date</th>
                      <th className="border p-2 text-left">Link to Projects/Risk Register</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                      <td className="border p-2">[Enter ID]</td>
                      <td className="border p-2">[Enter Obligation Title]</td>
                      <td className="border p-2">[Enter Source/Jurisdiction]</td>
                      <td className="border p-2">[Enter Key Requirements Summary]</td>
                      <td className="border p-2">[Enter Applicable To]</td>
                      <td className="border p-2">[Enter Compliance Check Method]</td>
                      <td className="border p-2">[Enter Status]</td>
                      <td className="border p-2">[Enter Next Review Date]</td>
                      <td className="border p-2">[Link to Project/Risk Register ID]</td>
                  </tr>
                </tbody>
              </table>
              </div>

              <h3 className="mt-8 mb-4">Legal Change Notification Template</h3>
              <p>When legal requirements change, the following template is used to notify affected personnel:</p>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Field</th>
                      <th className="border p-2 text-left">Information Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-semibold">Change Description</td>
                      <td className="border p-2">[Enter description of legal change]</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Effective Date</td>
                      <td className="border p-2">[Enter effective date]</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Affected Areas</td>
                      <td className="border p-2">[Enter affected business areas/projects]</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Required Actions</td>
                      <td className="border p-2">[Enter required actions for compliance]</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Responsible Person</td>
                      <td className="border p-2">[Enter responsible person]</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Implementation Deadline</td>
                      <td className="border p-2">[Enter implementation deadline]</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Training Required</td>
                      <td className="border p-2">[Yes/No - Enter training requirements]</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">System Updates Required</td>
                      <td className="border p-2">[Enter system/procedure updates needed]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
      </section>
'''
