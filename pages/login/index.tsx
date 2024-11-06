import { signIn } from 'next-auth/react';

export default function Login() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      username: event.target.username.value,
      password: event.target.password.value,
    });

    if (result?.error) {
      console.error(result.error);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input name="username" type="text" required className="mt-1 block w-full" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input name="password" type="password" required className="mt-1 block w-full" />
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">로그인</button>
      </form>
    </div>
  );
}