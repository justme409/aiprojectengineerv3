# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-8.1-PROC-06'
TITLE = 'Design & Development Control Procedure'

HTML = '''<section id="design-control" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-purple-100 text-gray-900 p-6 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => toggleDoc('design-control')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Design & Development Control Procedure</h2>
                  <p className="text-gray-700">Managing client-supplied and minor temporary works designs to ensure QSE compliance and constructability.</p>
                </div>
                <div className="flex items-center gap-3">
                  <TestTube className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['design-control'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['design-control'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-8.1-PROC-06</div>
                    <div className="border p-3"><span className="font-semibold">Revision:</span> B</div>
                    <div className="border p-3"><span className="font-semibold">Effective Date:</span> 25/07/2024</div>
              </div>
                <h3 className="mt-8 mb-4">1.0 Purpose</h3>
                <p>To establish a systematic process for the review, verification, and management of designs used for construction. While <span style={{backgroundColor: 'yellow'}}>AustBuild Civil Pty Ltd</span> typically does not perform principal design, this procedure ensures that client-supplied designs are fit for purpose and that any minor or temporary works designs we produce are safe, compliant, and controlled.</p>
                
                <h3 className="mt-8 mb-4">2.0 Management of Client-Supplied Design</h3>
                <h4>2.1 Design Input Review</h4>
                <p>Upon receipt, all client-supplied design packages shall undergo a formal multi-disciplinary review before being issued 'For Construction'. This review shall assess:</p>
                <ul>
                    <li><strong>Constructability:</strong> Feasibility of construction methods, site access, and sequencing.</li>
                    <li><strong>Safety in Design:</strong> Identification of hazards that may be introduced during construction, maintenance, or demolition, and verification that risks are eliminated or minimised So Far As Is Reasonably Practicable (SFAIRP).</li>
                    <li><strong>Environmental Considerations:</strong> Impact on sensitive receivers, heritage items, flora, and fauna.</li>
                    <li><strong>Quality:</strong> Clarity, completeness, and absence of conflicts within the design documentation.</li>
              </ul>
                <p>Findings from this review will be documented in a Design Review Report and communicated to the client.</p>

                <h4>2.2 Design Verification</h4>
                <p>Where specified by the contract or deemed necessary by the Project Manager, key design elements shall be subject to independent verification by a competent third-party engineer.</p>

                <h3 className="mt-8 mb-4">3.0 Control of AustBuild Civil Generated Design</h3>
                <p>For minor temporary works (e.g., traffic management plans, formwork, excavation support) designed internally or by our consultants:</p>
                <ul>
                    <li>Designs shall be developed by competent persons with relevant experience.</li>
                    <li>All designs must be independently checked and verified before use.</li>
                    <li>A risk assessment must be completed and documented as part of the design package.</li>
              </ul>

                <h3 className="mt-8 mb-4">4.0 Design Change Control</h3>
                <p>No changes shall be made to an approved design without following a formal change management process. This includes:</p>
                <ol>
                    <li>Documenting the proposed change on a Design Change Request form.</li>
                    <li>Assessing the impact of the change on safety, cost, schedule, and quality.</li>
                    <li>Obtaining approval for the change from the client and the Project Manager before implementation.</li>
                </ol>
            </div>
            )}
          </div>
        </section>
'''
