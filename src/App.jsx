import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { MemberPage } from './pages/MemberPage.jsx';
import { MembershipPaymentResponsePage } from './pages/MembershipPaymentResponsePage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/member" element={<MemberPage />} />
          <Route
            path="/membership/payment/response"
            element={<MembershipPaymentResponsePage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
