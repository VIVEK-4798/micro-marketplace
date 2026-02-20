import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';

const App = () => {
  const { token } = useContext(AuthContext);

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={token ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/products/:id"
          element={token ? <ProductDetail /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
};

export default App;
