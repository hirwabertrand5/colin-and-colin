import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../../App';
import companyLogo from '../../assets/logo-colin.png';

interface LoginProps {
  onLogin: (user: User) => void;
}

const mockUsers = {
  'partner@lawfirm.com': {
    id: '1',
    email: 'partner@lawfirm.com',
    name: 'Gatete Colin',
    role: 'Managing director' as UserRole,
    password: 'password',
  },
  'associate@lawfirm.com': {
    id: '2',
    email: 'associate@lawfirm.com',
    name: 'Manishimwe Cedrick',
    role: 'associate' as UserRole,
    password: 'password',
  },
  'assistant@lawfirm.com': {
    id: '3',
    email: 'assistant@lawfirm.com',
    name: 'Mushimiyimana Janviere',
<<<<<<< HEAD
    role: 'Executive Assistant' as UserRole,
=======
    role: 'Executive assistant' as UserRole,
>>>>>>> a104e25ea9a78cf81c1a79fb9ce3dad60ebbd50f
    password: 'password',
  },
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = mockUsers[email as keyof typeof mockUsers];
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      onLogin(userWithoutPassword);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* White Card */}
        <div className="bg-white rounded-lg border border-gray-300 p-8 shadow-sm">
          {/* Company Logo and Text inside the card */}
          <div className="text-center mb-10">
            <img
              src={companyLogo}
              alt="Colin & Colin Logo"
              className="mx-auto h-16 object-contain mb-4"
            />
            <p className="text-gray-700 font-medium text-base mt-2">
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/reset-password" className="text-sm text-gray-600 hover:text-gray-900">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
