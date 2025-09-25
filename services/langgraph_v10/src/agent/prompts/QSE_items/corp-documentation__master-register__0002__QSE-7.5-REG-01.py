# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-7.5-REG-01'
TITLE = 'Master Document & Records Register'

HTML = '''<section id="master-register" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('master-register')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Master Document & Records Register</h2>
                  <p className="text-gray-700 leading-relaxed">A comprehensive register of all controlled documents and records within the QSE management system, tracking status, ownership, and review requirements.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['master-register'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['master-register'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-7.5-REG-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> D</div>
                <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Maintainer:</span> [Document Controller], Document Controller</div>
                <div className="border p-3"><span className="font-semibold">Review Frequency:</span> Quarterly</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 30/09/2024</div>
              </div>

              <h3 className="mt-8 mb-4">Part A: Controlled Documents Register</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Doc ID</th>
                      <th className="border p-2 text-left">Document Title</th>
                      <th className="border p-2 text-left">Type</th>
                      <th className="border p-2 text-left">Rev</th>
                      <th className="border p-2 text-left">Owner</th>
                      <th className="border p-2 text-left">Next Review</th>
                      <th className="border p-2 text-left">System Status</th>
                      <th className="border p-2 text-left">Access Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Document ID]</td>
                      <td className="border p-2">[Enter Document Title]</td>
                      <td className="border p-2">[Enter Document Type]</td>
                      <td className="border p-2">[Rev]</td>
                      <td className="border p-2">[Enter Owner/Role]</td>
                      <td className="border p-2">[Enter Next Review Date]</td>
                      <td className="border p-2">[Auto-tracked: Active/Review Due/Obsolete]</td>
                      <td className="border p-2">[Auto-assigned: Public/Restricted/Confidential]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Part B: Records Register</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Record Type</th>
                      <th className="border p-2 text-left">Storage Location</th>
                      <th className="border p-2 text-left">Format</th>
                      <th className="border p-2 text-left">Retention Period</th>
                      <th className="border p-2 text-left">Disposal Method</th>
                      <th className="border p-2 text-left">System Module</th>
                      <th className="border p-2 text-left">Auto-Alerts</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Record Type]</td>
                      <td className="border p-2">[Digital Repository/System Module]</td>
                      <td className="border p-2">[Electronic/Physical/Hybrid]</td>
                      <td className="border p-2">[Enter Retention Period]</td>
                      <td className="border p-2">[Automatic Secure Disposal Method]</td>
                      <td className="border p-2">[QSE System Module Link]</td>
                      <td className="border p-2">[Auto-generated disposal alerts]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Document Control Analytics Template</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Metric</th>
                      <th className="border p-2 text-left">Current Value</th>
                      <th className="border p-2 text-left">Target</th>
                      <th className="border p-2 text-left">Trend</th>
                      <th className="border p-2 text-left">Action Required</th>
                      <th className="border p-2 text-left">Dashboard Link</th>
                      <th className="border p-2 text-left">Improvement ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Document Metric]</td>
                      <td className="border p-2">[Auto-populated from System]</td>
                      <td className="border p-2">[Enter Target Value]</td>
                      <td className="border p-2">[Auto-calculated Trend]</td>
                      <td className="border p-2">[Enter Action if Below Target]</td>
                      <td className="border p-2">[Link to /dashboard]</td>
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
