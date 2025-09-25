import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
// import Animes from "./pages/Animes";
// import WatchList from "./pages/WatchList";
// import Club from "./pages/Club";
// import AboutUs from "./pages/AboutUs";
// import AnimeDetails from "./pages/AnimeDetails";
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/animes" element={<Animes />} />
          <Route path="/animes/:id" element={<AnimeDetails />} />
          <Route path="/watchlist" element={<WatchList />} />
          <Route path="/clubs" element={<Club />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
