import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, HeartHandshake, Building2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor', // Only 'donor' or 'ngo' exposed
    phone: '',
    city: '',
    address: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleRoleSelect = (role) => {
    // Strictly restrict public selection to donor or ngo
    if (role === 'donor' || role === 'ngo') {
      setFormData((prev) => ({ ...prev, role }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role, // strictly 'donor' or 'ngo'
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      address: formData.address.trim()
    };

    const result = await register(payload);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-gray-500 mt-1">Join the ShareBite food redistribution network</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection: Strictly Donor or NGO */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('donor')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  formData.role === 'donor'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 text-emerald-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <HeartHandshake className={`w-5 h-5 mt-0.5 shrink-0 ${formData.role === 'donor' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <div>
                  <span className="block text-xs font-bold">Food Donor</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">Hotel, Caterer, or Individual</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ngo')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  formData.role === 'ngo'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 text-emerald-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Building2 className={`w-5 h-5 mt-0.5 shrink-0 ${formData.role === 'ngo' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <div>
                  <span className="block text-xs font-bold">NGO / Charity</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">Verified food relief organization</span>
                </div>
              </button>
            </div>

            {formData.role === 'ngo' && (
              <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                Note: NGO accounts require Admin verification before claiming donations.
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="name">
              {formData.role === 'ngo' ? 'NGO / Organization Name' : 'Full Name or Business Name'} *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder={formData.role === 'ngo' ? 'Helping Hands Foundation' : 'Chef Rahul / Grand Hotel'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="email">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@organization.org"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="password">
              Password (min. 6 characters) *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone & City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="city">
                City / Region
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="address">
              Address / Location
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Building, Street, Landmark"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isSubmitting ? 'Creating account...' : `Register as ${formData.role === 'ngo' ? 'NGO' : 'Donor'}`}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
