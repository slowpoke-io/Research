import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import StudyApp from "./pages/Study";
import Admin from "./pages/Admin";
import Consent from "./pages/Consent";
import NoAccess from "./pages/NoAccess";

function RedirectToConsent() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const hasPid = params.get("PROLIFIC_PID") || params.get("prolificId");

  if (!hasPid) return <Navigate to="/no-access" replace />;
  return <Navigate to={`/consent${search}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/study/*" element={<StudyApp />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/no-access" element={<NoAccess />} />
        <Route path="/*" element={<RedirectToConsent />} />
      </Routes>
    </BrowserRouter>
  );
}
