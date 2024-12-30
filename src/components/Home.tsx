import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

export const Home: React.FC = () => {
  return (
    <div className="home">
      <header className="home-header">
        <nav className="home-nav">
          <div className="logo">CRM 系統</div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">登入</Link>
            <a href="#features" className="nav-link">功能</a>
            <a href="#pricing" className="nav-link">價格</a>
            <a href="#contact" className="nav-link">聯繫我們</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>現代化的 B2B CRM 解決方案</h1>
          <p>高效管理客戶關係，提升業務效率</p>
          <div className="cta-buttons">
            <Link to="/login" className="cta-primary">立即開始</Link>
            <a href="#demo" className="cta-secondary">觀看演示</a>
          </div>
        </section>

        <section id="features" className="features">
          <h2>主要功能</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>多維表格</h3>
              <p>靈活的數據管理方式</p>
            </div>
            <div className="feature-card">
              <h3>即時協作</h3>
              <p>團隊實時協作</p>
            </div>
            <div className="feature-card">
              <h3>數據分析</h3>
              <p>深入的業務洞察</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="pricing">
          <h2>價格方案</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>基礎版</h3>
              <p className="price">NT$ 500/月</p>
              <ul>
                <li>基本功能</li>
                <li>5位用戶</li>
                <li>基礎支持</li>
              </ul>
              <Link to="/login" className="pricing-cta">開始使用</Link>
            </div>
            <div className="pricing-card featured">
              <h3>專業版</h3>
              <p className="price">NT$ 1,000/月</p>
              <ul>
                <li>全部功能</li>
                <li>無限用戶</li>
                <li>24/7 支持</li>
              </ul>
              <Link to="/login" className="pricing-cta">開始使用</Link>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <h2>聯繫我們</h2>
          <div className="contact-content">
            <form className="contact-form">
              <input type="email" placeholder="您的電子郵件" />
              <textarea placeholder="您的訊息"></textarea>
              <button type="submit">發送</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>關於我們</h4>
            <p>提供最佳的 CRM 解決方案</p>
          </div>
          <div className="footer-section">
            <h4>聯繫方式</h4>
            <p>Email: contact@example.com</p>
            <p>電話: (02) 2345-6789</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 CRM 系統. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}; 