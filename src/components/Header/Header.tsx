import { useState } from 'react';
import { AlgorithmModal } from '../AlgorithmModal/AlgorithmModal';
import './Header.css';

const LEETCODE_URL = 'https://leetcode.cn/problems/diameter-of-binary-tree/';
const GITHUB_URL = 'https://github.com/fuck-algorithm/leetcode-543-diameter-of-binary-tree';

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <a 
            href={LEETCODE_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="title-link"
          >
            <span className="problem-number">543.</span>
            <span className="problem-title">二叉树的直径</span>
            <svg className="external-link-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
            </svg>
          </a>
        </div>
        <div className="header-right">
          <button 
            className="algo-btn"
            onClick={() => setIsModalOpen(true)}
            title="查看算法思路"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,19H11V17H13V19M15.07,11.25L14.17,12.17C13.45,12.9 13,13.5 13,15H11V14.5C11,13.4 11.45,12.4 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.9 13.1,7 12,7C10.9,7 10,7.9 10,9H8C8,6.79 9.79,5 12,5C14.21,5 16,6.79 16,9C16,9.88 15.64,10.68 15.07,11.25Z" />
            </svg>
            <span>算法思路</span>
          </button>
          <a 
            href={GITHUB_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
            title="查看源代码"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </a>
        </div>
      </header>
      
      <AlgorithmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
