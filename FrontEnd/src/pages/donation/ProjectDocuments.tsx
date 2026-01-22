import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donationProjectService } from '../../services/donationProjectService';
import type { DonationProject, DonationDocument } from '../../types';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Button from '../../components/Button';

const ProjectDocuments = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<DonationProject | null>(null);
  const [documents, setDocuments] = useState<DonationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectData, documentsData] = await Promise.all([
        donationProjectService.getProject(parseInt(id!)),
        donationProjectService.getProjectDocuments(parseInt(id!)),
      ]);
      setProject(projectData);
      setDocuments(documentsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!uploadData.file || !uploadData.title) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (uploadData.file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    setUploading(true);

    try {
      await donationProjectService.uploadDocument(
        parseInt(id!),
        uploadData.file,
        uploadData.title,
        uploadData.description || undefined
      );

      setUploadData({
        title: '',
        description: '',
        file: null,
      });
      setShowUploadForm(false);
      loadData();
      alert('Document uploadé avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: DonationDocument) => {
    try {
      const blob = await donationProjectService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du téléchargement');
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${round(size, 2)} ${units[unit]}`;
  };

  const round = (value: number, decimals: number) => {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Button variant="secondary" onClick={() => navigate('/donation/projects')} className="mb-2">
            ← Retour aux projets
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Documents - {project?.nom}
          </h1>
        </div>
        <Button onClick={() => setShowUploadForm(true)}>
          + Uploader un document
        </Button>
      </div>

      {error && <Error message={error} />}

      {/* Formulaire d'upload */}
      {showUploadForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploader un document</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="label">Titre <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Fichier <span className="text-red-500">*</span></label>
              <input
                type="file"
                className="input"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max 10MB)
              </p>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" loading={uploading} className="flex-1">
                Uploader
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadData({
                    title: '',
                    description: '',
                    file: null,
                  });
                }}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des documents */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents du projet</h2>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucun document uploadé</p>
            <Button onClick={() => setShowUploadForm(true)}>Uploader le premier document</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{document.title}</h3>
                    {document.description && (
                      <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Fichier:</span> {document.file_name}
                      </div>
                      <div>
                        <span className="font-medium">Taille:</span> {formatFileSize(document.file_size)}
                      </div>
                      <div>
                        <span className="font-medium">Uploadé le:</span> {formatDate(document.created_at)}
                      </div>
                      {document.uploadedBy && (
                        <div>
                          <span className="font-medium">Par:</span> {document.uploadedBy.first_name} {document.uploadedBy.last_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleDownload(document)}
                  >
                    📥 Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDocuments;
