import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Images, Loader2, Trash2 } from 'lucide-react';
import {
  CatalogManagerPage,
  PublishedCell,
  SampleCell,
  UpdatedCell
} from '../../components/admin/CatalogManagerPage';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ConfirmDialog } from '../../components/ui/Overlay';
import { Input } from '../../components/ui/Form';
import { ErrorBlock, Spinner } from '../../components/ui/Feedback';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate, humanize } from '../../lib/format';
import {
  addProjectImage,
  deleteProjectImage,
  listProjectImages,
  uploadImage,
  type ProjectImageRow
} from '../../services/admin';
import type { ProjectRow } from '../../types';

function ProjectImagesModal({
  project,
  onClose
}: {
  project: ProjectRow;
  onClose: () => void;
}) {
  const toast = useToast();
  const [images, setImages] = useState<ProjectImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectImageRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setImages(await listProjectImages(project.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The gallery could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const add = async () => {
    if (!url.trim()) {
      toast.error('Image URL required', 'Enter a hosted image URL or upload a file first.');
      return;
    }
    try {
      const parsed = new URL(url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid');
    } catch {
      toast.error('Invalid URL', 'Enter a full http:// or https:// image URL.');
      return;
    }

    setAdding(true);
    try {
      await addProjectImage(project.id, {
        image_url: url.trim(),
        alt_text: altText.trim() || project.title
      });
      setUrl('');
      setAltText('');
      toast.success('Image added to the gallery');
      await load();
    } catch (caught) {
      toast.error(
        'Image not added',
        caught instanceof Error ? caught.message : 'Please try again.'
      );
    } finally {
      setAdding(false);
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large', 'Choose an image no larger than 5 MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Unsupported file', 'Choose a JPEG, PNG or WebP image.');
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadImage(file, 'projects');
      setUrl(uploaded.url);
      if (!altText) setAltText(`${project.title} project image`);
      toast.success('Image uploaded', 'Add it to the gallery to save it.');
    } catch (caught) {
      toast.error(
        'Upload failed',
        caught instanceof Error ? caught.message : 'The image could not be uploaded.'
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProjectImage(project.id, deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Image removed', 'The gallery record was deleted.');
      await load();
    } catch (caught) {
      toast.error(
        'Image not removed',
        caught instanceof Error ? caught.message : 'Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={`Project gallery — ${project.title}`}
        description="Add images that illustrate the project. Alt text is used by screen readers."
        size="lg"
        footer={
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Image URL"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://…"
                type="url"
                containerClassName="sm:col-span-2"
              />
              <Input
                label="Alt text"
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                placeholder="Short description of the image"
                containerClassName="sm:col-span-2"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => void upload(event.target.files?.[0])}
                aria-label="Upload a project image"
              />
              <Button
                type="button"
                variant="outline"
                small
                loading={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Upload image
              </Button>
              <Button type="button" small loading={adding} onClick={() => void add()}>
                Add to gallery
              </Button>
              <span className="text-[11px] text-slate-500">JPEG, PNG or WebP · maximum 5 MB</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void load()} />
          ) : images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No gallery images yet. Add an image above.
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {images.map((image) => (
                <li
                  key={image.id}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="h-20 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-navy-900">{image.alt_text || 'No alt text'}</p>
                    <p className="mt-1 break-all text-[10px] leading-4 text-slate-400">
                      {image.image_url}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(image)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      Remove from gallery
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[11px] leading-5 text-slate-500">
            Removing a gallery record does not delete the file from storage. The images are shown on
            the public project page only while the project itself is published.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove this gallery image?"
        description="The image will no longer appear on the project page. The stored file is not deleted."
        confirmLabel="Remove image"
        destructive
        loading={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

export function AdminProjectsPage() {
  const { hasPermission } = useAuth();
  const [galleryProject, setGalleryProject] = useState<ProjectRow | null>(null);
  const canManageImages = hasPermission('content:write');

  return (
    <>
      <CatalogManagerPage<ProjectRow>
        resource="projects"
        title="Projects"
        description="Maintain the project and portfolio records. Sample records are excluded from the public website until they are replaced with verified information."
        createLabel="New project"
        searchPlaceholder="Search projects or clients"
        categoryOptions={[
          { value: 'business', label: 'Business services' },
          { value: 'ict', label: 'ICT services' },
          { value: 'training', label: 'ICT training' }
        ]}
        sortOptions={[
          { value: 'sort_order:asc', label: 'Display order' },
          { value: 'completed_at:desc', label: 'Most recent completion' },
          { value: 'updated_at:desc', label: 'Recently updated' },
          { value: 'title:asc', label: 'Title A–Z' }
        ]}
        columns={[
          { label: 'Project' },
          { label: 'Category' },
          { label: 'Completed' },
          { label: 'Publication' },
          { label: 'Updated' }
        ]}
        rowLabel={(row) => row.title}
        extraActions={(row) =>
          canManageImages ? (
            <Button variant="outline" small onClick={() => setGalleryProject(row)}>
              <Images className="h-3.5 w-3.5" aria-hidden="true" />
              Gallery
            </Button>
          ) : null
        }
        renderRow={(row) => [
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-navy-900">{row.title}</p>
              <SampleCell sample={row.is_sample} />
            </div>
            <p className="text-[11px] text-slate-400">/{row.slug}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{row.summary}</p>
          </div>,
          <div className="text-xs text-slate-600">
            <p className="capitalize">{humanize(row.category)}</p>
            <p className="text-[11px] text-slate-400">
              {row.client_name || 'Client not listed'}
            </p>
          </div>,
          <span className="text-xs text-slate-600">{formatDate(row.completed_at)}</span>,
          <div className="flex flex-wrap gap-1.5">
            <PublishedCell published={row.published} />
            {row.featured ? <Badge tone="teal">Featured</Badge> : null}
          </div>,
          <UpdatedCell value={row.updated_at} />
        ]}
        emptyMessage="No projects have been recorded yet. The public portfolio will show an honest empty state."
        headerNote={
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            Only publish project records that have been approved for public reference. Do not imply a
            client relationship, result or completion date that has not been verified.
          </p>
        }
      />

      {galleryProject ? (
        <ProjectImagesModal
          project={galleryProject}
          onClose={() => setGalleryProject(null)}
        />
      ) : null}
    </>
  );
}
