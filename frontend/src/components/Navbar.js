import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          🔮 八字命理排盘
        </Link>
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">我的八字</Link>
          <Link to="/bazi/new" className="navbar-link">新建排盘</Link>
          <Link to="/community" className="navbar-link">社区</Link>
          <div className="navbar-user">
            <span className="user-name">{user?.username}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

