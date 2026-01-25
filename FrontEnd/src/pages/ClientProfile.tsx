import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';
import Button from '../components/Button';
import Error from '../components/Error';
import Loading from '../components/Loading';

const ClientProfile = () => {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    sexe: '' as 'homme' | 'femme' | '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setUser(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        sexe: data.sexe || '',
        bio: data.bio || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Filtrer les champs vides avant l'envoi
      const dataToSend: any = { ...formData };
      if (!dataToSend.sexe || dataToSend.sexe === '') {
        delete dataToSend.sexe;
      }
      const updatedUser = await profileService.updateProfile(dataToSend);
      setUser(updatedUser);
      
      // Recharger les données utilisateur dans le contexte
      await refreshUser();
      
      alert('Profil mis à jour avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordData.password !== passwordData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setSaving(true);

    try {
      await profileService.updateProfile({
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
        current_password: passwordData.current_password,
      });
      
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      setShowPasswordForm(false);
      alert('Mot de passe modifié avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du mot de passe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

      {error && <Error message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Prénom <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Nom <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              {user?.email_verified_at ? (
                <p className="text-sm text-green-600 mt-1">✓ Email vérifié</p>
              ) : (
                <p className="text-sm text-yellow-600 mt-1">⚠ Email non vérifié</p>
              )}
            </div>

            <div>
              <label className="label">Téléphone</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Sexe <span className="text-red-500">*</span></label>
              <select
                className="input"
                value={formData.sexe}
                onChange={(e) => setFormData({ ...formData, sexe: e.target.value as 'homme' | 'femme' })}
                required
              >
                <option value="">Sélectionner</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea
                className="input"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Parlez-nous de vous..."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/1000 caractères</p>
            </div>

            <Button type="submit" loading={saving} className="w-full">
              Enregistrer les modifications
            </Button>
          </form>
        </div>

        {/* Mot de passe */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sécurité</h2>
          
          {!showPasswordForm ? (
            <div>
              <p className="text-gray-600 mb-4">Modifiez votre mot de passe pour sécuriser votre compte.</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPasswordForm(true)}
                className="w-full"
              >
                Modifier le mot de passe
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label">Mot de passe actuel <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Nouveau mot de passe <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <p className="text-sm text-gray-500 mt-1">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="label">Confirmer le mot de passe <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                  required
                  minLength={8}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      current_password: '',
                      password: '',
                      password_confirmation: '',
                    });
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" loading={saving} className="flex-1">
                  Modifier
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
