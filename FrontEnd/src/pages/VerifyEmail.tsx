import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/Button';
import Error from '../components/Error';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const id = searchParams.get('id');
  const hash = searchParams.get('hash');

  useEffect(() => {
    if (id && hash) {
      handleVerify();
    }
  }, [id, hash]);

  const handleVerify = async () => {
    if (!id || !hash) {
      setError('Paramètres de vérification manquants');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyEmail(id, hash);
      setMessage('Email vérifié avec succès ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la vérification de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vérification de l'email
          </h2>
          
          {loading && (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Vérification en cours...</p>
            </div>
          )}

          {error && <Error message={error} />}

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {!id || !hash ? (
            <div>
              <p className="text-gray-600 mb-4">
                Un email de vérification a été envoyé à votre adresse.
                Cliquez sur le lien dans l'email pour vérifier votre compte.
              </p>
              <Link to="/login">
                <Button>Retour à la connexion</Button>
              </Link>
            </div>
          ) : (
            !loading && !message && (
              <Button onClick={handleVerify} loading={loading}>
                Vérifier l'email
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
