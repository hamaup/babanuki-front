import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/" exact activeClassName="active">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/game" activeClassName="active">
            Game
          </NavLink>
        </li>
        <li>
          <NavLink to="/exchange-history" activeClassName="active">
            Exchange History
          </NavLink>
        </li>
        <li>
          <NavLink to="/card-collection" activeClassName="active">
            Card Collection
          </NavLink>
        </li>
        <li>
          <NavLink to="/help" activeClassName="active">
            Help
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
