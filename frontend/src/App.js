import React, { useState, useEffect, createContext, useContext } from 'react';
import { FileText, Upload, Download, Shield, User, LogOut, Search, Trash2, CheckCircle, XCircle, Users, BookOpen } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = '6LfOAzwsAAAAAN_0F7toXRAf9J1kK9PyBqXD5n_b';

// Inline styles
const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f3f4f6',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
    color: 'white',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 0',
    marginBottom: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: '600',
    color: '#111827',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #f3f4f6',
  },
};

// Context for user authentication
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// API service
const api = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
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

  login: (username, password, recaptchaToken) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  if (recaptchaToken) {
    formData.append('recaptchaToken', recaptchaToken);
  }
  return api. request('/auth/login', { method: 'POST', headers: {}, body: formData });
},

  register: (username, password, role, recaptchaToken) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('role', role);
  if (recaptchaToken) {
    formData.append('recaptchaToken', recaptchaToken);
  }
  return api.request('/auth/register', { method: 'POST', headers: {}, body: formData });
},

  logout: () => api.request('/auth/logout', { method: 'POST' }),
  checkAuth: () => api.request('/auth/check'),
  uploadDocument: (file, studentId, documentType, description) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);
    formData.append('documentType', documentType);
    formData.append('description', description);
    return api.request('/documents/upload', { method: 'POST', headers: {}, body: formData });
  },
  getMyDocuments: () => api.request('/documents/my-documents'),
  downloadDocument: (documentId) => fetch(`${api.baseURL}/documents/download/${documentId}`, { credentials: 'include' }),
  verifyDocument: (documentId) => api.request(`/documents/verify/${documentId}`),
  getAllStudents: () => api.request('/documents/students'),
  deleteDocument: (documentId) => api.request(`/documents/${documentId}`, { method: 'DELETE' }),
};

// Auth Provider
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
        setUser({ id: response.userId, username: response.username, role: response.role });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, recaptchaToken) => {
  try {
    const response = await api. login(username, password, recaptchaToken);
    if (response.success) {
      setUser({ id: response.userId, username: response.username, role: response.role });
      return { success: true };
    }
    return { success: false, message: response.message };
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

  const register = async (username, password, role, recaptchaToken) => {
  try {
    const response = await api.register(username, password, role, recaptchaToken);
    return response.success ? { success: true, message:  response.message } : { success: false, message: response.message };
  } catch (error) {
    return { success: false, message: 'Registration failed. Please try again.' };
  }
};

  return <AuthContext.Provider value={{ user, login, logout, register, loading }}>{children}</AuthContext.Provider>;
};

// Login Page
const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e, recaptchaToken) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  const result = await login(formData.username, formData.password, recaptchaToken);
  if (!result.success) setError(result.message);
  setLoading(false);
};

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ ...styles.card, maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: '#dbeafe', borderRadius: '50%', marginBottom: '1rem' }}>
            <BookOpen size={32} color="#2563eb" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0.5rem 0' }}>EduChain</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Secure Document Management System</p>
        </div>

        {!showRegister ? (
          <LoginForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} loading={loading} error={error} setShowRegister={setShowRegister} />
        ) : (
          <RegisterForm setShowRegister={setShowRegister} />
        )}
      </div>
    </div>
  );
};
const LoginForm = ({ formData, setFormData, handleSubmit, loading, error, setShowRegister }) => {
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      // Need to handle error - for now just return
      return;
    }
    await handleSubmit(e, recaptchaToken);
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Username</label>
        <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target. value })} style={styles.input} placeholder="Enter your username" required />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Password</label>
        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={styles.input} placeholder="Enter your password" required />
      </div>

      {/* reCAPTCHA Widget */}
      <div style={{ marginBottom: '1rem', display:  'flex', justifyContent:  'center' }}>
        <ReCAPTCHA
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={(token) => setRecaptchaToken(token)}
          onExpired={() => setRecaptchaToken(null)}
        />
      </div>

      {error && <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}

      <button 
        type="submit" 
        disabled={loading || !recaptchaToken} 
        style={{ 
          ...styles.button, 
          ...styles.buttonPrimary, 
          width: '100%', 
          marginBottom:  '1rem',
          backgroundColor:  loading || !recaptchaToken ? '#9ca3af' :  '#2563eb',
          cursor: loading || !recaptchaToken ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ?  'Signing in...' :  'Sign In'}
      </button>

      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        Don't have an account?{' '}
        <button type="button" onClick={() => setShowRegister(true)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>
          Register here
        </button>
      </p>
    </form>
  );
};
const RegisterForm = ({ setShowRegister }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ username: '', password:  '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check reCAPTCHA
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const result = await register(formData.username, formData.password, formData.role, recaptchaToken);
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => setShowRegister(false), 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
    setRecaptchaToken(null); // Reset reCAPTCHA after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize:  '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Username</label>
        <input 
          type="text" 
          value={formData.username} 
          onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
          style={styles. input} 
          placeholder="Choose a username" 
          required 
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom:  '0.5rem' }}>Password</label>
        <input 
          type="password" 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          style={styles.input} 
          placeholder="Choose a password" 
          required 
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Role</label>
        <select 
          value={formData.role} 
          onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
          style={styles.input}
        >
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* reCAPTCHA Widget */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <ReCAPTCHA
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={(token) => setRecaptchaToken(token)}
          onExpired={() => setRecaptchaToken(null)}
        />
      </div>

      {error && (
        <div style={{ backgroundColor:  '#fee2e2', border:  '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize:  '14px' }}>
          {success}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading || !recaptchaToken} 
        style={{ 
          ...styles.button, 
          backgroundColor: loading || !recaptchaToken ? '#9ca3af' : '#059669', 
          color: 'white', 
          width: '100%', 
          marginBottom: '1rem',
          cursor: loading || !recaptchaToken ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ?  'Creating account...' : 'Create Account'}
      </button>

      <p style={{ textAlign: 'center', color:  '#6b7280', fontSize:  '14px' }}>
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={() => setShowRegister(false)} 
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
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
    <div style={styles.header}>
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BookOpen size={32} color="#2563eb" style={{ marginRight: '12px' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>EduChain</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#6b7280" />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{user?.username}</span>
            <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: '500', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '12px' }}>{user?.role}</span>
          </div>
          <button onClick={logout} style={{ ...styles.button, padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
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
      const [docsResponse, studentsResponse] = await Promise.all([api.getMyDocuments(), api.getAllStudents()]);
      if (docsResponse.success) setDocuments(docsResponse.documents);
      if (studentsResponse.success) setStudents(studentsResponse.students);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <Header />
      <div style={styles.container}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Admin Dashboard</h2>
          <p style={{ color: '#6b7280' }}>Manage documents and student accounts</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                <FileText size={24} color="#2563eb" />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Documents</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{documents.length}</p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                <Users size={24} color="#059669" />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Students</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{students.length}</p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#e9d5ff', borderRadius: '8px' }}>
                <Shield size={24} color="#7c3aed" />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Verified Documents</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{documents.filter((d) => d.blockchainTxHash).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '2rem', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
            {[
              { id: 'documents', label: 'All Documents', icon: FileText },
              { id: 'upload', label: 'Upload Document', icon: Upload },
              { id: 'students', label: 'Students', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '1rem 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                    color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginBottom: '-2px',
                  }}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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
  );
};

// Documents List
const DocumentsList = ({ documents, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verifying, setVerifying] = useState({});

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) || doc.studentUsername.toLowerCase().includes(searchTerm.toLowerCase()) || doc.documentType.toLowerCase().includes(searchTerm.toLowerCase())
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
    setVerifying((prev) => ({ ...prev, [documentId]: true }));
    try {
      const response = await api.verifyDocument(documentId);
      alert(response.message);
    } catch (error) {
      alert('Verification failed');
    } finally {
      setVerifying((prev) => ({ ...prev, [documentId]: false }));
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
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.input, paddingLeft: '40px' }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Document</th>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Upload Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} style={{ ':hover': { backgroundColor: '#f9fafb' } }}>
                <td style={styles.td}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>{doc.filename}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{doc.description}</p>
                  </div>
                </td>
                <td style={styles.td}>{doc.studentUsername}</td>
                <td style={styles.td}>
                  <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: '500', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '12px' }}>{doc.documentType}</span>
                </td>
                <td style={styles.td}>{doc.uploadDate}</td>
                <td style={styles.td}>
                  {doc.blockchainTxHash ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={16} color="#059669" />
                      <span style={{ fontSize: '13px', color: '#059669' }}>Verified</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <XCircle size={16} color="#d97706" />
                      <span style={{ fontSize: '13px', color: '#d97706' }}>Pending</span>
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleDownload(doc.id, doc.filename)} style={{ ...styles.button, padding: '8px', backgroundColor: '#f3f4f6', color: '#374151' }} title="Download">
                      <Download size={16} />
                    </button>
                    <button onClick={() => handleVerify(doc.id)} disabled={verifying[doc.id]} style={{ ...styles.button, padding: '8px', backgroundColor: '#f3f4f6', color: '#374151' }} title="Verify">
                      {verifying[doc.id] ? <div style={{ width: '16px', height: '16px', border: '2px solid #e5e7eb', borderTop: '2px solid #059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Shield size={16} />}
                    </button>
                    <button onClick={() => handleDelete(doc.id)} style={{ ...styles.button, padding: '8px', backgroundColor: '#fee2e2', color: '#991b1b' }} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDocuments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#6b7280' }}>No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Upload Document
const UploadDocument = ({ students, onUpload }) => {
  const [formData, setFormData] = useState({ studentId: '', documentType: 'General', description: '' });
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
      formData. studentId,
      formData. documentType,
      formData. description
    );

    if (response.success) {
      // Check if verification was performed
      if (response.verified !== undefined) {
        const confidencePercent = Math.round((response.confidence || 0) * 100);
        alert(`✅ Document verified (${confidencePercent}% confidence) and uploaded successfully!`);
      } else {
        alert('✅ Document uploaded successfully!');
      }
      
      setFile(null);
      setFormData({ studentId: '', documentType:  'General', description: '' });
      onUpload();
    } else {
      // Handle verification failure
      if (response.verified === false) {
        const confidencePercent = Math.round((response.confidence || 0) * 100);
        let errorMsg = `❌ AI Verification Failed\n\n${response.message}`;
        
        if (response.detectedType) {
          errorMsg += `\n\nDetected Type: ${response.detectedType}`;
          errorMsg += `\nConfidence: ${confidencePercent}%`;
        }
        
        errorMsg += `\n\n💡 Tip: Make sure you selected the correct document type and the image is clear. `;
        
        alert(errorMsg);
      } else {
        alert(response.message || 'Upload failed');
      }
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Upload failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
  

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Select Student</label>
          <select value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} style={styles.input} required>
            <option value="">Choose a student...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Document Type</label>
          <select value={formData.documentType} onChange={(e) => setFormData({ ...formData, documentType: e.target.value })} style={styles.input}>
            <option value="General">General</option>
            <option value="Certificate">Certificate</option>
            <option value="Transcript">Transcript</option>
            <option value="Degree">Degree</option>
            <option value="Diploma">Diploma</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Description</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} style={styles.input} placeholder="Optional description..." />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Document File</label>
        <div
          style={{
            border: dragActive ? '2px dashed #2563eb' : file ? '2px dashed #059669' : '2px dashed #d1d5db',
            backgroundColor: dragActive ? '#eff6ff' : file ? '#d1fae5' : '#f9fafb',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} id="file-upload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            {file ? (
              <div>
                <CheckCircle size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#065f46', fontWeight: '500', marginBottom: '0.5rem' }}>{file.name}</p>
                <p style={{ fontSize: '13px', color: '#059669' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <Upload size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#2563eb', fontWeight: '500' }}>Click to upload</span> or drag and drop
                </p>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>PDF, DOC, DOCX, JPG, PNG up to 50MB</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <button 
  type="submit" 
  disabled={loading || !file || !formData.studentId} 
  style={{ ... styles.button, ... styles.buttonPrimary, width: '100%' }}
>
  {loading ? '🤖 Verifying & Uploading...' : 'Upload Document'}
</button>
    </form>
  );
};

// Students List
const StudentsList = ({ students }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      {students.map((student) => (
        <div key={student.id} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="#2563eb" />
            </div>
            <div style={{ marginLeft: '12px' }}>
              <p style={{ fontWeight: '500', color: '#111827', marginBottom: '2px' }}>{student.username}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>ID: {student.id}</p>
            </div>
          </div>

        </div>
      ))}

      {students.length === 0 && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
          <Users size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280' }}>No students found</p>
        </div>
      )}
    </div>
  );
};

// Student Dashboard
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
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const response = await api.verifyDocument(documentId);
      alert(response.message);
    } catch (error) {
      alert('Verification failed');
    }
  };

  return (
    <div style={styles.body}>
      <Header />
      <div style={styles.container}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>My Documents</h2>
          <p style={{ color: '#6b7280' }}>Access and verify your academic documents</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                <FileText size={24} color="#2563eb" />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Documents</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{documents.length}</p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                <Shield size={24} color="#059669" />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Verified Documents</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{documents.filter((d) => d.blockchainTxHash).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827' }}>Your Documents</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FileText size={64} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>No documents yet</h3>
              <p style={{ color: '#6b7280' }}>Your documents will appear here once uploaded by admin.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onDownload={handleDownload} onVerify={handleVerify} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Document Card
const DocumentCard = ({ document, onDownload, onVerify }) => {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    await onVerify(document.id);
    setVerifying(false);
  };

  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
    return '📎';
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>{getFileIcon(document.filename)}</span>
          <div>
            <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '4px', fontSize: '14px' }}>{document.filename}</h4>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>{document.documentType}</p>
          </div>
        </div>

        {document.blockchainTxHash ? <CheckCircle size={20} color="#059669" /> : <XCircle size={20} color="#d97706" />}
      </div>

      {document.description && <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem' }}>{document.description}</p>}

      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '1rem' }}>
        <p>Uploaded: {document.uploadDate}</p>
        <p>Size: {(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onDownload(document.id, document.filename)}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            flex: 1,
            padding: '0.5rem 1rem',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Download size={16} />
          Download
        </button>

        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{
            ...styles.button,
            ...styles.buttonSecondary,
            flex: 1,
            padding: '0.5rem 1rem',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {verifying ? <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <><Shield size={16} />Verify</>}
        </button>
      </div>

      {document.blockchainTxHash && (
        <div style={{ marginTop: '1rem', padding: '8px 12px', backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '6px' }}>
          <p style={{ fontSize: '12px', fontWeight: '500', color: '#065f46', marginBottom: '2px' }}>Blockchain Verified</p>
          <p style={{ fontSize: '11px', color: '#059669', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>TX: {document.blockchainTxHash}</p>
        </div>
      )}
    </div>
  );
};

// Main App
const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return user.role === 'ADMIN' ? <AdminDashboard /> : <StudentDashboard />;
};

// Add keyframes for spin animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

// Root Component
export default function EduChainApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
