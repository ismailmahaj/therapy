import { useState, useEffect } from 'react';
import { therapyService } from '../../services/therapyService';
import type { TherapistProfile } from '../../types';
import Button from '../../components/Button';
import Error from '../../components/Error';
import Loading from '../../components/Loading';

const TherapistProfilePage = () => {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    sexe: '' as 'homme' | 'femme' | '',
    hijama_types: [] as string[],
    pratiques_personnalisees: [] as string[],
    nouvelle_pratique: '',
    autres_types: '',
  });

  const hijamaTypes = [
    { value: 'hijama_seche', label: 'Hijama Sèche' },
    { value: 'hijama_humide', label: 'Hijama Humide' },
    { value: 'hijama_sunnah', label: 'Hijama Sunnah' },
    { value: 'hijama_esthetique', label: 'Hijama Esthétique' },
    { value: 'hijama_sportive', label: 'Hijama Sportive' },
    { value: 'hijama_medicale', label: 'Hijama Médicale' },
    { value: 'hijama_preventive', label: 'Hijama Préventive' },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await therapyService.getProfile();
      if (data) {
        setProfile(data);
        // Séparer les types prédéfinis et les pratiques personnalisées
        const allTypes = data.hijama_types || [];
        const predefinedTypes = hijamaTypes.map(t => t.value);
        const predefined = allTypes.filter((t: string) => predefinedTypes.includes(t));
        const custom = allTypes.filter((t: string) => !predefinedTypes.includes(t));
        
        setFormData({
          sexe: data.sexe,
          hijama_types: predefined,
          pratiques_personnalisees: custom,
          nouvelle_pratique: '',
          autres_types: data.autres_types || '',
        });
      }
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
      if (!formData.sexe) {
        setError('Le sexe est obligatoire');
        setSaving(false);
        return;
      }

      const allTypes = [...formData.hijama_types, ...formData.pratiques_personnalisees];
      
      if (allTypes.length === 0) {
        setError('Veuillez sélectionner ou ajouter au moins une pratique de hijama');
        setSaving(false);
        return;
      }

      const data = await therapyService.createOrUpdateProfile({
        sexe: formData.sexe,
        hijama_types: formData.hijama_types,
        pratiques_personnalisees: formData.pratiques_personnalisees,
        autres_types: formData.autres_types || undefined,
      });

      setProfile(data);
      setError('');
      alert('Profil enregistré avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleHijamaTypeChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        hijama_types: [...formData.hijama_types, value],
      });
    } else {
      setFormData({
        ...formData,
        hijama_types: formData.hijama_types.filter(t => t !== value),
        autres_types: value === 'autres' ? '' : formData.autres_types,
      });
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil Thérapeute</h1>

      {error && <Error message={error} />}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Sexe */}
        <div>
          <label className="label">
            Sexe <span className="text-red-500">*</span>
          </label>
          <select
            className="input"
            value={formData.sexe}
            onChange={(e) => setFormData({ ...formData, sexe: e.target.value as 'homme' | 'femme' })}
            required
          >
            <option value="">Sélectionnez votre sexe</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Ce sexe sera automatiquement appliqué à tous vos créneaux
          </p>
        </div>

        {/* Types de hijama prédéfinis */}
        <div>
          <label className="label">
            Types de hijama pratiqués <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2 mb-4">
            {hijamaTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hijama_types.includes(type.value)}
                  onChange={(e) => handleHijamaTypeChange(type.value, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
          
          {/* Pratiques personnalisées */}
          <div className="mt-4">
            <label className="label">
              Pratiques personnalisées
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Ajouter une pratique (ex: Hijama pour enfants, Hijama thérapeutique avancée...)"
                value={formData.nouvelle_pratique}
                onChange={(e) => setFormData({ ...formData, nouvelle_pratique: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (formData.nouvelle_pratique.trim() && !formData.pratiques_personnalisees.includes(formData.nouvelle_pratique.trim())) {
                      setFormData({
                        ...formData,
                        pratiques_personnalisees: [...formData.pratiques_personnalisees, formData.nouvelle_pratique.trim()],
                        nouvelle_pratique: '',
                      });
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (formData.nouvelle_pratique.trim() && !formData.pratiques_personnalisees.includes(formData.nouvelle_pratique.trim())) {
                    setFormData({
                      ...formData,
                      pratiques_personnalisees: [...formData.pratiques_personnalisees, formData.nouvelle_pratique.trim()],
                      nouvelle_pratique: '',
                    });
                  }
                }}
              >
                + Ajouter
              </Button>
            </div>
            
            {/* Liste des pratiques personnalisées */}
            {formData.pratiques_personnalisees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.pratiques_personnalisees.map((pratique, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {pratique}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          pratiques_personnalisees: formData.pratiques_personnalisees.filter((_, i) => i !== index),
                        });
                      }}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Vous pouvez ajouter autant de pratiques personnalisées que vous souhaitez
            </p>
          </div>
          
          {(formData.hijama_types.length === 0 && formData.pratiques_personnalisees.length === 0) && (
            <p className="text-sm text-red-500 mt-1">Veuillez sélectionner ou ajouter au moins une pratique</p>
          )}
        </div>

        {/* Notes complémentaires */}
        <div>
          <label className="label">
            Notes complémentaires (optionnel)
          </label>
          <textarea
            className="input"
            rows={3}
            value={formData.autres_types}
            onChange={(e) => setFormData({ ...formData, autres_types: e.target.value })}
            placeholder="Informations supplémentaires sur vos pratiques (expérience, spécialisations, etc.)..."
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.autres_types.length}/1000 caractères
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" loading={saving}>
            {profile ? 'Mettre à jour' : 'Créer'} le profil
          </Button>
        </div>
      </form>

      {profile && (
        <div className="mt-6 card bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations actuelles</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Sexe:</span> {profile.sexe === 'homme' ? 'Homme' : 'Femme'}
            </div>
            <div>
              <span className="font-medium">Types pratiqués:</span>{' '}
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.hijama_types.map((t, idx) => {
                  const predefined = hijamaTypes.find(ht => ht.value === t);
                  return (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs"
                    >
                      {predefined ? predefined.label : t}
                    </span>
                  );
                })}
              </div>
            </div>
            {profile.autres_types && (
              <div>
                <span className="font-medium">Autres types:</span> {profile.autres_types}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistProfilePage;
