import { useState, useEffect } from 'react';
import { donationProjectService } from '../../services/donationProjectService';
import type { DonationProject } from '../../types';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

const DonationProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DonationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<DonationProject | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    pays: '',
    nom: '',
    description: '',
    montant_requis: '',
    is_featured: false,
    beneficiaries_count: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await donationProjectService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProject) {
        await donationProjectService.updateProject(editingProject.id, {
          ...formData,
          montant_requis: parseFloat(formData.montant_requis),
          beneficiaries_count: formData.beneficiaries_count ? parseInt(formData.beneficiaries_count) : undefined,
        });
      } else {
        await donationProjectService.createProject({
          ...formData,
          montant_requis: parseFloat(formData.montant_requis),
          beneficiaries_count: formData.beneficiaries_count ? parseInt(formData.beneficiaries_count) : undefined,
        });
      }

      setShowForm(false);
      setEditingProject(null);
      setFormData({
        type: '',
        pays: '',
        nom: '',
        description: '',
        montant_requis: '',
        is_featured: false,
        beneficiaries_count: '',
      });
      loadProjects();
      alert(editingProject ? 'Projet mis à jour avec succès !' : 'Projet créé avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde du projet');
    }
  };

  const handleEdit = (project: DonationProject) => {
    setEditingProject(project);
    setFormData({
      type: project.type,
      pays: project.pays,
      nom: project.nom,
      description: project.description || '',
      montant_requis: project.montant_requis.toString(),
      is_featured: project.is_featured,
      beneficiaries_count: project.beneficiaries_count?.toString() || '',
    });
    setShowForm(true);
  };

  const handleActivate = async (project: DonationProject) => {
    if (!confirm(`Voulez-vous activer le projet "${project.nom}" ?`)) return;

    try {
      await donationProjectService.activateProject(project.id);
      loadProjects();
      alert('Projet activé avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'activation du projet');
    }
  };

  const handleDelete = async (project: DonationProject) => {
    if (!confirm(`Voulez-vous vraiment supprimer le projet "${project.nom}" ?`)) return;

    try {
      await donationProjectService.deleteProject(project.id);
      loadProjects();
      alert('Projet supprimé avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du projet');
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

  const getStatusBadge = (statut: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[statut as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut: string) => {
    const labels = {
      draft: 'Brouillon',
      active: 'Actif',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Projets de Donations</h1>
        <Button onClick={() => {
          setShowForm(true);
          setEditingProject(null);
          setFormData({
            type: '',
            pays: '',
            nom: '',
            description: '',
            montant_requis: '',
            is_featured: false,
            beneficiaries_count: '',
          });
        }}>
          + Nouveau Projet
        </Button>
      </div>

      {error && <Error message={error} />}

      {/* Formulaire de création/édition */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingProject ? 'Modifier le projet' : 'Créer un nouveau projet'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Type <span className="text-red-500">*</span></label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="puit">Puits</option>
                  <option value="arbre">Arbre</option>
                  <option value="mosquee">Mosquée</option>
                  <option value="ecole">École</option>
                  <option value="orphelinat">Orphelinat</option>
                  <option value="eau">Eau</option>
                  <option value="nourriture">Nourriture</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="label">Pays <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input"
                  value={formData.pays}
                  onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Nom du projet <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Montant requis (€) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  step="0.01"
                  value={formData.montant_requis}
                  onChange={(e) => setFormData({ ...formData, montant_requis: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Nombre de bénéficiaires</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={formData.beneficiaries_count}
                  onChange={(e) => setFormData({ ...formData, beneficiaries_count: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Projet mis en avant</span>
              </label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                {editingProject ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingProject(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des projets */}
      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucun projet créé</p>
          <Button onClick={() => setShowForm(true)}>Créer votre premier projet</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.nom}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(project.statut)}`}>
                      {getStatusLabel(project.statut)}
                    </span>
                    {project.is_featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Mis en avant
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Type:</span> {getTypeLabel(project.type)}
                </div>
                <div>
                  <span className="font-medium">Pays:</span> {project.pays}
                </div>
                <div>
                  <span className="font-medium">Montant:</span> {parseFloat(project.montant_collecte).toFixed(2)} € / {parseFloat(project.montant_requis).toFixed(2)} €
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${Math.min(parseFloat(project.progress_percentage.toString()), 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {parseFloat(project.progress_percentage.toString()).toFixed(1)}% complété
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/donation/projects/${project.id}/documents`)}
                  className="flex-1"
                >
                  📄 Documents
                </Button>
                {project.statut === 'draft' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleActivate(project)}
                    className="flex-1"
                  >
                    Activer
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(project)}
                  className="flex-1"
                >
                  Modifier
                </Button>
                {project.statut === 'draft' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(project)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationProjects;
