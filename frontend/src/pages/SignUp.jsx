import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, PenTool, ArrowRight } from 'lucide-react';
import loginVideo from '../assets/Login page wave.mp4';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', expertise: '', portfolio: '', bio: '', interests: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...formData, role });
      navigate('/signin');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center lg:justify-end py-12 px-4 sm:px-6 lg:px-8 lg:pr-24 xl:pr-48 overflow-hidden bg-gray-100">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-top z-0"
      >
        <source src={loginVideo} type="video/mp4" />
      </video>
      
      {/* Overlay to ensure form readability */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      <div className="relative z-10 max-w-md w-full space-y-8 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Join CastNcart' : `Create ${role} Account`}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? 'Choose how you want to use the platform' : 'Fill in your details below'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="grid grid-cols-1 gap-4 mt-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('User')}
              className="cursor-pointer border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Learner</h3>
                    <p className="text-sm text-gray-500">I want to learn new skills</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('Creator')}
              className="cursor-pointer border-2 border-gray-200 rounded-xl p-6 hover:border-secondary transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-50 text-secondary rounded-full flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Creator</h3>
                    <p className="text-sm text-gray-500">I want to teach and host workshops</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-secondary transition-colors" />
              </div>
            </motion.div>
            
            <div className="text-center mt-4">
              <Link to="/signin" className="text-sm text-primary hover:underline">Already have an account? Sign in</Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="••••••••" />
              </div>

              {role === 'Creator' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expertise</label>
                    <input name="expertise" type="text" value={formData.expertise} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Web Development" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                    <input name="portfolio" type="text" value={formData.portfolio} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="https://" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Tell us about yourself..."></textarea>
                  </div>
                </>
              )}
              {role === 'User' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Areas of Interest</label>
                  <input name="interests" type="text" value={formData.interests} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Design, Coding, Marketing" />
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading} className="w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
