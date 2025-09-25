# QSE extracted item (verbatim HTML preserved)
ITEM_ID = 'QSE-5.2-POL-01'
TITLE = 'QSE Policy Statement'

HTML = '''<section id="qse-policy" className="scroll-mt-8">
          <div className="bg-white border border-slate-300">
            <div 
              className="bg-blue-100 text-gray-900 p-6 cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => toggleDoc('qse-policy')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">QSE Policy Statement</h2>
                  <p className="text-gray-700">The official declaration of top management's commitment to Quality, Safety, and the Environment.</p>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-600 opacity-60" />
                  {expandedDocs['qse-policy'] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </div>
              </div>
            </div>
            {expandedDocs['qse-policy'] && (
            <div className="p-8 prose prose-slate max-w-none">
              <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div className="border p-3"><span className="font-semibold">Document ID:</span> QSE-5.2-POL-01</div>
                <div className="border p-3"><span className="font-semibold">Revision:</span> A</div>
                <div className="border p-3"><span className="font-semibold">Effective Date:</span> 24/07/2024</div>
                <div className="border p-3 col-span-3"><span className="font-semibold">Approver:</span> [CEO], CEO</div>
              </div>

              <h3 className="text-center text-2xl font-bold mt-8 mb-4">Integrated Quality, Safety, and Environmental (QSE) Policy</h3>
              
              <p className="font-semibold">[Company Name] is a leader in the Australian civil construction industry. We are committed to achieving excellence in all aspects of our operations, with a particular focus on delivering superior quality to our clients, ensuring the health and safety of our people, and protecting the environment in the communities where we work.</p>

              <h4 className="mt-6 mb-2 font-bold">Our Commitment:</h4>
              <p>We are dedicated to the continual improvement of our Integrated Management System (IMS) and performance. To achieve this, we commit to:</p>
              
              <ul className="space-y-2">
                <li><strong>Client Satisfaction:</strong> Consistently meeting or exceeding client expectations by delivering high-quality projects on time and within budget through robust project management and quality assurance processes.</li>
                <li><strong>Health & Safety:</strong> Providing a safe and healthy work environment for all employees, subcontractors, and visitors, with the ultimate goal of eliminating work-related injury and ill health. We will consult with our workers and actively encourage their participation in OHS matters.</li>
                <li><strong>Environmental Protection:</strong> Preventing pollution, minimizing our environmental footprint by reducing waste and conserving resources, and protecting biodiversity and cultural heritage.</li>
                <li><strong>Compliance:</strong> Fulfilling all applicable legal requirements, industry standards, and other obligations to which we subscribe.</li>
                <li><strong>Risk Management:</strong> Identifying, assessing, and controlling QSE risks and opportunities to ensure the resilience and sustainability of our business.</li>
                <li><strong>Objectives & Targets:</strong> Setting, monitoring, and reviewing measurable QSE objectives and targets to drive continual improvement.</li>
                <li><strong>Resources & Competence:</strong> Ensuring the availability of necessary resources and promoting the competence and awareness of our people to enable them to fulfill their responsibilities effectively.</li>
              </ul>
              
              <p className="mt-4">This policy is communicated to all persons working for or on behalf of [Company Name] and is made available to the public and other interested parties. It is reviewed annually to ensure its ongoing suitability and effectiveness.</p>
              
              <div className="mt-12 text-right">
                <p className="font-bold">_________________________</p>
                <p>[CEO Name]</p>
                <p>Chief Executive Officer</p>
                <p>Date: 24/07/2024</p>
              </div>

            </div>
            )}
          </div>
        </section>
'''
