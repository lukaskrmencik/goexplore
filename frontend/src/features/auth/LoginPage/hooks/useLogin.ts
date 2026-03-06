import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../../../../services/authApiService';
import { AUTH_TOKEN_KEY } from '../../../../utils/auth';
import { getErrorMessage } from '../../../../utils/apiError';

export const useLogin = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const redirectPath = searchParams.get('redirect') || '/';

    const handleSubmit = async (e: React.SubmitEvent) => {

        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await login({ email, password });
            const token = res.data?.data?.token || res.data?.token;
            if (token) {
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                navigate(redirectPath);
            } else {
                setError('Nepodařilo se přihlásit. Zkuste to znovu později.');
            }

        } catch (err) {
            setError(getErrorMessage(err, 'Neplatný e-mail nebo heslo.'));

        } finally {
            setIsLoading(false);
        }

    };

    const navigateToSignup = () => {
        const redirect = searchParams.get('redirect');
        navigate(redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup');
    };

    return { email, setEmail, password, setPassword, error, isLoading, handleSubmit, navigateToSignup };
};
