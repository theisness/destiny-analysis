import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { baziAPI } from '../../api/api';
import './Dashboard.css';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await baziAPI.getAll();
      setRecords(response.data.data);
      setError('');
    } catch (err) {
      setError('加载失败，请重试');
      console.error('获取记录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      await baziAPI.delete(id);
      setRecords(records.filter(record => record._id !== id));
    } catch (err) {
      alert('删除失败，请重试');
      console.error('删除记录失败:', err);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/bazi/${id}`);
  };

  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return '未知';
    return `${dateObj.year}年${dateObj.month}月${dateObj.day}日 ${dateObj.hour || 0}时${dateObj.minute || 0}分`;
  };

  return (
    <div className="dashboard">
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>我的八字记录</h1>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/bazi/new')}
          >
            + 新建排盘
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchRecords}>
              重试
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-container">
            <p>还没有任何八字记录</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/bazi/new')}
            >
              创建第一个排盘
            </button>
          </div>
        ) : (
          <div className="records-grid">
            {records.map((record) => (
              <div key={record._id} className="record-card">
                <div className="record-header">
                  <h3>{record.name}</h3>
                  <span className="gender-badge">{record.gender}</span>
                </div>
                <div className="record-info">
                  <p className="record-date">
                    🗓️ {formatDate(record.gregorianDate)}
                  </p>
                  <div className="record-bazi">
                    <span className="pillar">
                      {record.baziResult.yearPillar.gan}
                      {record.baziResult.yearPillar.zhi}
                    </span>
                    <span className="pillar">
                      {record.baziResult.monthPillar.gan}
                      {record.baziResult.monthPillar.zhi}
                    </span>
                    <span className="pillar">
                      {record.baziResult.dayPillar.gan}
                      {record.baziResult.dayPillar.zhi}
                    </span>
                    <span className="pillar">
                      {record.baziResult.hourPillar.gan}
                      {record.baziResult.hourPillar.zhi}
                    </span>
                  </div>
                  {record.addToCommunity && (
                    <span className="community-badge">📢 已分享到社区</span>
                  )}
                </div>
                <div className="record-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleViewDetail(record._id)}
                  >
                    查看详情
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(record._id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

