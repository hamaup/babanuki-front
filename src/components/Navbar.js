import React from 'react';
import styles from './Navbar.module.css';

const Navbar = ({ currentAccount }) => {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li>
          <a href="/"><h1>BΛBΛNUKI</h1></a>
        </li>
        {currentAccount && (
          <li>
            <a href="/profile">Profile ({currentAccount.slice(0, 4)}...{currentAccount.slice(-4)})</a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
