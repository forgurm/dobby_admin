import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { signIn } from 'next-auth/react';

export default function Login() {
  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const id = (form.elements.namedItem('id') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    console.log('Attempting login with ID:', id);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        id,
        password,
      });

      if (result?.ok) {
        console.log('Login successful');
        router.push('/dashboard');
      } else {
        console.log('Invalid credentials');
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="id"
            placeholder="ID"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}