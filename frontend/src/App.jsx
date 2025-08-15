import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./context/theme-context";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import ResponderDashboard from "./pages/ResponderDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { getUserRole, isAuthenticated } from "./utils/auth";
import { ToastContainer, toast } from "react-toastify";

import DonationPage from "./pages/DonationPage";

// Admin subpages
import HomePage from "./pages/admin/HomePage";
import AddAlertPage from "./pages/admin/AddAlertPage";
import ResponderDetailsPage from "./pages/admin/ResponderDetailsPage";
import UserDetailsPage from "./pages/admin/UserDetailsPage";

// Responder subpages
import ResponderHomePage from "./pages/responder/ResponderHomePage";
import ResponderAlertsPage from "./pages/responder/ResponderAlertsPage";
import DonationsPage from "./pages/responder/ResponderDonationsPage";
import TasksPage from "./pages/responder/ResponderTasksPage";

function ProtectedRoute({ children, allowedRoles }) {
  const token = isAuthenticated();
  const role = getUserRole();

  if (!token) return <Navigate to="/" />;
  if (!allowedRoles.includes(role)) return <Navigate to="/" />;
  return children;
}

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavAndFooter =
    location.pathname === "/" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-background">
      {!hideNavAndFooter && <Navbar />}
      <main
        className={
          hideNavAndFooter ? "min-h-screen" : "min-h-[calc(100vh-4rem)]"
        }
      >
        {children}
      </main>
      {!hideNavAndFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
       <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route path="home" element={<HomePage />} />
              <Route path="add-alert" element={<AddAlertPage />} />
              <Route path="responders" element={<ResponderDetailsPage />} />
              <Route path="users" element={<UserDetailsPage />} />
              <Route index element={<Navigate to="home" />} />
            </Route>

            {/* Responder Routes */}
            <Route
              path="/responder"
              element={
                <ProtectedRoute allowedRoles={["responder"]}>
                  <ResponderDashboard />
                </ProtectedRoute>
              }
            >
              <Route path="home" element={<ResponderHomePage />} />
              <Route path="alerts" element={<ResponderAlertsPage />} />
              <Route path="donations" element={<DonationsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route index element={<Navigate to="home" />} />
            </Route>

            {/* User Routes */}
            <Route
              path="/user"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/donation" element={<DonationPage />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
