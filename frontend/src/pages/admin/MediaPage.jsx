import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

import { api } from '../../lib/api';
import { box, PageHeader } from './AdminUI';

export default function MediaPage() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get('/admin/media')
      .then(setFiles)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setBusy(true);

    try {
      await api.post('/admin/media', formData);
      toast.success('Image uploaded');
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  return (
    <>
      <PageHeader
        title="Media"
        subtitle="Upload images and copy their URLs into product/home content."
        action={
          <label className="bg-black text-white rounded-xl px-5 py-3 font-bold flex gap-2 cursor-pointer">
            <Upload size={17} />
            {busy ? 'Uploading...' : 'Upload Image'}

            <input
              disabled={busy}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={upload}
            />
          </label>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {files.map((file) => (
          <div key={file.url} className={`${box} p-2`}>
            <img
              src={file.url}
              alt=""
              className="w-full aspect-square object-cover rounded-xl"
            />

            <div className="grid grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard
                    .writeText(file.url)
                    .then(() => toast.success('URL copied'))
                }
                className="py-2 text-xs font-bold"
              >
                Copy URL
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete this image?')) {
                    try {
                      await api.delete(`/admin/media/${file.id}`);
                      toast.success('Image deleted');
                      load();
                    } catch (error) {
                      toast.error(error.message);
                    }
                  }
                }}
                className="py-2 text-xs font-bold text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
