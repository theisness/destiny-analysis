import React, { useState } from 'react';
import './Almanac.css';
import AlmanacCalendar from '../../components/AlmanacCalendar';
import HuangliCard from '../../components/HuangliCard';
import Navbar from '../../components/Navbar';

export default function AlmanacPage() {
  const [date, setDate] = useState(new Date());
  return (
    <div className="almanac-page">
      <Navbar />
      <div className="almanac-container">
        <div className="left">
          <AlmanacCalendar date={date} onDateChange={setDate} />
        </div>
        <div className="right">
          <HuangliCard date={date} />
        </div>
      </div>
    </div>
  );
}