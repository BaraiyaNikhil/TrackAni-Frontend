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
// import Club from "./pages/Club";
import AboutUs from "./pages/AboutUs";
// import Dashboard from "./pages/Dashboard";

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

          {/* protected routes */}
          <Route
            path="/watchlist"
            element={
              <RequireAuth>
                <WatchList />
              </RequireAuth>
            }
          />

          {/* optional future routes */}
          {/* <Route path="/clubs" element={<Club />} /> */}
          {/* <Route path="/dashboard" element={<Dashboard /> */}
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
