import React, { useState, useEffect, createContext, useContext } from 'react';
import { FileText, Upload, Download, Shield, User, LogOut, Search, Eye, Trash2, CheckCircle, XCircle, Users, BookOpen, Bell } from 'lucide-react';

// Context for user authentication
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// API service
const api = {
  baseURL: 'http://localhost:8080/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Auth endpoints
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.request('/auth/login', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  register: (username, password, role) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('role', role);
    return api.request('/auth/register', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  logout: () => api.request('/auth/logout', { method: 'POST' }),
  checkAuth: () => api.request('/auth/check'),
  getCurrentUser: () => api.request('/auth/user'),

  // Document endpoints
  uploadDocument: (file, studentId, documentType, description) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);
    formData.append('documentType', documentType);
    formData.append('description', description);
    return api.request('/documents/upload', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  getMyDocuments: () => api.request('/documents/my-documents'),
  downloadDocument: (documentId) => {
    return fetch(`${api.baseURL}/documents/download/${documentId}`, {
      credentials: 'include',
    });
  },
  verifyDocument: (documentId) => api.request(`/documents/verify/${documentId}`),
  getAllStudents: () => api.request('/documents/students'),
  deleteDocument: (documentId) => api.request(`/documents/${documentId}`, { method: 'DELETE' }),
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.checkAuth();
      if (response.loggedIn) {
        setUser({
          id: response.userId,
          username: response.username,
          role: response.role,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      if (response.success) {
        setUser({
          id: response.userId,
          username: response.username,
          role: response.role,
        });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  const register = async (username, password, role) => {
    try {
      const response = await api.register(username, password, role);
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EduChain</h1>
          <p className="text-gray-600 mt-2">Secure Document Management System</p>
        </div>

        {!showRegister ? (
          <LoginForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            loading={loading}
            error={error}
            setShowRegister={setShowRegister}
          />
        ) : (
          <RegisterForm setShowRegister={setShowRegister} />
        )}
      </div>
    </div>
  );
};

const LoginForm = ({ formData, setFormData, handleSubmit, loading, error, setShowRegister }) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
      <input
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your username"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your password"
        required
      />
    </div>

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Signing in...' : 'Sign In'}
    </button>

    <p className="text-center text-gray-600">
      Don't have an account?{' '}
      <button
        type="button"
        onClick={() => setShowRegister(true)}
        className="text-blue-600 hover:text-blue-700 font-medium"
      >
        Register here
      </button>
    </p>
  </form>
);

const RegisterForm = ({ setShowRegister }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await register(formData.username, formData.password, formData.role);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => setShowRegister(false), 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Choose a username"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Choose a password"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setShowRegister(false)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in here
        </button>
      </p>
    </form>
  );
};

// Header Component
const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">EduChain</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsResponse, studentsResponse] = await Promise.all([
        api.getMyDocuments(),
        api.getAllStudents()
      ]);

      if (docsResponse.success) {
        setDocuments(docsResponse.documents);
      }
      if (studentsResponse.success) {
        setStudents(studentsResponse.students);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'documents', label: 'All Documents', icon: FileText },
    { id: 'upload', label: 'Upload Document', icon: Upload },
    { id: 'students', label: 'Students', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="mt-2 text-gray-600">Manage documents and student accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.filter(d => d.blockchainTxHash).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'documents' && <DocumentsList documents={documents} onRefresh={loadData} />}
                {activeTab === 'upload' && <UploadDocument students={students} onUpload={loadData} />}
                {activeTab === 'students' && <StudentsList students={students} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Documents List Component
const DocumentsList = ({ documents, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verifying, setVerifying] = useState({});

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.studentUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await api.downloadDocument(documentId);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleVerify = async (documentId) => {
    setVerifying(prev => ({ ...prev, [documentId]: true }));
    try {
      const response = await api.verifyDocument(documentId);
      alert(response.message);
    } catch (error) {
      alert('Verification failed');
    } finally {
      setVerifying(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await api.deleteDocument(documentId);
        if (response.success) {
          onRefresh();
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Document</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Upload Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{doc.filename}</p>
                    <p className="text-sm text-gray-500">{doc.description}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-900">{doc.studentUsername}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {doc.documentType}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-600">{doc.uploadDate}</td>
                <td className="py-4 px-4">
                  {doc.blockchainTxHash ? (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-700">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-yellow-700">Pending</span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(doc.id, doc.filename)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleVerify(doc.id)}
                      disabled={verifying[doc.id]}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Verify"
                    >
                      {verifying[doc.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Upload Document Component
const UploadDocument = ({ students, onUpload }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    documentType: 'General',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.studentId) return;

    setLoading(true);
    try {
      const response = await api.uploadDocument(
        file,
        formData.studentId,
        formData.documentType,
        formData.description
      );

      if (response.success) {
        alert('Document uploaded successfully!');
        setFile(null);
        setFormData({ studentId: '', documentType: 'General', description: '' });
        onUpload();
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Student
          </label>
          <select
            value={formData.studentId}
            onChange={(e) =>
              setFormData({ ...formData, studentId: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a student...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {/* Document type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={formData.documentType}
            onChange={(e) =>
              setFormData({ ...formData, documentType: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="General">General</option>
            <option value="Transcript">Transcript</option>
            <option value="Certificate">Certificate</option>
            <option value="ID">ID</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter description..."
        />
      </div>

      {/* File Upload */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
      >
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          id="fileUpload"
        />
        <label
          htmlFor="fileUpload"
          className="flex flex-col items-center cursor-pointer"
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">
            {file ? file.name : 'Drag & drop or click to select a file'}
          </span>
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
}

// Students List Component (for Admin)
const StudentsList = ({ students }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
          <th className="text-left py-3 px-4 font-medium text-gray-900">Username</th>
          <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-4 px-4">{student.id}</td>
            <td className="py-4 px-4">{student.name}</td>
            <td className="py-4 px-4">{student.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {students.length === 0 && (
      <div className="text-center py-12 text-gray-500">No students found</div>
    )}
  </div>
);

// Student Dashboard Component
const StudentDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await api.getMyDocuments();
      if (response.success) {
        setDocuments(response.documents);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">My Documents</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DocumentsList documents={documents} onRefresh={loadDocuments} />
        )}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};

// Export wrapped with AuthProvider
const WrappedApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default WrappedApp;
