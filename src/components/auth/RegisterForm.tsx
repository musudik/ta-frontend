import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { toast } from 'sonner';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.CLIENT,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await register(formData);
      const user = response.user;

      // Display success message
      toast.success('Registration successful!');

      // Navigate based on user role
      if (user.role === UserRole.CLIENT) {
        navigate('/dashboard/client');
      } else if (user.role === UserRole.TAX_AGENT) {
        navigate('/dashboard/tax-agent');
      } else if (user.role === UserRole.ADMIN) {
        navigate('/dashboard/admin');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Display the specific error message if available
      if (error.message) {
        // Check if it's a duplicate email error (for better UX)
        if (error.message.includes('email') && error.message.includes('already in use')) {
          toast.error(error.message, {
            duration: 5000, // Show longer for important errors
            position: 'top-center',
          });
        } else {
          toast.error(error.message);
        }
      } else if (error.response?.data?.message) {
        // Try to get error directly from response if available
        toast.error(error.response.data.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-form-container animate-fade-in">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">
          Or{' '}
          <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your account
          </a>
        </p>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="auth-input-group">
                <label htmlFor="firstName" className="sr-only">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="auth-input"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-input-group">
                <label htmlFor="lastName" className="sr-only">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="auth-input"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="auth-input-group">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="auth-input"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="auth-input-group">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="auth-input"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="auth-input-group">
              <label htmlFor="role" className="sr-only">Role</label>
              <div className="auth-select-container">
                <select
                  id="role"
                  name="role"
                  required
                  className="auth-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value={UserRole.CLIENT}>Client</option>
                  <option value={UserRole.TAX_AGENT}>Tax Agent</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="auth-btn"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="auth-divider">
          <span className="auth-divider-text">Or continue with</span>
        </div>

        <div className="auth-social">
          <button
            type="button"
            className="auth-social-btn"
            onClick={() => window.location.href = '/auth/google'}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Google
          </button>

          <button
            type="button"
            className="auth-social-btn"
            onClick={() => window.location.href = '/auth/microsoft'}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
            </svg>
            Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 