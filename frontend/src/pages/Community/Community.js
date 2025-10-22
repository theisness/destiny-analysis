import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { baziAPI } from '../../api/api';
import pinyin from 'pinyin';
import './Community.css';
import FilterBar from '../../components/CommunityFilters/FilterBar';
import AdvancedFiltersModal from '../../components/CommunityFilters/AdvancedFiltersModal';

const Community = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [share, setShare] = useState('');
  const [publisherId, setPublisherId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    name: '',
    gender: '',
    calendarType: 'gregorian',
    birthYearFrom: '',
    birthYearTo: '',
    birthMonth: '',
    birthDay: '',
    yearGan: '', yearZhi: '',
    monthGan: '', monthZhi: '',
    dayGan: '', dayZhi: '',
    hourGan: '', hourZhi: ''
  });
  const navigate = useNavigate();
  const listRef = useRef(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    fetchCommunityRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records]);

  const fetchCommunityRecords = async () => {
    try {
      setLoading(true);
      const params = buildParams();
      const response = await baziAPI.getCommunity(params);
      const data = response.data.data;
      // 为每条记录添加拼音首字母
      const recordsWithPinyin = data.map(record => ({
        ...record,
        pinyinInitial: getPinyinInitial(record.name)
      }));
      // 按拼音首字母排序
      recordsWithPinyin.sort((a, b) => a.pinyinInitial.localeCompare(b.pinyinInitial));
      setRecords(recordsWithPinyin);
      setError('');
    } catch (err) {
      setError('加载失败，请重试');
      console.error('获取社区记录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildParams = () => {
    const params = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedLabels.length > 0) params.labels = selectedLabels.join(',');
    if (share) params.share = share;
    if (publisherId) params.publisherId = publisherId;
    if (advFilters.name) params.name = advFilters.name.trim();
    if (advFilters.gender) params.gender = advFilters.gender;
    if (advFilters.calendarType) params.calendarType = advFilters.calendarType;
    if (advFilters.birthYearFrom) params.birthYearFrom = advFilters.birthYearFrom;
    if (advFilters.birthYearTo) params.birthYearTo = advFilters.birthYearTo;
    if (advFilters.birthMonth) params.birthMonth = advFilters.birthMonth;
    if (advFilters.birthDay) params.birthDay = advFilters.birthDay;
    ['yearGan','yearZhi','monthGan','monthZhi','dayGan','dayZhi','hourGan','hourZhi'].forEach(k => {
      const v = advFilters[k];
      if (v && String(v).trim()) params[k] = String(v).trim();
    });
    return params;
  };

  const applyFilters = () => {
    fetchCommunityRecords();
  };

  const clearFilters = () => {
    setSelectedLabels([]);
    setShare('');
    setPublisherId('');
    setAdvFilters({
      name: '',
      gender: '',
      calendarType: 'gregorian',
      birthYearFrom: '',
      birthYearTo: '',
      birthMonth: '',
      birthDay: '',
      yearGan: '', yearZhi: '',
      monthGan: '', monthZhi: '',
      dayGan: '', dayZhi: '',
      hourGan: '', hourZhi: ''
    });
    setSearchTerm('');
    fetchCommunityRecords();
  };
  const getPinyinInitial = (name) => {
    if (!name) return '#';
    try {
      const firstChar = name[0];
      // 特殊处理：将“行”固定映射为 X
      if (firstChar === '行') return 'X';
      const py = pinyin(firstChar, {
        style: pinyin.STYLE_FIRST_LETTER
      });
      const initial = py[0][0].toUpperCase();
      return /[A-Z]/.test(initial) ? initial : '#';
    } catch {
      return '#';
    }
  };

  const filterRecords = () => {
    if (!searchTerm) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  const scrollToLetter = (letter) => {
    setActiveIndex(letter);
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/bazi/${id}`);
  };

  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return '未知';
    return `${dateObj.year}年${dateObj.month}月${dateObj.day}日`;
  };

  // 按首字母分组
  const groupedRecords = {};
  filteredRecords.forEach(record => {
    const initial = record.pinyinInitial;
    if (!groupedRecords[initial]) {
      groupedRecords[initial] = [];
    }
    groupedRecords[initial].push(record);
  });

  const sortedInitials = Object.keys(groupedRecords).sort();

  return (
    <div className="community">
      <Navbar />
      <div className="container">
        <div className="community-header">
          <h1>社区八字</h1>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>
          <FilterBar
            labels={selectedLabels}
            onChangeLabels={setSelectedLabels}
            share={share}
            onChangeShare={setShare}
            publisherId={publisherId}
            onChangePublisherId={setPublisherId}
            onOpenAdvanced={() => setShowAdvanced(true)}
            onApply={applyFilters}
            onClear={clearFilters}
          />
        </div>

        <div className="community-content">
          <div className="community-list" ref={listRef}>
            {loading ? (
              <div className="loading-container">加载中...</div>
            ) : error ? (
              <div className="error-container">
                <p>{error}</p>
                <button className="btn btn-secondary" onClick={fetchCommunityRecords}>
                  重试
                </button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="empty-container">
                <p>{searchTerm ? '没有找到匹配的记录' : '社区还没有任何八字记录'}</p>
              </div>
            ) : (
              sortedInitials.map(initial => (
                <div key={initial} id={`section-${initial}`} className="letter-section">
                  <div className="letter-header">{initial}</div>
                  <div className="records-list">
                    {groupedRecords[initial].map(record => (
                      <div 
                        key={record._id} 
                        className="community-record-card"
                        onClick={() => handleViewDetail(record._id)}
                      >
                        <div className="record-main">
                          <h3>{record.name}</h3>
                          <span className="gender-badge">{record.gender}</span>
                        </div>
                        <div className="record-date">
                          🗓️ {formatDate(record.gregorianDate)}
                        </div>
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
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 字母索引侧边栏 */}
          <div className="alphabet-sidebar">
            {alphabet.map(letter => {
              const hasRecords = groupedRecords[letter] && groupedRecords[letter].length > 0;
              return (
                <button
                  key={letter}
                  className={`alphabet-btn ${activeIndex === letter ? 'active' : ''} ${!hasRecords ? 'disabled' : ''}`}
                  onClick={() => hasRecords && scrollToLetter(letter)}
                  disabled={!hasRecords}
                >
                  {letter}
                </button>
              );
            })}
            {groupedRecords['#'] && (
              <button
                className={`alphabet-btn ${activeIndex === '#' ? 'active' : ''}`}
                onClick={() => scrollToLetter('#')}
              >
                #
              </button>
            )}
          </div>
        </div>
      </div>
      {showAdvanced && (
        <AdvancedFiltersModal
          show={showAdvanced}
          value={advFilters}
          onChange={setAdvFilters}
          onApply={() => { setShowAdvanced(false); applyFilters(); }}
          onClose={() => setShowAdvanced(false)}
        />
      )}
    </div>
  );
};

export default Community;

