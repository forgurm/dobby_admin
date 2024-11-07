import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getUserStats, getUsers } from '../../lib/users';
import type { User } from '../../lib/db';
import { format } from 'date-fns';

interface MembersPageProps {
  users: User[];
  userStats: {
    referralCount: number;
    nonReferralCount: number;
    rejectedCount: number;
  };
}

export const getServerSideProps: GetServerSideProps<MembersPageProps> = async (context) => {
  console.log("getServerSideProps - context.req:", context.req);
  console.log("getServerSideProps - context.res:", context.res);

  try {
    const [users, userStats] = await Promise.all([
      getUsers(context),
      getUserStats(context)
    ]);

    return {
      props: {
        users: JSON.parse(JSON.stringify(users)),
        userStats
      }
    };
  } catch (error) {
    console.error('Error fetching members data:', error);
    return {
      props: {
        users: [],
        userStats: {
          referralCount: 0,
          nonReferralCount: 0,
          rejectedCount: 0
        }
      }
    };
  }
};

// 필터 상태 인터페이스 추가
interface FilterState {
  level: string;
  hasReferral: string;
  searchTerm: string;
}

// 검색 조건 인터페이스 추가
interface SearchFilters {
  status: string;
  level: string;
  searchTerm: string;
}

export default function Members({ users: initialUsers, userStats }: MembersPageProps) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<{ [key: number]: boolean }>({});
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [newUser, setNewUser] = useState({
    emailid: '',
    name: '',
    phone: '',
    referral_code: '',
    referral_exchange: '',
    lv: '',
    status: '',
    password: '',
    passwordConfirm: ''
  });

  // 비밀번호 유효성 검사 상태
  const [passwordError, setPasswordError] = useState({
    length: false,
    number: false,
    special: false,
    match: false
  });

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password: string, confirmPassword: string) => {
    setPasswordError({
      length: password.length < 8,
      number: !/\d/.test(password),
      special: !/[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password !== confirmPassword
    });

    return (
      password.length >= 8 &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
      password === confirmPassword
    );
  };

  // 필터 상태 추가
  const [filters, setFilters] = useState<FilterState>({
    level: '',
    hasReferral: '',
    searchTerm: ''
  });

  // 검색 필터 상태 추가
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    status: '',
    level: '',
    searchTerm: ''
  });

  // 검색 필터 적용 함수
  const applyFilters = async () => {
    console.log('Client - Applying filters:', searchFilters);
    try {
      const response = await fetch('/api/users/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchFilters),
      });

      console.log('Client - Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      console.log('Client - Received data:', data);
      setUsers(data);
    } catch (error) {
      console.error('Client - Error fetching filtered users:', error);
    }
  };

  // 검색 조건 변경 시 자동 검색
  useEffect(() => {
    console.log('Client - SearchFilters changed:', searchFilters);
    applyFilters();
  }, [searchFilters]);

  // 이메일 유효성 검사
  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  };

  // 이메일 중복 체크
  const checkEmailExists = async (email: string) => {
    const response = await fetch('/api/users/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailid: email })
    });
    const data = await response.json();
    return data.exists;
  };

  // 필터링된 사용자 목록 가져오기
  const fetchFilteredUsers = async () => {
    try {
      const response = await fetch('/api/users/filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch filtered users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching filtered users:', error);
    }
  };

  // 필터 변경 시 사용자 목록 업데이트
  useEffect(() => {
    fetchFilteredUsers();
  }, [filters]);

  const handleEdit = (user: User) => {
    setEditUser(user);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUser),
      });

      // 리스트 업데이트
      const updatedUsers = users.map(u => u.no === editUser.no ? editUser : u);
      setUsers(updatedUsers);
      setEditUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    setEditUser(null);
  };

  const refreshUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailError) {
      return;
    }

    // 비밀번호 유효성 검사
    if (!validatePassword(newUser.password, newUser.passwordConfirm)) {
      return;
    }

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error('Failed to create user');

      // 회원 목록 새로고침
      await refreshUsers();
      
      setIsAdding(false);
      setNewUser({
        emailid: '',
        name: '',
        phone: '',
        referral_code: '',
        referral_exchange: '',
        lv: '',
        status: '',
        password: '',
        passwordConfirm: ''
      });
      setEmailError('');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  if (editUser) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">회원 수정</h1>
        <form onSubmit={handleSave} className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">아이디</label>
            <input
              type="text"
              value={editUser.emailid}
              disabled
              className="mt-1 block w-full border rounded-md shadow-sm p-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              value={editUser.name}
              onChange={e => setEditUser({...editUser, name: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">거래소</label>
            <input
              type="text"
              value={editUser.referral_exchange || ''}
              onChange={e => setEditUser({...editUser, referral_exchange: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">레퍼럴 코드</label>
            <input
              type="text"
              value={editUser.referral_code || ''}
              onChange={e => setEditUser({...editUser, referral_code: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">상태</label>
            <select
              value={editUser.status}
              onChange={e => setEditUser({...editUser, status: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            >
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">레벨</label>
            <select
              value={editUser.lv}
              onChange={e => setEditUser({...editUser, lv: parseInt(e.target.value)})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            >
              <option value="0">일반</option>
              <option value="1">VIP</option>
              <option value="2">VVIP</option>
              <option value="9">관리자</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              저장
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isAdding) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">회원 추가</h1>
        <form onSubmit={handleAdd} className="max-w-2xl space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700">아이디 (이메일)</label>
            <input
              type="email"
              value={newUser.emailid}
              onChange={async (e) => {
                const email = e.target.value;
                setNewUser({...newUser, emailid: email});
                
                // 이메일 형식 검사
                if (!validateEmail(email)) {
                  setEmailError('올바른 이메일 형식이 아닙니다.');
                  return;
                }
                
                // 중복 체크
                const exists = await checkEmailExists(email);
                if (exists) {
                  setEmailError('이미 사용 중인 이메일입니다.');
                  return;
                }
                
                setEmailError('');
              }}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              value={newUser.password}
              onChange={e => {
                const newPassword = e.target.value;
                setNewUser({...newUser, password: newPassword});
                validatePassword(newPassword, newUser.passwordConfirm);
              }}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2`}
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
            <input
              type="password"
              value={newUser.passwordConfirm}
              onChange={e => {
                const newConfirmPassword = e.target.value;
                setNewUser({...newUser, passwordConfirm: newConfirmPassword});
                validatePassword(newUser.password, newConfirmPassword);
              }}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
                newUser.passwordConfirm && passwordError.match
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              required
            />
            {newUser.passwordConfirm && (
              <p className={`mt-1 text-sm ${passwordError.match ? 'text-red-500' : 'text-green-500'}`}>
                {passwordError.match ? '비밀번호가 일치하지 않습니다.' : '비밀번호가 일치합니다.'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">전화번호</label>
            <input
              type="text"
              value={newUser.phone}
              onChange={e => setNewUser({...newUser, phone: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">거래소</label>
            <input
              type="text"
              value={newUser.referral_exchange}
              onChange={e => setNewUser({...newUser, referral_exchange: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">레퍼럴 코드</label>
            <input
              type="text"
              value={newUser.referral_code}
              onChange={e => setNewUser({...newUser, referral_code: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">상태</label>
            <select
              value={newUser.status}
              onChange={e => setNewUser({...newUser, status: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            >
              <option value="">선택하세요</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">레벨</label>
            <select
              value={newUser.lv}
              onChange={e => setNewUser({...newUser, lv: e.target.value})}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            >
              <option value="">선택하세요</option>
              <option value="0">일반</option>
              <option value="1">VIP</option>
              <option value="2">VVIP</option>
              <option value="9">관리자</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={Object.values(passwordError).some(error => error)}
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          회원 추가
        </button>
      </div>
      
      {/* 검색 ��터 섹션 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={searchFilters.status}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border rounded-md p-2"
            >
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
            <select
              value={searchFilters.level}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full border rounded-md p-2"
            >
              <option value="">전체</option>
              <option value="0">일반</option>
              <option value="1">VIP</option>
              <option value="2">VVIP</option>
              <option value="9">관리자</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
            <input
              type="text"
              value={searchFilters.searchTerm}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="이메일, 이름, 전화번호 검색"
              className="w-full border rounded-md p-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSearchFilters({ status: '', level: '', searchTerm: '' })}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아이디</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래소</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">레퍼럴 코드</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">레벨</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.no} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{user.emailid}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.emailid}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.referral_exchange || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.referral_code || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : user.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '대기'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.lv === 9 
                      ? 'bg-red-100 text-red-800' 
                      : user.lv === 2
                        ? 'bg-purple-100 text-purple-800'
                        : user.lv === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                    {user.lv === 9 ? '관리자' : user.lv === 2 ? 'VVIP' : user.lv === 1 ? 'VIP' : '일반'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 