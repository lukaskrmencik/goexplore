import React from 'react';
import { useSignup } from '../hooks/useSignup';
import './SignupPage.css';

const SignupPage: React.FC = () => {
    const {
        name, setName,
        email, setEmail,
        password, setPassword,
        passwordConfirmation, setPasswordConfirmation,
        error, isLoading,
        handleSubmit, navigateToLogin,
    } = useSignup();

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <img src="/goexplore_logo.svg" alt="GoExplore logo" className="auth-logo-icon" />
                    <h1 className="auth-title">Vytvořit účet</h1>
                    <p className="auth-subtitle">Připojte se k aplikaci GoExplore</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label htmlFor="name">Jméno</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Zadejte své jméno"
                            required
                        />
                    </div>

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
                            placeholder="Zadejte heslo"
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <label htmlFor="passwordConfirmation">Potvrzení hesla</label>
                        <input
                            type="password"
                            id="passwordConfirmation"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Zadejte heslo znovu"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                        {isLoading ? 'Zpracovávám...' : 'Zaregistrovat se'}
                    </button>
                </form>

                <div className="auth-footer">
                    Již máte účet?{' '}
                    <span onClick={navigateToLogin} className="auth-link">
                        Přihlaste se
                    </span>
                </div>
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default SignupPage;
