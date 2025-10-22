import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { BASE_URL, DEFAULT_AVATAR } from '../config';
import SecureImage from './SecureImage';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const avatarSrc = user?.avatarUrl ? `${BASE_URL}${user.avatarUrl}` : DEFAULT_AVATAR;
  const isMobile = window.innerWidth <= 576;
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-head">
          <Link to="/dashboard" className="navbar-brand">
             ☯ 八字命理排盘系统
          </Link>
          {isMobile && (
            <div className="navbar-user" ref={menuRef}>
              <SecureImage className="navbar-avatar" src={avatarSrc} alt="avatar" onClick={() => setShowMenu(v => !v)} />
              <span className="user-name" onClick={() => setShowMenu(v => !v)}>{user?.nickname || user?.username}</span>
              {showMenu && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowMenu(false)}>个人资料</Link>
                  {user?.admin === 1 && (
                    <>
                      <Link to="/admin/users" className="dropdown-item" onClick={() => setShowMenu(false)}>成员管理</Link>
                      <Link to="/admin/labels" className="dropdown-item" onClick={() => setShowMenu(false)}>标签管理</Link>
                    </>
                  )}
                  <button className="dropdown-item" onClick={handleLogout}>退出登录</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="navbar-menu">
          {/* 菜单项使用 NavLink 以支持当前页面高亮 */}
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>我的八字</NavLink>
          <NavLink to="/bazi/new" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>新建排盘</NavLink>
          <NavLink to="/community" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>社区</NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>个人资料</NavLink>
          {!isMobile && (
            <div className="navbar-user" ref={menuRef}>
              <SecureImage className="navbar-avatar" src={avatarSrc} alt="avatar" onClick={() => setShowMenu(v => !v)} />
              <span className="user-name" onClick={() => setShowMenu(v => !v)}>{user?.nickname || user?.username}</span>
              {showMenu && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowMenu(false)}>个人资料</Link>
                  {user?.admin === 1 && (
                    <>
                      <Link to="/admin/users" className="dropdown-item" onClick={() => setShowMenu(false)}>成员管理</Link>
                      <Link to="/admin/labels" className="dropdown-item" onClick={() => setShowMenu(false)}>八字标签管理</Link>
                    </>
                  )}
                  <button className="dropdown-item" onClick={handleLogout}>退出登录</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

