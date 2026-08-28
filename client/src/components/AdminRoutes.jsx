import { Navigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuth.js';
import Spinner from './Spinner.jsx';

const AdminRoute = ({ children }) => {
    const { user, isLoading } = useAuthState();

    if (isLoading) return <div className="min-h-screen"><Spinner /></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;