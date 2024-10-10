import React, { useState, useEffect } from 'react';
import { FaHome, FaChartPie, FaCog, FaBell, FaComments, FaUser, FaBars } from 'react-icons/fa';
import { getAuth } from 'firebase/auth'; // Importando o Firebase Auth
import { useNavigate } from 'react-router-dom'; // Importando useNavigate
import TaskChart from "./Taskchart";
import TaskChartLinha from "./taskchartLinha";
import TasksCardGrid from "./TasksCardGrid";
import TasksBarChart from "./TasksBarChart";

const MenuChart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // Estado para armazenar dados do usuário
  const navigate = useNavigate(); // Hook para navegação

  // Função para alternar o menu lateral
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // useEffect para carregar os dados do usuário ao montar o componente
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      setUser({
        fullName: currentUser.displayName, 
        firstName: currentUser.displayName?.split(' ')[0], // Pega apenas o primeiro nome
        photoURL: currentUser.photoURL || 'https://via.placeholder.com/60', // Se não houver photoURL, usa um placeholder
      });
    }
  }, []);

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#121212', 
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '24px',
    zIndex: 1000,
    padding: '0 20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const toggleButtonStyle = {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '28px', 
    borderRadius: '5px',
    transition: 'transform 0.3s ease, color 0.3s ease',
  };

  const sidebarStyle = {
    position: 'fixed',
    top: '60px', 
    left: 0,
    height: 'calc(100% - 60px)',
    width: isOpen ? '250px' : '80px',
    backgroundColor: '#000000',
    transition: 'width 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white',
    paddingTop: '20px',
    boxShadow: isOpen ? '2px 0 10px rgba(0, 0, 0, 0.5)' : 'none',
    overflow: 'hidden',
  };

  const userContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    marginTop: '1px',
  };

  const userImageStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    marginBottom: '5px',
    border: '3px solid #fff',
  };

  const userNameStyle = {
    color: 'white',
    fontSize: '14px',
    textAlign: 'center',
  };

  const menuItemsStyle = {
    listStyle: 'none',
    padding: 0,
    marginTop: '20px',
    width: '100%',
    alignItems: 'center',
  };

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'flex-start' : 'center',
    padding: '25px',
    cursor: 'pointer',
    color: 'white',
    backgroundColor: '#111111',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
    width: '90%',
    boxSizing: 'border-box',
    margin: '5px 0',
  };

  const iconStyle = {
    fontSize: '20px',
    marginRight: isOpen ? '10px' : '0',
  };

  const contentContainerStyle = {
    marginTop: '60px',
    marginLeft: isOpen ? '250px' : '80px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '20px',
    padding: '20px',
    height: 'calc(100vh - 60px)',
    backgroundColor: '#181818',
    color: 'white',
  };

  const quadrantStyle = {
    backgroundColor: '#222',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
  };

  const renderMenuItem = (icon, label, path) => (
    <li
      style={menuItemStyle}
      onClick={() => handleMenuItemClick(path)} // Navegação ao clicar
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111111')}
    >
      {icon}
      {isOpen && <span style={{ fontSize: '16px' }}>{label}</span>}
    </li>
  );

  return (
    <>
      <div style={headerStyle}>
        <button
          style={toggleButtonStyle}
          onClick={toggleMenu}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFD700')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
        >
          <FaBars
            style={{
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          />
        </button>
        <span>SGTO/DVM</span>
      </div>

      <div style={sidebarStyle}>
        {isOpen && user && (
          <div style={userContainerStyle}>
            <img
              src={user.photoURL}
              alt={user.fullName}
              style={userImageStyle}
            />
            <span style={userNameStyle}>{user.fullName}</span>
          </div>
        )}

        <ul style={menuItemsStyle}>
          {renderMenuItem(<FaHome style={iconStyle} />, 'Home', '/home')}
          {renderMenuItem(<FaChartPie style={iconStyle} />, 'Charts', '/charts')}
          {renderMenuItem(<FaCog style={iconStyle} />, 'Settings', '/settings')}
          {renderMenuItem(<FaBell style={iconStyle} />, 'Notifications', '/notifications')}
          {renderMenuItem(<FaComments style={iconStyle} />, 'Forum', '/forum')} {/* Navegação para o fórum */}
          {renderMenuItem(<FaUser style={iconStyle} />, 'Profile', '/profile')}
        </ul>
      </div>

      <div style={contentContainerStyle}>
        <div style={quadrantStyle}><TaskChart /></div>
        <div style={quadrantStyle}><TaskChartLinha /></div>
        <div style={quadrantStyle}><TasksBarChart /></div>
        <div style={quadrantStyle}><TasksCardGrid /></div>
      </div>
    </>
  );
};

export default MenuChart;
