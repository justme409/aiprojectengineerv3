# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-7.4-REG-01'
TITLE = 'Communication Matrix'

HTML = '''<section id="communication-matrix" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('communication-matrix')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Communication Matrix</h2>
                  <p className="text-gray-700 leading-relaxed">A comprehensive matrix defining communication requirements, channels, and responsibilities for different stakeholder groups and information types.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Network className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['communication-matrix'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['communication-matrix'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-7.4-REG-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Maintainer:</span> [QSE Manager], QSE Manager</div>
                <div className="border p-3"><span className="font-semibold">Review Frequency:</span> Annual</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 30/06/2025</div>
              </div>

              <h3 className="mt-8 mb-4">Internal Communication Matrix</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Information Type</th>
                      <th className="border p-2 text-left">Audience</th>
                      <th className="border p-2 text-left">Method</th>
                      <th className="border p-2 text-left">Frequency</th>
                      <th className="border p-2 text-left">Responsibility</th>
                      <th className="border p-2 text-left">Success Measure</th>
                      <th className="border p-2 text-left">System Integration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Information Type]</td>
                      <td className="border p-2">[Enter Target Audience]</td>
                      <td className="border p-2">[Enter Communication Method]</td>
                      <td className="border p-2">[Enter Frequency]</td>
                      <td className="border p-2">[Enter Responsible Person]</td>
                      <td className="border p-2">[Enter Success Measure/KPI]</td>
                      <td className="border p-2">[Auto-tracked via Dashboard/System Module]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">External Communication Matrix</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                   <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Stakeholder</th>
                      <th className="border p-2 text-left">Information Type</th>
                      <th className="border p-2 text-left">Method</th>
                      <th className="border p-2 text-left">Frequency</th>
                      <th className="border p-2 text-left">Responsibility</th>
                      <th className="border p-2 text-left">System Tracking</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-semibold">[Enter Stakeholder Group]</td>
                      <td className="border p-2">[Enter Information Type]</td>
                      <td className="border p-2">[Enter Communication Method]</td>
                      <td className="border p-2">[Enter Frequency/Timing]</td>
                      <td className="border p-2">[Enter Responsible Person/Role]</td>
                      <td className="border p-2">[System Module/Dashboard Link]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Communication Effectiveness Evaluation Template</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Communication Activity</th>
                      <th className="border p-2 text-left">Target Metric</th>
                      <th className="border p-2 text-left">Actual Performance</th>
                      <th className="border p-2 text-left">Variance</th>
                      <th className="border p-2 text-left">Issues Identified</th>
                      <th className="border p-2 text-left">Improvement Actions</th>
                      <th className="border p-2 text-left">System Tracking ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Communication Activity]</td>
                      <td className="border p-2">[Enter Target/KPI]</td>
                      <td className="border p-2">[Auto-populated from System]</td>
                      <td className="border p-2">[Calculated Variance]</td>
                      <td className="border p-2">[Enter Issues/Barriers]</td>
                      <td className="border p-2">[Enter Improvement Actions]</td>
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
