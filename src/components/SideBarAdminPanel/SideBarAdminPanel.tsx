import React from "react";
import { NavLink } from "react-router-dom";
import "./SideBarAdminPanel.css"; // Ajoute un peu de style

const Sidebar: React.FC = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink to="/admin-panel/dashboard" className="active">🏠 Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/admin-panel/users" className="active">👤 Utilisateurs</NavLink>
        </li>
        <li>
          <NavLink to="/admin-panel/posts" className="active">📝 Posts</NavLink>
        </li>
        <li>
          <NavLink to="/admin-panel/recettes" className="active">🍲 Recettes</NavLink>
        </li>
        <li>
          <NavLink to="/admin-panel/ingredients" className="active">🥦 Ingrédients</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
