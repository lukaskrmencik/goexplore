import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signup } from '../../../../services/authApiService';
import { AUTH_TOKEN_KEY } from '../../../../utils/auth';
import { getErrorMessage } from '../../../../utils/apiError';

export const useSignup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const redirectPath = searchParams.get('redirect') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirmation) {
            setError('Hesla se neshodují.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await signup({ name, email, password, password_confirmation: passwordConfirmation });
            const token = res.data?.data?.token || res.data?.token;
            if (token) {
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                navigate(redirectPath);
            } else {
                setError('Nepodařilo se najít token v odpovědi.');
            }
        } catch (err) {
            setError(getErrorMessage(err, 'Registrace selhala. Zkuste to prosím znovu.'));
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToLogin = () => {
        const redirect = searchParams.get('redirect');
        navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login');
    };

    return {
        name, setName,
        email, setEmail,
        password, setPassword,
        passwordConfirmation, setPasswordConfirmation,
        error, isLoading,
        handleSubmit, navigateToLogin,
    };
};
