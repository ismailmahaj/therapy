<?php

namespace App\Http\Controllers\Api\Donation;

use App\Http\Controllers\Controller;
use App\Models\DonationDocument;
use App\Models\DonationProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DonationDocumentController extends Controller
{
    /**
     * Liste des documents d'un projet.
     */
    public function index(DonationProject $project): JsonResponse
    {
        // Vérifier que l'utilisateur peut voir ce projet
        if (!$project->donationUser || $project->donation_user_id !== Auth::id()) {
            if (!Auth::user()->isAdmin()) {
                return response()->json([
                    'message' => 'Accès non autorisé',
                ], 403);
            }
        }

        $documents = $project->documents()
            ->with('uploadedBy:id,first_name,last_name,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'documents' => $documents,
        ]);
    }

    /**
     * Uploader un document pour un projet.
     */
    public function store(Request $request, DonationProject $project): JsonResponse
    {
        // Vérifier que l'utilisateur peut modifier ce projet
        if ($project->donation_user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'], // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('donation_documents', $fileName, 'public');

            $document = DonationDocument::create([
                'project_id' => $project->id,
                'uploaded_by' => Auth::id(),
                'title' => $request->title,
                'description' => $request->description,
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);

            return response()->json([
                'message' => 'Document uploadé avec succès',
                'document' => $document->load('uploadedBy'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'upload du document',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Télécharger un document.
     */
    public function download(DonationDocument $document): \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
    {
        // Vérifier que l'utilisateur peut voir ce document
        $project = $document->project;
        if ($project->donation_user_id !== Auth::id() && !Auth::user()->isAdmin() && !Auth::user()->isClient()) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json([
                'message' => 'Fichier non trouvé',
            ], 404);
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    /**
     * Supprimer un document (seulement pour les admins, pas de suppression pour les gestionnaires).
     */
    public function destroy(DonationDocument $document): JsonResponse
    {
        // Seuls les admins peuvent supprimer (historique immuable)
        if (!Auth::user()->isAdmin() && !Auth::user()->isSuperAdmin()) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à supprimer ce document. L\'historique est immuable.',
            ], 403);
        }

        try {
            // Supprimer le fichier
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            return response()->json([
                'message' => 'Document supprimé avec succès',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du document',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
