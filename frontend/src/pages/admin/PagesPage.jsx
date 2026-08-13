import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

import { useProducts } from '../../context/ProductContext';
import { box, Field, input, label, Modal, PageHeader } from './AdminUI';

export default function PagesPage() {
  const {
    pages,
    savePage,
    deletePage,
  } = useProducts();

  const [editing, setEditing] = useState(null);

  const blank = {
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    seoTitle: '',
    seoDescription: '',
    isPublished: true,
  };

  const save = async (event) => {
    event.preventDefault();

    try {
      await savePage(editing);
      toast.success('Page saved');
      setEditing(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Pages"
        subtitle="Create and manage Privacy, Terms, Shipping & Returns or any custom content page."
        action={
          <button
            type="button"
            onClick={() => setEditing({ ...blank })}
            className="bg-black text-white rounded-xl px-5 py-3 font-bold flex gap-2"
          >
            <Plus size={17} />
            New Page
          </button>
        }
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pages.map((page) => (
          <div key={page.id} className={`${box} p-5`}>
            <p className={label}>/{page.slug}</p>
            <h2 className="text-xl font-black mt-2">{page.title}</h2>
            <p className="text-sm text-black/45 mt-2 line-clamp-2">
              {page.excerpt || page.body}
            </p>

            <div className="flex gap-4 mt-5">
              <button
                type="button"
                className="font-bold"
                onClick={() => setEditing({ ...page })}
              >
                Edit
              </button>

              <button
                type="button"
                className="text-red-600 font-bold"
                onClick={async () => {
                  if (confirm('Delete page?')) {
                    try {
                      await deletePage(page.id);
                    } catch (error) {
                      toast.error(error.message);
                    }
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!editing}
        title={editing?.id ? 'Edit Page' : 'New Page'}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field title="Slug">
                <input
                  required
                  className={input}
                  value={editing.slug}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      slug: event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '-'),
                    })
                  }
                />
              </Field>

              <Field title="Title">
                <input
                  required
                  className={input}
                  value={editing.title}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      title: event.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <Field title="Excerpt">
              <textarea
                className={input}
                rows="2"
                value={editing.excerpt || ''}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    excerpt: event.target.value,
                  })
                }
              />
            </Field>

            <Field title="Body (Markdown)">
              <textarea
                required
                className={input}
                rows="12"
                value={editing.body || ''}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    body: event.target.value,
                  })
                }
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field title="SEO Title">
                <input
                  className={input}
                  value={editing.seoTitle || ''}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      seoTitle: event.target.value,
                    })
                  }
                />
              </Field>

              <Field title="SEO Description">
                <input
                  className={input}
                  value={editing.seoDescription || ''}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      seoDescription: event.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <label className="flex gap-2 items-center text-sm font-bold">
              <input
                type="checkbox"
                checked={editing.isPublished !== false}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    isPublished: event.target.checked,
                  })
                }
              />
              Published
            </label>

            <button className="w-full bg-black text-white py-4 rounded-xl font-bold">
              Save Page
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
