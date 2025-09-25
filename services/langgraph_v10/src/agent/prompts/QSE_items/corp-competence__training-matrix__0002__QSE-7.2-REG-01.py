# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-7.2-REG-01'
TITLE = 'Training Needs Analysis & Competency Matrix'

HTML = '''<section id="training-matrix" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('training-matrix')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Training Needs Analysis & Competency Matrix</h2>
                  <p className="text-gray-700 leading-relaxed">A comprehensive matrix mapping required competencies to organizational roles and tracking training status.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['training-matrix'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['training-matrix'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-7.2-REG-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> C</div>
                <div className="border p-3"><span className="font-semibold">Last Updated:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Maintainer:</span> [HR Manager], HR Manager</div>
                <div className="border p-3"><span className="font-semibold">Review Frequency:</span> Annual</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 30/06/2025</div>
              </div>

              <h3 className="mt-8 mb-4">Core Competency Requirements by Role</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Position</th>
                      <th className="border p-2 text-left">Essential Qualifications</th>
                      <th className="border p-2 text-left">Mandatory QSE Training</th>
                      <th className="border p-2 text-left">Refresh Cycle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-semibold">[Enter Position Title]</td>
                      <td className="border p-2">[Enter Essential Qualifications]</td>
                      <td className="border p-2">[Enter Mandatory QSE Training Requirements]</td>
                      <td className="border p-2">[Enter Refresh Cycle]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Annual Corporate Training Plan - 2024</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Quarter</th>
                      <th className="border p-2 text-left">Strategic Training Program</th>
                      <th className="border p-2 text-left">Target Audience</th>
                      <th className="border p-2 text-left">Delivery Method</th>
                      <th className="border p-2 text-left">Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Quarter]</td>
                      <td className="border p-2">[Enter Training Program Name]</td>
                      <td className="border p-2">[Enter Target Audience & Number]</td>
                      <td className="border p-2">[Enter Delivery Method]</td>
                      <td className="border p-2">[Enter Budget Amount]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Competency Gap Analysis & Action Plan Template</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Development Area</th>
                      <th className="border p-2 text-left">Gap Description</th>
                      <th className="border p-2 text-left">Action Plan</th>
                      <th className="border p-2 text-left">Owner</th>
                      <th className="border p-2 text-left">Target Date</th>
                      <th className="border p-2 text-left">System Tracking</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Development Area]</td>
                      <td className="border p-2">[Enter Gap Description & Impact]</td>
                      <td className="border p-2">[Enter Action Plan with Resources]</td>
                      <td className="border p-2">[Enter Action Owner]</td>
                      <td className="border p-2">[Enter Target Completion Date]</td>
                      <td className="border p-2">[Link to Improvement Register QSE-10.3-REG-01]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </section>
'''
