import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { QrCodeIcon, LinkIcon, GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import hero from "../assets/heroimg.png"

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center pt-16 pb-12 px-4">
        <div className="max-w-4xl w-full mx-auto bg-white/80 rounded-2xl shadow-xl p-10 text-center space-y-8">
          <h1 className="text-5xl font-black text-blue-700 tracking-tight">
            Effortless Online Form Builder
          </h1>
          <p className="text-gray-600 text-lg">
            Create, share, and analyze surveys, polls, quizzes, and more—fast. Accessible from any device.
          </p>
          
          {user ? (
            <div className="space-y-2">
              <span className="text-xl text-gray-800">
                Welcome, <span className="text-blue-600 font-bold">{user.name}</span>!
              </span>
              <div className="flex justify-center space-x-6 pt-2">
                <button
                  onClick={() => navigate('/create')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                >Create New Form</button>
                <button
                  onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/my-forms')}
                  className="px-8 py-4 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                >View My Forms</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center space-x-6 pt-2">
              <button onClick={() => navigate('/login')} className="px-6 py-3 bg-blue-600 text-white rounded-md shadow">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md shadow">
                Register
              </button>
            </div>
          )}

          {/* Preview Image or Illustration */}
          <div className="flex justify-center pt-6">
            <img
              src={hero}
              alt="Form builder illustration"
              className="w-64 h-48 object-contain"
              loading="lazy"
              style={{ filter: 'drop-shadow(0 10px 10px #3b82f6aa)' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-4xl mx-auto pt-8 pb-6 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            Icon={LinkIcon}
            title="Share by Link"
            description="Distribute forms instantly with unique shareable links."
          />
          <FeatureCard
            Icon={QrCodeIcon}
            title="QR Code Sharing"
            description="Easily generate QR codes for fast mobile access."
          />
          <FeatureCard
            Icon={GlobeAltIcon}
            title="Works Everywhere"
            description="Fully responsive on all devices—phones, tablets, desktops."
          />
          <FeatureCard
            Icon={LockClosedIcon}
            title="Secure & Private"
            description="Form responses are protected with modern security."
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="pt-12 pb-8 max-w-4xl w-full px-4">
        <h2 className="text-3xl font-extrabold text-blue-700 text-center pb-6">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <StepCard step="1" title="Build" description="Design your custom form with drag-and-drop ease." />
          <StepCard step="2" title="Share" description="Copy the link or QR code and send to anyone." />
          <StepCard step="3" title="Collect" description="View real-time responses and analyze results." />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-10 max-w-4xl w-full px-4">
        <h2 className="text-2xl font-bold text-gray-700 text-center pb-3">Why Choose This Form Builder?</h2>
        <ul className="list-disc space-y-1 mx-auto text-gray-600 text-center max-w-2xl">
          <li>No signup required for respondents—simplifies data collection.</li>
          <li>Instant analytics dashboard to track results.</li>
          <li>Customizable design to match your brand or style.</li>
        </ul>
      </section>
    </div>
  );
}

// Featured Card Helper
function FeatureCard({ Icon, title, description }) {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow hover:shadow-xl transition">
      <Icon className="h-10 w-10 text-blue-600 mb-3" />
      <span className="text-xl font-bold text-gray-900">{title}</span>
      <span className="text-gray-500 mt-2 text-center">{description}</span>
    </div>
  );
}

// Step Card Helper
function StepCard({ step, title, description }) {
  return (
    <div className="flex flex-col items-center bg-blue-50 rounded-xl p-6 shadow">
      <div className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold text-xl mb-3">{step}</div>
      <span className="font-semibold text-blue-700">{title}</span>
      <span className="text-gray-600 mt-2 text-center">{description}</span>
    </div>
  );
}
