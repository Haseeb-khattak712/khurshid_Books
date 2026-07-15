import { Navigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuth.js';

const AdminRoute = ({ children }) => {
    const { user, token } = useAuthState();

    if (!token) return <Navigate to="/login" replace />;
    if (user && user.role !== 'admin') return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;