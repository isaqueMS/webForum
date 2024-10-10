import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase'; // ajuste o caminho para onde está seu arquivo de configuração
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Função para realizar login com Firebase
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuário logado:', user.email);
      navigate('/MenuChart'); // Redireciona após o login bem-sucedido
    } catch (error) {
      console.error('Erro no login:', error);
      setErrorMessage('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  // Função para realizar o cadastro com Firebase
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não correspondem.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuário cadastrado:', user.email);
      navigate('/MenuChart'); // Redireciona após o cadastro bem-sucedido
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErrorMessage('Erro ao fazer o cadastro. Verifique os dados.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {isLogin ? (
          <>
            <h1 style={styles.title}>SSP-DVM</h1>
            <input
              style={styles.input}
              type="email"
              placeholder="E-mail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            {errorMessage && <p style={styles.error}>{errorMessage}</p>}
            <button style={styles.button} onClick={handleLogin}>
              Entrar
            </button>
            <p style={styles.message}>
              Não tem uma conta?{' '}
              <span style={styles.link} onClick={() => setIsLogin(false)}>
                Cadastre-se
              </span>
            </p>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Cadastro</h1>
            <input
              style={styles.input}
              type="email"
              placeholder="E-mail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Confirmar senha"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
            {errorMessage && <p style={styles.error}>{errorMessage}</p>}
            <button style={styles.button} onClick={handleSignup}>
              Cadastrar
            </button>
            <p style={styles.message}>
              Já tem uma conta?{' '}
              <span style={styles.link} onClick={() => setIsLogin(true)}>
                Faça login
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'url(/path-to-your-background.png) no-repeat center center fixed',
    backgroundSize: 'cover',
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '40px',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#fff',
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
  },
  input: {
    width: '80%',
    padding: '15px',
    margin: '10px 0',
    borderRadius: '25px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: '#fff',
    fontSize: '16px',
  },
  button: {
    width: '80%',
    padding: '15px',
    backgroundColor: '#1DB954',
    borderRadius: '25px',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  message: {
    color: '#fff',
  },
  link: {
    color: '#1DB954',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: '#FF5733',
    marginBottom: '20px',
  },
};

export default LoginScreen;
