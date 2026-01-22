import { useEffect, useState } from 'react';
import { donationService } from '../services/donationService';
import type { DonationContribution, DonationProject } from '../types';
import Loading from '../components/Loading';
import Error from '../components/Error';
import Button from '../components/Button';

const Donations = () => {
  const [projects, setProjects] = useState<DonationProject[]>([]);
  const [contributions, setContributions] = useState<DonationContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DonationProject | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    nom_sadaqa: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, contributionsData] = await Promise.all([
        donationService.getProjects({ featured: true }),
        donationService.getMyContributions(),
      ]);
      setProjects(projectsData);
      setContributions(contributionsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await donationService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSelectProject = (project: DonationProject) => {
    setSelectedProject(project);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProject) {
      setError('Veuillez sélectionner un projet');
      return;
    }

    if (parseFloat(formData.amount) < 1) {
      setError('Le montant minimum est de 1 €');
      return;
    }

    setSubmitting(true);

    try {
      const response = await donationService.contribute({
        project_id: selectedProject.id,
        montant: parseFloat(formData.amount),
        nom_sadaqa: formData.nom_sadaqa || undefined,
      });

      // TODO: Intégrer Stripe Elements ici avec response.client_secret
      alert(`Contribution créée ! Veuillez compléter le paiement.`);
      
      setFormData({
        amount: '',
        nom_sadaqa: '',
      });
      setSelectedProject(null);
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la contribution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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

  const getStatusBadge = (status: string) => {
    const badges = {
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      succeeded: 'Payée',
      pending: 'En attente',
      failed: 'Échouée',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const totalContributions = contributions
    .filter(c => c.statut === 'succeeded')
    .reduce((sum, c) => sum + parseFloat(c.montant), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => window.location.href = '/donations/multi'}>
            Multi-Donations
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Faire une donation'}
          </Button>
        </div>
      </div>

      {error && <Error message={error} />}

      {/* Formulaire de contribution */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedProject ? `Contribuer à: ${selectedProject.nom}` : 'Sélectionner un projet'}
          </h2>
          
          {!selectedProject ? (
            <div>
              <p className="text-gray-600 mb-4">Choisissez un projet auquel contribuer :</p>
              {loadingProjects ? (
                <p className="text-center py-4 text-gray-500">Chargement...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {projects.filter(p => p.statut === 'active').map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleSelectProject(project)}
                      className="p-4 border-2 border-gray-200 rounded-lg text-left hover:border-primary-300 transition"
                    >
                      <h3 className="font-semibold text-gray-900">{project.nom}</h3>
                      <p className="text-sm text-gray-600 mt-1">{getTypeLabel(project.type)} - {project.pays}</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Collecté:</span>
                          <span className="font-medium">
                            {parseFloat(project.montant_collecte).toFixed(2)} € / {parseFloat(project.montant_requis).toFixed(2)} €
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.min(parseFloat(project.progress_percentage.toString()), 100)}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Montant (€)</label>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  step="0.01"
                  required
                  className="input"
                  placeholder="50.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Nomination de la sadaqa (optionnel)</label>
                <input
                  type="text"
                  name="nom_sadaqa"
                  className="input"
                  placeholder="Pour mes parents"
                  value={formData.nom_sadaqa}
                  onChange={(e) => setFormData({ ...formData, nom_sadaqa: e.target.value })}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" loading={submitting}>
                  Contribuer
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedProject(null);
                    setFormData({ amount: '', nom_sadaqa: '' });
                  }}
                >
                  Changer de projet
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Total des contributions */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Total de mes contributions</h2>
        <p className="text-3xl font-bold text-primary-600">{totalContributions.toFixed(2)} €</p>
      </div>

      {/* Mes contributions */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mes Contributions</h2>
      {contributions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucune contribution</p>
          <Button onClick={() => setShowForm(true)}>Faire une contribution</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {contributions.map((contribution) => (
            <div key={contribution.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contribution.project?.nom || 'Projet supprimé'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(contribution.statut)}`}>
                      {getStatusLabel(contribution.statut)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Type:</span> {contribution.project && getTypeLabel(contribution.project.type)}
                    </div>
                    <div>
                      <span className="font-medium">Montant:</span> {parseFloat(contribution.montant).toFixed(2)} €
                    </div>
                    {contribution.nom_sadaqa && (
                      <div>
                        <span className="font-medium">Pour:</span> {contribution.nom_sadaqa}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(contribution.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Donations;
