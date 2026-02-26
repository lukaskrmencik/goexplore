import React from 'react';
import { useLogin } from '../hooks/useLogin';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const { email, setEmail, password, setPassword, error, isLoading, handleSubmit, navigateToSignup } = useLogin();

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <img src="/goexplore_logo.svg" alt="GoExplore logo" className="auth-logo-icon" />
                    <h1 className="auth-title">Vítejte zpět</h1>
                    <p className="auth-subtitle">Přihlaste se ke svému účtu v GoExplore</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Zadejte svůj e-mail"
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <label htmlFor="password">Heslo</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Zadejte své heslo"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                        {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
                    </button>
                </form>

                <div className="auth-footer">
                    Nemáte ještě účet?{' '}
                    <span onClick={navigateToSignup} className="auth-link">
                        Zaregistrujte se
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
