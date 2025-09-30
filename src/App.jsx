// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Animes from "./pages/Animes";
import AnimeDetails from "./pages/AnimeDetails";
import WatchList from "./pages/WatchList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./components/RequireAuth";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails";
import AboutUs from "./pages/AboutUs";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Header />
      <main className="min-h-screen bg-slate-300 dark:bg-slate-600">
        <Routes>
          {/* public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/animes" element={<Animes />} />
          <Route path="/animes/:id" element={<AnimeDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetails />} />

          {/* protected routes */}
          <Route
            path="/watchlist"
            element={
              <RequireAuth>
                <WatchList />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
