import React from 'react';
import '../styles/Dashboard.css';

interface DashboardStats {
  totalMembers: number;
  investorMembers: number;
  genderStats: {
    male: number;
    female: number;
  };
  managerStats: {
    total: number;
  };
}

export const Dashboard: React.FC = () => {
  const stats: DashboardStats = {
    totalMembers: 13,
    investorMembers: 0,
    genderStats: {
      male: 10,
      female: 3
    },
    managerStats: {
      total: 13
    }
  };

  const malePercentage = (stats.genderStats.male / stats.totalMembers * 100).toFixed(2);
  const femalePercentage = (stats.genderStats.female / stats.totalMembers * 100).toFixed(2);

  return (
    <div className="dashboard">
      {/* 會員統計區 */}
      <section className="member-stats">
        <div className="stat-card total-members">
          <h3 className="stat-title">會員總數</h3>
          <div className="stat-value">{stats.totalMembers}</div>
        </div>
        <div className="stat-card investor-members">
          <h3 className="stat-title">投資會員數</h3>
          <div className="stat-value">{stats.investorMembers}</div>
        </div>
      </section>
      
      {/* 會員分類圖表 */}
      <section className="member-chart">
        <div className="charts-grid">
          {/* 性別比例圖表 */}
          <div className="chart-card">
            <h3 className="chart-title">性別比例</h3>
            <div className="chart-container">
              <div 
                className="pie-chart gender-chart"
                style={{
                  background: `conic-gradient(
                    var(--primary-color) 0% ${malePercentage}%,
                    #2EDEBD ${malePercentage}% 100%
                  )`
                }}
              >
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-color male"></span>
                    <span className="legend-label">
                      男: {stats.genderStats.male} ({malePercentage}%)
                    </span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color female"></span>
                    <span className="legend-label">
                      女: {stats.genderStats.female} ({femalePercentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 會員數量柱狀圖 */}
          <div className="chart-card">
            <h3 className="chart-title">會員數量 by 負責人</h3>
            <div className="chart-container">
              <div className="bar-chart">
                <div className="bar" style={{ height: '100%' }}>
                  <div className="bar-label">{stats.managerStats.total}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}; 