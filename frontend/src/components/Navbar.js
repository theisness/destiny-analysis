import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isMobile = window.innerWidth <= 576;
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-head">
          <Link to="/dashboard" className="navbar-brand">
             ☯ 八字命理排盘系统
          </Link>
          {isMobile && (
            <div className="navbar-user">
              <span className="user-name">{user?.username}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                退出
              </button>
            </div>
          )}
        </div>
        <div className="navbar-menu">
          {/* 菜单项使用 NavLink 以支持当前页面高亮 */}
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>我的八字</NavLink>
          <NavLink to="/bazi/new" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>新建排盘</NavLink>
          <NavLink to="/community" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>社区</NavLink>
          {!isMobile && (
            <div className="navbar-user">
              <span className="user-name">{user?.username}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                退出
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

