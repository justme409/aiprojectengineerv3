# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-4.2-REG-01'
TITLE = 'Register of Interested Parties & Requirements'

HTML = '''<section id="stakeholders-register" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-teal-100 text-gray-900 p-6 cursor-pointer hover:bg-teal-200 transition-colors"
              onClick={() => toggleDoc('stakeholders-register')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Register of Interested Parties & Requirements</h2>
                  <p className="text-gray-700">A register of all stakeholders, their needs, and expectations.</p>
                </div>
                <div className="flex items-center gap-3">

                  {expandedDocs['stakeholders-register'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['stakeholders-register'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-4.2-REG-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> C</div>
                <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Maintainer:</span> [QSE Manager], QSE Manager</div>
                <div className="border p-3"><span className="font-semibold">Review Frequency:</span> Semi-Annual</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 31/12/2024</div>
              </div>

              <h3 className="mt-8 mb-4">Interested Parties and Their Requirements</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Stakeholder Group</th>
                      <th className="border p-2 text-left">Specific Party</th>
                      <th className="border p-2 text-left">Key Requirements & Expectations (Needs)</th>
                      <th className="border p-2 text-left">QSE Relevance</th>
                      <th className="border p-2 text-left">Engagement Method</th>
                      <th className="border p-2 text-left">Frequency</th>
                      <th className="border p-2 text-left">Link to Communication Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Stakeholder Group]</td>
                      <td className="border p-2">[Enter Specific Party]</td>
                      <td className="border p-2">[Enter Key Requirements & Expectations]</td>
                      <td className="border p-2">[Enter QSE Relevance]</td>
                      <td className="border p-2">[Enter Engagement Method]</td>
                      <td className="border p-2">[Enter Frequency]</td>
                      <td className="border p-2">[Enter Communication Plan Link]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Stakeholder Engagement Strategy</h3>
              <ul>
                <li><strong>Proactive Communication:</strong> Engagement is planned and proactive, aiming to build strong, trust-based relationships and prevent issues before they arise.</li>
                <li><strong>Responsiveness:</strong> All stakeholder inquiries and complaints are logged, acknowledged, and responded to within defined timeframes.</li>
                <li><strong>Transparency:</strong> We are committed to open communication regarding our QSE performance, challenges, and improvement initiatives, where appropriate.</li>
                <li><strong>Feedback Integration:</strong> Feedback from interested parties is a key input into our risk management and continual improvement processes. It is formally reviewed during management reviews.</li>
              </ul>

              <h3 className="mt-8 mb-4">Review and Updates</h3>
              <p>This register is formally reviewed at least semi-annually during management review meetings. It is a live document and must be updated by the QSE Manager or relevant Project Manager whenever:</p>
              <ul>
                <li>A new project is commenced, requiring identification of project-specific stakeholders.</li>
                <li>There is a significant change in organizational structure or scope.</li>
                <li>New legal or other requirements are identified.</li>
                <li>Feedback indicates that the needs of an interested party have changed.</li>
              </ul>
            </div>
            )}
          </div>
        </section>
'''
