import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Palette, Globe, HelpCircle, User, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("notifications");
  const [helpSubsection, setHelpSubsection] = useState("");

  const handleSectionClick = (section) => {
    if (section.navigate) {
      navigate("/profile");
    } else {
      setActiveSection(section.id);
      setHelpSubsection(""); // Reset help subsection when switching main sections
    }
  };

  const handleHelpSubsection = (subsection) => {
    setHelpSubsection(subsection);
  };

  const settingsSections = [
    { id: "profile", name: "Profile Settings", icon: User, navigate: true },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "help", name: "Help & Support", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <nav className="space-y-2">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeSection === section.id && !section.navigate
                            ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{section.name}</span>
                        {section.navigate && <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {activeSection === "notifications" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✉️</span>
                          </div>
                          <h3 className="font-semibold text-green-800">Email Notifications Active</h3>
                        </div>
                        <p className="text-green-700 text-sm mb-3">
                          You'll automatically receive email notifications when someone submits your forms.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-green-100">
                          <p className="text-sm text-gray-600">
                            <strong>What you'll receive:</strong> Form name, submission date, and direct link to view responses
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">📧</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-800">Automatic Notifications</h4>
                            <p className="text-blue-700 text-sm mt-1">
                              Email notifications are always enabled for all form submissions to ensure you never miss important responses.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "security" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                    <div className="space-y-6">
                      <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <span className="text-gray-700">Change Password</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeSection === "help" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {!helpSubsection ? (
                      <>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Help & Support</h2>
                        <div className="space-y-4">
                          <button 
                            onClick={() => handleHelpSubsection("documentation")}
                            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <span className="text-gray-700">Documentation</span>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleHelpSubsection("contact")}
                            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <span className="text-gray-700">Contact Support</span>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleHelpSubsection("faq")}
                            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <span className="text-gray-700">FAQ</span>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => setHelpSubsection("")}
                          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                          <ChevronRight className="h-4 w-4 rotate-180" />
                          Back to Help & Support
                        </button>

                        {helpSubsection === "documentation" && (
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Documentation</h2>
                            <div className="space-y-6">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="font-semibold text-blue-800 mb-3">📚 Getting Started Guide</h3>
                                <p className="text-blue-700 mb-4">Learn how to create your first form and start collecting responses.</p>
                                <ul className="space-y-2 text-blue-700">
                                  <li>• Create a new form in minutes</li>
                                  <li>• Add various field types (text, email, dropdown, etc.)</li>
                                  <li>• Customize form appearance and settings</li>
                                  <li>• Share your form with respondents</li>
                                  <li>• View and analyze responses in real-time</li>
                                </ul>
                              </div>
                              
                              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="font-semibold text-green-800 mb-3">🔧 Advanced Features</h3>
                                <p className="text-green-700 mb-4">Explore powerful features to enhance your forms.</p>
                                <ul className="space-y-2 text-green-700">
                                  <li>• File upload support</li>
                                  <li>• QR code generation for easy sharing</li>
                                  <li>• Real-time response notifications</li>
                                  <li>• Form response management</li>
                                  <li>• Data export capabilities</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {helpSubsection === "contact" && (
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Support</h2>
                            <div className="space-y-6">
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                <h3 className="font-semibold text-purple-800 mb-3">📧 Email Support</h3>
                                <p className="text-purple-700 mb-4">Get help from our support team via email.</p>
                                <div className="bg-white rounded-lg p-4 border border-purple-100">
                                  <p className="text-gray-700 font-medium">support@formbuilder.com</p>
                                  <p className="text-gray-600 text-sm mt-1">Response time: Within 24 hours</p>
                                </div>
                              </div>
                              
                           
                              
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                                <h3 className="font-semibold text-indigo-800 mb-3">🐛 Bug Reports</h3>
                                <p className="text-indigo-700 mb-4">Found an issue? Let us know!</p>
                                <div className="bg-white rounded-lg p-4 border border-indigo-100">
                                  <p className="text-gray-700">Report bugs through our GitHub repository or email us with details.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {helpSubsection === "faq" && (
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">How do I create a new form?</h3>
                                <p className="text-gray-700">Navigate to your dashboard and click "Create New Form". Choose a template or start from scratch, add your fields, and customize the appearance.</p>
                              </div>
                              
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Can I collect file uploads?</h3>
                                <p className="text-gray-700">Yes! Add a file upload field to your form. Users can upload images, documents, and other files with size limits.</p>
                              </div>
                              
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">How do I share my form?</h3>
                                <p className="text-gray-700">Each form has a unique URL and QR code. Share the link directly, embed on your website, or use the QR code for mobile access.</p>
                              </div>
                              
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Can I export form responses?</h3>
                                <p className="text-gray-700">Yes! Export responses to CSV or Excel format from the form responses page. Filter by date range or specific responses.</p>
                              </div>
                              
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Is there a limit on form responses?</h3>
                                <p className="text-gray-700">Free accounts can collect up to 100 responses per form. Premium plans offer unlimited responses and additional features.</p>
                              </div>
                              
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">How do email notifications work?</h3>
                                <p className="text-gray-700">You'll automatically receive email notifications when someone submits your form. The email includes form details and a link to view responses.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
