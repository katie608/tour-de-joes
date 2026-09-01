import { Routes, Route } from "react-router-dom";
import { ProtectedLayout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import ChallengesPage from "./pages/ChallengesPage";
import ChallengeDetailPage from "./pages/ChallengeDetailPage";
import StoresPage from "./pages/StoresPage";
import StoreDetailPage from "./pages/StoreDetailPage";
import FeedPage from "./pages/FeedPage";
import AddStorePage from "./pages/AddStorePage";
import ScoresPage from "./pages/ScoresPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<ChallengesPage />} />
        <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:id" element={<StoreDetailPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/add-store" element={<AddStorePage />} />
        <Route path="/scores" element={<ScoresPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
