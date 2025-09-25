# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-4.3-STMT-01'
TITLE = 'IMS Scope Statement'

HTML = '''<section id="ims-scope" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            {/* Document Header */}
            <div 
              className="bg-green-100 text-gray-900 p-6 cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => toggleDoc('ims-scope')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="bg-green-200 text-gray-800 px-3 py-1 text-sm font-semibold">
                      Document 2
                    </span>
                    <span className="bg-green-200 text-gray-800 px-3 py-1 text-sm font-semibold">
                      Tier 1 - Static
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">IMS Scope Statement</h2>
                  <p className="text-gray-700 leading-relaxed">
                    A formal statement defining the boundaries and applicability of the IMS.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {expandedDocs['ims-scope'] ? (
                    <ChevronUp className="h-6 w-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-600" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Document Content */}
            {expandedDocs['ims-scope'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-4.3-STMT-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3"><span className="font-semibold">Author:</span> [QSE Manager], QSE Manager</div>
                <div className="border p-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
                <div className="border p-3"><span className="font-semibold">Next Review:</span> 24/07/2025</div>
              </div>

              <h3 className="mt-8 mb-4">1.0 Scope of the Integrated Management System</h3>
              <p className="mb-4">The Integrated Management System (IMS) of [Company Name] encompasses all activities, processes, products, and services associated with the provision of civil construction, project management, and related engineering services. This includes, but is not limited to, earthworks, road construction, bridge construction, drainage, and utilities installation for clients in both the public and private sectors across Australia.</p>
              
              <h3 className="mt-8 mb-4">2.0 Organizational Boundaries and Facilities</h3>
              <p className="mb-4">The IMS is applicable to all personnel (permanent, temporary, and contract) and all operations conducted under the control of [Company Name]. The IMS applies to all activities managed within the [Company Name] QSE software platform, from head office functions (in the <code>/qse</code> module) to project delivery (in the <code>/projects</code> module). This includes activities at all company-controlled sites, defined as:</p>
              <ul className="mb-4">
                <li><strong>Head Office:</strong> The central administrative and management functions located at [Head Office Address].</li>
                <li><strong>State and Regional Offices:</strong> All permanent support offices, including those in [Regional Office Locations].</li>
                <li><strong>Project Sites:</strong> All active and future construction sites, laydown yards, and temporary work areas under the direct operational control of [Company Name] for the duration of a project contract.</li>
                <li><strong>Workshops and Maintenance Facilities:</strong> Any permanent or temporary facility used for the storage, maintenance, and repair of company-owned plant and equipment.</li>
              </ul>
              <p className="mb-4">The scope is defined by considering our compliance obligations, organizational units, functions, and physical boundaries.</p>
              
              <h3 className="mt-8 mb-4">3.0 Applicable Standards and Conformance</h3>
              <p>The IMS is designed to ensure conformance with the full requirements of the following standards:</p>
              <ul>
                <li><strong>ISO 9001:2015:</strong> Quality Management Systems</li>
                <li><strong>ISO 14001:2015:</strong> Environmental Management Systems</li>
                <li><strong>ISO 45001:2018:</strong> Occupational Health & Safety Management Systems</li>
              </ul>
              <p>Furthermore, the scope includes our commitment to satisfying all applicable federal, state, and local legal requirements, relevant codes of practice, and all contractual requirements specified by our clients.</p>

              <h3 className="mt-8 mb-4">4.0 Justification for Non-Applicability (Exclusions)</h3>
              <p>To ensure the IMS accurately reflects our business model, the following clause of ISO 9001:2015 has been determined to be not applicable within our defined scope. This exclusion does not affect our ability or responsibility to consistently provide services that meet customer and applicable statutory and regulatory requirements.</p>
              <ul>
                <li><strong>Clause 8.3 - Design and Development of Products and Services:</strong></li>
                <li><strong>Justification:</strong> [Company Name] operates primarily as a constructor, realizing designs that are provided by our clients or their appointed third-party design consultants. We do not engage in original, clean-sheet design and development activities that would necessitate the full application of this clause. Our quality management processes for controlling client-supplied designs, verifying inputs, and managing design changes during construction are addressed under Clause 8.2 (Requirements for Products and Services) and 8.5 (Production and Service Provision). Temporary works designs and management of client-supplied designs are controlled within the project's 'Documents' module and linked to relevant Lots.</li>
              </ul>
              <p>All other clauses of ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 are considered fully applicable to the scope of this Integrated Management System.</p>

              <h3 className="mt-8 mb-4">5.0 Scope Review Checklist</h3>
              <p className="mb-4">The following checklist is used during periodic reviews to ensure the scope remains current and appropriate:</p>
              <div className="my-4 p-4 border">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Review Criteria</th>
                      <th className="border border-gray-300 p-2 text-left">Status</th>
                      <th className="border border-gray-300 p-2 text-left">Comments/Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Are all current organizational activities included in scope?</td>
                      <td className="border border-gray-300 p-2">[Enter status]</td>
                      <td className="border border-gray-300 p-2">[Enter comments]</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Are all locations and facilities covered?</td>
                      <td className="border border-gray-300 p-2">[Enter status]</td>
                      <td className="border border-gray-300 p-2">[Enter comments]</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Do exclusions remain valid and justified?</td>
                      <td className="border border-gray-300 p-2">[Enter status]</td>
                      <td className="border border-gray-300 p-2">[Enter comments]</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Are all applicable standards and regulations current?</td>
                      <td className="border border-gray-300 p-2">[Enter status]</td>
                      <td className="border border-gray-300 p-2">[Enter comments]</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Does scope align with business strategy?</td>
                      <td className="border border-gray-300 p-2">[Enter status]</td>
                      <td className="border border-gray-300 p-2">[Enter comments]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </section>
'''
