import { useState, useEffect } from 'react';
import { donationService } from '../services/donationService';
import type { DonationProject, CreateContributionData } from '../types';
import Loading from '../components/Loading';
import Error from '../components/Error';
import Button from '../components/Button';

type ContributionForm = {
  project_id: number;
  montant: string;
  nom_sadaqa: string;
};

const MultiDonations = () => {
  const [projects, setProjects] = useState<DonationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [contributions, setContributions] = useState<ContributionForm[]>([
    { project_id: 0, montant: '', nom_sadaqa: '' },
  ]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await donationService.getProjects();
      setProjects(data.filter(p => p.statut === 'active'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const addContribution = () => {
    if (contributions.length >= 20) {
      setError('Maximum 20 contributions à la fois');
      return;
    }
    setContributions([...contributions, { project_id: 0, montant: '', nom_sadaqa: '' }]);
  };

  const removeContribution = (index: number) => {
    if (contributions.length > 1) {
      setContributions(contributions.filter((_, i) => i !== index));
    }
  };

  const updateContribution = (index: number, field: keyof ContributionForm, value: string | number) => {
    const updated = [...contributions];
    updated[index] = { ...updated[index], [field]: value };
    setContributions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const validContributions = contributions.filter(c => c.project_id > 0 && parseFloat(c.montant) >= 1);
    
    if (validContributions.length === 0) {
      setError('Veuillez sélectionner au moins un projet avec un montant valide (minimum 1€)');
      return;
    }

    // Vérifier les doublons de projets
    const projectIds = validContributions.map(c => c.project_id);
    const uniqueProjectIds = [...new Set(projectIds)];
    if (projectIds.length !== uniqueProjectIds.length) {
      setError('Vous ne pouvez pas contribuer plusieurs fois au même projet dans une seule transaction');
      return;
    }

    setSubmitting(true);

    try {
      const contributionsData: CreateContributionData[] = validContributions.map(c => ({
        project_id: c.project_id,
        montant: parseFloat(c.montant),
        nom_sadaqa: c.nom_sadaqa || undefined,
      }));

      const response = await donationService.contributeMultiple(contributionsData);

      alert(`${response.contributions.length} contribution(s) créée(s) ! Veuillez compléter le paiement.`);
      
      // Rediriger vers la page de donations
      window.location.href = '/donations';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création des contributions');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      puit: 'Puits',
      arbre: 'Arbre',
      mosquee: 'Mosquée',
      ecole: 'École',
      orphelinat: 'Orphelinat',
      eau: 'Eau',
      nourriture: 'Nourriture',
      autre: 'Autre',
    };
    return labels[type] || type;
  };

  const calculateTotal = () => {
    return contributions.reduce((sum, c) => {
      const amount = parseFloat(c.montant) || 0;
      return sum + amount;
    }, 0);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Multi-Donations</h1>
        <Button variant="secondary" onClick={() => window.location.href = '/donations'}>
          Retour aux donations
        </Button>
      </div>

      {error && <Error message={error} />}

      <div className="card">
        <p className="text-gray-600 mb-6">
          Contribuez à plusieurs projets en une seule transaction. Vous pouvez sélectionner jusqu'à 20 projets différents.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {contributions.map((contribution, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contribution {index + 1}
                </h3>
                {contributions.length > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeContribution(index)}
                  >
                    ✕ Supprimer
                  </Button>
                )}
              </div>

              <div>
                <label className="label">Projet <span className="text-red-500">*</span></label>
                <select
                  className="input"
                  value={contribution.project_id}
                  onChange={(e) => updateContribution(index, 'project_id', parseInt(e.target.value))}
                  required
                >
                  <option value="0">Sélectionner un projet</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.nom} - {getTypeLabel(project.type)} ({project.pays})
                    </option>
                  ))}
                </select>
                {contribution.project_id > 0 && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const project = projects.find(p => p.id === contribution.project_id);
                      if (!project) return null;
                      return (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Collecté:</span>
                            <span className="font-medium">
                              {parseFloat(project.montant_collecte).toFixed(2)} € / {parseFloat(project.montant_requis).toFixed(2)} €
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${Math.min(parseFloat(project.progress_percentage.toString()), 100)}%` }}
                            />
                          </div>
                          {project.description && (
                            <p className="text-gray-600 mt-2">{project.description}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Montant (€) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  step="0.01"
                  value={contribution.montant}
                  onChange={(e) => updateContribution(index, 'montant', e.target.value)}
                  placeholder="50.00"
                  required
                />
              </div>

              <div>
                <label className="label">Nomination de la sadaqa (optionnel)</label>
                <input
                  type="text"
                  className="input"
                  value={contribution.nom_sadaqa}
                  onChange={(e) => updateContribution(index, 'nom_sadaqa', e.target.value)}
                  placeholder="Pour mes parents"
                />
              </div>
            </div>
          ))}

          {contributions.length < 20 && (
            <Button
              type="button"
              variant="secondary"
              onClick={addContribution}
              className="w-full"
            >
              + Ajouter une autre contribution
            </Button>
          )}

          {/* Résumé */}
          {contributions.some(c => c.project_id > 0 && parseFloat(c.montant) >= 1) && (
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total à payer:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {calculateTotal().toFixed(2)} €
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {contributions.filter(c => c.project_id > 0 && parseFloat(c.montant) >= 1).length} contribution(s)
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Paiement sécurisé via Stripe</span>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={submitting}
            disabled={!contributions.some(c => c.project_id > 0 && parseFloat(c.montant) >= 1)}
          >
            Confirmer et Payer {calculateTotal().toFixed(2)} €
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MultiDonations;
