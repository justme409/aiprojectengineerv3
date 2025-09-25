# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-6.2-PLN-01'
TITLE = 'Annual QSE Objectives & Targets Plan'

HTML = '''<section id="objectives-plan" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('objectives-plan')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Annual QSE Objectives & Targets Plan</h2>
                  <p className="text-gray-700">The documented plan outlining our specific QSE goals for the current year.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['objectives-plan'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['objectives-plan'] && (
            <div className="p-8 prose prose-slate max-w-none">
                <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-6.2-PLN-01</div>
                    <div className="border p-3"><span className="font-semibold">Year:</span> 2024</div>
                    <div className="border p-3"><span className="font-semibold">Approved by:</span> [CEO], CEO</div>
                </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Area</th>
                      <th className="border p-2 text-left">Objective</th>
                      <th className="border p-2 text-left">Target</th>
                      <th className="border p-2 text-left">KPI</th>
                      <th className="border p-2 text-left">Owner</th>
                      <th className="border p-2 text-left">Current Status</th>
                      <th className="border p-2 text-left">Due Date</th>
                      <th className="border p-2 text-left">Dashboard Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-semibold">[Enter QSE Area]</td>
                      <td className="border p-2">[Enter Objective Description]</td>
                      <td className="border p-2">[Enter Measurable Target]</td>
                      <td className="border p-2">[Enter KPI/Measurement Method]</td>
                      <td className="border p-2">[Enter Owner Name]</td>
                      <td className="border p-2">[Auto-populated from Dashboard]</td>
                      <td className="border p-2">[Enter Due Date]</td>
                      <td className="border p-2">[Link to Dashboard Module]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-8 mb-4">Objective Progress Tracking</h3>
              <p>Progress tracking for QSE objectives is integrated with the system's monitoring capabilities:</p>
              <ul>
                <li><strong>Real-Time Dashboard:</strong> Current performance metrics are displayed on the main dashboard (<code>/dashboard</code>) with automatic updates from project data</li>
                <li><strong>Monthly Reviews:</strong> Automated reports generated from system data for management review meetings</li>
                <li><strong>Variance Analysis:</strong> Objectives not meeting targets trigger automatic alerts and are flagged for corrective action in the Continual Improvement Register</li>
                <li><strong>Historical Tracking:</strong> System maintains complete historical data for trend analysis and year-over-year comparisons</li>
              </ul>

              <h3 className="mt-8 mb-4">Objective Review Template</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Review Period</th>
                      <th className="border p-2 text-left">Objective</th>
                      <th className="border p-2 text-left">Target Performance</th>
                      <th className="border p-2 text-left">Actual Performance</th>
                      <th className="border p-2 text-left">Variance</th>
                      <th className="border p-2 text-left">Action Required</th>
                      <th className="border p-2 text-left">Improvement Register ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">[Enter Review Period]</td>
                      <td className="border p-2">[Enter Objective]</td>
                      <td className="border p-2">[Enter Target]</td>
                      <td className="border p-2">[Enter Actual Performance]</td>
                      <td className="border p-2">[Calculate Variance]</td>
                      <td className="border p-2">[Enter Required Action]</td>
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
